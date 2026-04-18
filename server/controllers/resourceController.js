import ResourceRequest from "../models/ResourceRequest.js";
import Hospital from "../models/Hospital.js";
import mongoose from "mongoose";
import User from "../models/User.js"; // For fetching subscribers
import Notification from "../models/Notification.js"; // For logging notifications
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:admin@ehospital.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
// @desc    Broadcast or Direct Request
// controllers/resourceController.js

export const createRequest = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) return res.status(404).json({ msg: "Hospital profile not found" });

    // 1. Save the Resource Request
    const newRequest = new ResourceRequest({
      ...req.body,
      senderHospitalId: hospital._id,
      isBroadcast: !req.body.receiverHospitalId
    });
    await newRequest.save();

    // 2. Find target users (hospitals)
    const subscribers = await User.find({ 
      role: "hospital", 
      _id: { $ne: req.user.id } 
    });

    // --- 🔔 DATABASE NOTIFICATION LOGIC ---
    // Create persistent records so they appear in the Notification Panel
    const notificationDocs = subscribers.map(user => ({
      recipient: user._id,
      senderHospital: hospital._id,
      type: "urgent",
      title: "🚨 Emergency Resource Request",
      message: `${hospital.name} needs ${req.body.items[0].type}`,
      isActionable: true,
      requestId: newRequest._id,
      status: "Pending"
    }));

    await Notification.insertMany(notificationDocs);

    // --- 📲 PUSH NOTIFICATION LOGIC ---
    const payload = JSON.stringify({
      title: "🚨 Emergency Resource Request",
      body: `${hospital.name} needs ${req.body.items[0].type}. Can you help?`,
      url: "/hospital-admin/notifications" // Point to your new notification page
    });

    subscribers.forEach(user => {
      if (user.pushSubscription) {
        webpush.sendNotification(user.pushSubscription, payload)
          .catch(err => {
            if (err.statusCode === 410) {
              user.pushSubscription = null;
              user.save();
            }
          });
      }
    });

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

// @desc    Accept a request and deduct inventory
export const acceptRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const request = await ResourceRequest.findById(req.params.id).session(session);
    const provider = await Hospital.findOne({ userId: req.user.id }).session(session);

    if (!request) throw new Error("Request not found");
    if (request.status !== "Pending") throw new Error("Request already handled");

    // 🔥 MAP ITEMS TO YOUR SPECIFIC MODEL SCHEMA
    for (const item of request.items) {
      if (item.category === "Supplies") {
        if (item.type === "Oxygen") {
          if (provider.oxygen.available < item.quantity) throw new Error("Low Oxygen stock");
          provider.oxygen.available -= item.quantity;
        } else if (item.type === "ICU Bed") {
          if (provider.icu.available < item.quantity) throw new Error("No ICU beds available");
          provider.icu.available -= item.quantity;
        }
      } 
      
      else if (item.category === "Blood") {
        // Map frontend "A+" to model "A_pos"
        const bloodKey = item.type.replace("+", "_pos").replace("-", "_neg");
        if (provider.bloodBank[bloodKey] < item.quantity) {
          throw new Error(`Insufficient ${item.type} in Blood Bank`);
        }
        provider.bloodBank[bloodKey] -= item.quantity;
      }
      
      // Note: Doctors usually don't "deduct" from a count in the same way, 
      // but you could add logic here to mark a doctor as "on-call" or "busy".
    }

    request.status = "Accepted";
    request.receiverHospitalId = provider._id;

    // Save both within the transaction
    await provider.save({ session });
    await request.save({ session });

    await session.commitTransaction();
    
    // Notify Sender via Socket
    const io = req.app.get("socketio");
    if (io) {
      io.emit(`update-${request.senderHospitalId}`, { 
        msg: "Request Accepted", 
        id: request._id,
        providerName: provider.name 
      });
    }

    res.json({ msg: "Request accepted and resources allocated", request });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ msg: err.message });
  } finally {
    session.endSession();
  }
};