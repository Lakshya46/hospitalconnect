import Notification from "../models/Notification.js";
import ResourceRequest from "../models/ResourceRequest.js";
import Hospital from "../models/Hospital.js";
import mongoose from "mongoose";

// @desc    Get notifications based on tab (live vs history)
export const getNotifications = async (req, res) => {
  try {
    const { tab } = req.query;
    // Check if req.user exists (Auth middleware check)
    if (!req.user) return res.status(401).json({ msg: "No user attached to request" });

    let query = { recipient: req.user.id };

    if (tab === "live") {
      query.status = "Pending";
    } else {
      query.status = { $in: ["Accepted", "Rejected"] };
    }

    const notifications = await Notification.find(query)
      .populate({
        path: "senderHospital",
        select: "name", // Only get the name
        model: Hospital // Explicitly tell Mongoose which model to use
      })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    // 🔥 This log is critical. Check your terminal after adding this.
    console.error("❌ Notification Fetch Error:", err); 
    res.status(500).json({ msg: "Failed to fetch notifications", error: err.message });
  }
};

// @desc    Handle Accept/Reject logic for a specific notification
export const handleNotificationAction = async (req, res) => {
  const { id } = req.params; // Notification ID
  const { action } = req.body; // "Accepted" or "Rejected"
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const notification = await Notification.findById(id).session(session);
    if (!notification) throw new Error("Notification not found");

    const request = await ResourceRequest.findById(notification.requestId).session(session);
    if (!request) throw new Error("Linked Resource Request not found");

    // 1. If Accepted, Deduct Inventory
    if (action === "Accepted") {
      const provider = await Hospital.findOne({ userId: req.user.id }).session(session);
      if (!provider) throw new Error("Hospital profile not found");

      for (const item of request.items) {
        if (item.category === "Supplies") {
          const key = item.type === "Oxygen" ? "oxygen" : "icu";
          if (provider[key].available < item.quantity) throw new Error(`Insufficient ${item.type}`);
          provider[key].available -= item.quantity;
        } else if (item.category === "Blood") {
          const bloodKey = item.type.replace("+", "_pos").replace("-", "_neg");
          if (provider.bloodBank[bloodKey] < item.quantity) throw new Error(`Insufficient ${item.type} Blood`);
          provider.bloodBank[bloodKey] -= item.quantity;
        }
      }
      await provider.save({ session });
      request.status = "Accepted";
      request.receiverHospitalId = provider._id;
    } else {
      request.status = "Rejected";
    }

    // 2. Update Notification Status
    notification.status = action;
    notification.read = true;
    
    await notification.save({ session });
    await request.save({ session });

    await session.commitTransaction();
    res.json({ msg: `Request ${action}`, notification });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ msg: err.message });
  } finally {
    session.endSession();
  }
};