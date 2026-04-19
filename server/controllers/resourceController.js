import ResourceRequest from "../models/ResourceRequest.js";
import Hospital from "../models/Hospital.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import webpush from "web-push";

// Config web-push
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@ehospital.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

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

    // Populate userId to get the pushSubscription object from the User model
    const otherHospitals = await Hospital.find({ _id: { $ne: hospital._id } }).populate("userId");

    if (otherHospitals.length > 0) {
      const sanitizedItems = req.body.items.map(item => ({
        category: item.category,
        type: item.type,
        quantity: Number(item.quantity)
      }));

      // 1. Create DB Documents (for the notification history panel)
      const notificationDocs = otherHospitals.map(hosp => ({
        recipient: hosp.userId._id, 
        senderHospital: hospital._id,
        type: "urgent",
        title: "🚨 New Resource Request",
        message: `${hospital.name} requires medical resources.`,
        items: sanitizedItems,
        priority: req.body.urgency,
        isActionable: true,
        requestId: newRequest._id,
        status: "Pending"
      }));

      await Notification.insertMany(notificationDocs);

      // 2. 🔥 WEB-PUSH LOGIC
      const payload = JSON.stringify({
        title: "🚨 New Resource Request",
        body: `${hospital.name} requires ${sanitizedItems[0]?.type || 'resources'}`,
        icon: "/logo.png",
        // This 'url' field is used by your sw.js notificationclick event
        url: "/hospital-admin/resource-request" 
      });

      otherHospitals.forEach(hosp => {
        // 🔥 FIX: Changed .subscription to .pushSubscription to match your User Schema
        if (hosp.userId && hosp.userId.pushSubscription) {
          webpush.sendNotification(hosp.userId.pushSubscription, payload)
            .catch(err => {
              if (err.statusCode === 410) {
                console.log(`Subscription expired for user: ${hosp.userId._id}`);
                // Optional: Remove expired subscription from DB here
              } else {
                console.error("Push Error:", err.message);
              }
            });
        }
      });

      console.log(`✅ Generated ${notificationDocs.length} notifications and triggered Push.`);
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

    request.status = "Accepted";
    request.receiverHospitalId = provider._id;

    await provider.save({ session });
    await request.save({ session });

    await session.commitTransaction();
    res.json({ msg: "Request accepted", request });
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ acceptRequest Error:", err.message);
    res.status(400).json({ msg: err.message });
  } finally {
    session.endSession();
  }
};