import ResourceRequest from "../models/ResourceRequest.js";
import Hospital from "../models/Hospital.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import webpush from "web-push";
import { getIO } from "../config/socket.js";
// Config web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@ehospital.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// controllers/resourceController.js
// controllers/resourceController.js

export const createRequest = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) return res.status(404).json({ msg: "Hospital profile not found" });

    const newRequest = new ResourceRequest({
      ...req.body,
      senderHospitalId: hospital._id,
      isBroadcast: !req.body.receiverHospitalId
    });
    await newRequest.save();

    const otherHospitals = await Hospital.find({ _id: { $ne: hospital._id } }).populate("userId");

    if (otherHospitals.length > 0) {
      const sanitizedItems = req.body.items.map(item => ({
        category: item.category,
        type: item.type,
        quantity: Number(item.quantity)
      }));

      // Create DB Notifications
      const notificationDocs = otherHospitals.map(hosp => ({
        recipient: hosp.userId._id, 
        senderHospital: hospital._id,
        title: "🚨 New Resource Request",
        message: `${hospital.name} requires medical resources.`,
        items: sanitizedItems,
        priority: req.body.urgency,
        isActionable: true,
        requestId: newRequest._id,
        status: "Pending"
      }));

      const createdNotes = await Notification.insertMany(notificationDocs);

      // --- 🔥 REAL-TIME SOCKET LOGIC ---
      const io = getIO();
      
      otherHospitals.forEach((hosp, index) => {
        // Use the notification document created for THIS specific hospital
        const specificNote = createdNotes[index];

        // Emit only to this hospital's room
        io.to(hosp._id.toString()).emit("new_notification", {
          ...specificNote._doc,
          senderHospital: { name: hospital.name, _id: hospital._id } // Send sender details for the UI link
        });
      });
      // ---------------------------------

      // Web Push Logic (keep existing)
      const payload = JSON.stringify({
        title: "🚨 New Resource Request",
        body: `${hospital.name} requires ${sanitizedItems[0]?.type || 'resources'}`,
        icon: "/logo.png",
        url: "/hospital-admin/notifications" 
      });

      otherHospitals.forEach(hosp => {
        if (hosp.userId && hosp.userId.pushSubscription) {
          webpush.sendNotification(hosp.userId.pushSubscription, payload).catch(err => console.error(err));
        }
      });
    }

    res.status(201).json(newRequest);
  } catch (err) {
    console.error("❌ createRequest Error:", err);
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};


export const acceptRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const request = await ResourceRequest.findById(req.params.id).session(session);
    const provider = await Hospital.findOne({ userId: req.user.id }).session(session);

    if (!request) throw new Error("Request not found");
    if (request.status !== "Pending") throw new Error("Request already handled or cancelled");

    // 1. Deduct Inventory Logic
    for (const item of request.items) {
      if (item.category === "Supplies") {
        if (item.type === "Oxygen") {
          if (provider.oxygen.available < item.quantity) throw new Error("Low Oxygen stock");
          provider.oxygen.available -= item.quantity;
        } 
        else if (item.type === "ICU Bed") {
          if (provider.icu.available < item.quantity) throw new Error("No ICU beds available");
          provider.icu.available -= item.quantity;
        }
        else if (item.type === "General Bed") {
          if (provider.beds.available < item.quantity) throw new Error("No General beds available");
          provider.beds.available -= item.quantity;
        }
      } 
      else if (item.category === "Blood") {
        const bloodKey = item.type.replace("+", "_pos").replace("-", "_neg");
        if (!provider.bloodBank[bloodKey] || provider.bloodBank[bloodKey] < item.quantity) {
          throw new Error(`Insufficient ${item.type} in Blood Bank`);
        }
        provider.bloodBank[bloodKey] -= item.quantity;
      }
    }

    // 2. Update Status
    request.status = "Accepted";
    request.receiverHospitalId = provider._id;

    await provider.save({ session });
    await request.save({ session });

    await session.commitTransaction();

    // --- 🔥 REAL-TIME SOCKET TRIGGERS ---
    const io = getIO();
    
    // A. Update the SENDER (Hospital A) so their "Request Status" changes instantly
    io.to(request.senderHospitalId.toString()).emit("request_status_updated", {
      requestId: request._id,
      status: "Accepted",
      receiverHospital: { name: provider.name, _id: provider._id }
    });

    // B. Update the PROVIDER'S Dashboard (Hospital B) so their Bed/Oxygen counts drop live
    io.to(provider._id.toString()).emit("resource_update", {
      beds: provider.beds,
      icu: provider.icu,
      oxygen: provider.oxygen,
      bloodBank: provider.bloodBank
    });

    res.json({ msg: "Request accepted", request });
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ acceptRequest Error:", err.message);
    res.status(400).json({ msg: err.message });
  } finally {
    session.endSession();
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id });
    
    if (!hospital) {
      return res.status(404).json({ msg: "Hospital profile not found" });
    }

    const request = await ResourceRequest.findOne({ 
      _id: req.params.id, 
      senderHospitalId: hospital._id 
    });

    if (!request) {
      return res.status(404).json({ msg: "Request not found or unauthorized to withdraw" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ 
        msg: `Cannot withdraw request. Current status is already ${request.status}.` 
      });
    }

    // 1. Update Resource Request status to Cancelled
    request.status = "Cancelled";
    await request.save();

    // 2. 🔥 UPDATE DATABASE NOTIFICATIONS
    // This ensures if someone refreshes, they see the status as Cancelled
    await Notification.updateMany(
      { requestId: request._id },
      { status: "Cancelled", isActionable: false }
    );

    // 3. 🔥 REAL-TIME SOCKET TRIGGER
    const io = getIO();
    
    // Broadcast to all hospitals that this specific request is now void
    // The frontend should listen for "notification_cancelled" to remove it from the UI
    io.emit("notification_cancelled", {
      requestId: request._id,
      status: "Cancelled"
    });

    res.json({ 
      msg: "Resource request successfully withdrawn", 
      requestId: request._id 
    });
    
  } catch (err) {
    console.error("Cancel Request Error:", err);
    res.status(500).json({ msg: "Server error during cancellation" });
  }
};