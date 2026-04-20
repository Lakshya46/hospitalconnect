import Notification from "../models/Notification.js";
import ResourceRequest from "../models/ResourceRequest.js";
import Hospital from "../models/Hospital.js";
import mongoose from "mongoose";
import { getIO } from "../config/socket.js";

// @desc    Get notifications based on tab (live vs history)
export const getNotifications = async (req, res) => {
  try {
    const { tab } = req.query;
    let query = { recipient: req.user.id };

    if (tab === "live") {
      // ✅ Now including 'Pending' only. 'Cancelled' requests shouldn't show in Live.
      query.status = "Pending";
    } else {
      // ✅ History now includes Accepted, Rejected, and Cancelled (Withdrawn)
      query.status = { $in: ["Accepted", "Rejected", "Cancelled"] };
    }

    const notifications = await Notification.find(query)
      .populate("senderHospital", "name _id")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch notifications" });
  }
};

// @desc    Handle Accept/Reject logic for a specific notification
export const handleNotificationAction = async (req, res) => {
  const { id } = req.params; 
  const { action } = req.body; 
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const notification = await Notification.findById(id).session(session);
    if (!notification) throw new Error("Notification not found");

    // 🔥 CHECK: If the request was already cancelled by the sender
    if (notification.status === "Cancelled") {
      throw new Error("This request has been withdrawn by the sender.");
    }

    const request = await ResourceRequest.findById(notification.requestId).session(session);
    if (!request) throw new Error("Linked Resource Request not found");

    const provider = await Hospital.findOne({ userId: req.user.id }).session(session);
    if (!provider) throw new Error("Hospital profile not found");

    if (action === "Accepted") {
      // ... (Deduction Logic remains the same)
      for (const item of request.items) {
        if (item.category === "Supplies") {
          let key = item.type === "Oxygen" ? "oxygen" : item.type === "ICU Bed" ? "icu" : "beds";
          if (!provider[key] || provider[key].available < item.quantity) {
            throw new Error(`Insufficient ${item.type} available`);
          }
          provider[key].available -= item.quantity;
        } else if (item.category === "Blood") {
          const bloodKey = item.type.replace("+", "_pos").replace("-", "_neg");
          if (!provider.bloodBank[bloodKey] || provider.bloodBank[bloodKey] < item.quantity) {
            throw new Error(`Insufficient ${item.type} Blood stock`);
          }
          provider.bloodBank[bloodKey] -= item.quantity;
        }
      }
      await provider.save({ session });
      request.status = "Accepted";
      request.receiverHospitalId = provider._id;
    } else {
      if (!request.isBroadcast) {
        request.status = "Rejected";
      }
    }

    notification.status = action;
    notification.read = true;
    
    await notification.save({ session });
    await request.save({ session });

    await session.commitTransaction();

    const io = getIO();
    // A. Notify SENDER
    io.to(request.senderHospitalId.toString()).emit("request_status_updated", {
      requestId: request._id,
      status: action,
      receiverHospital: { _id: provider._id, name: provider.name }
    });

    // B. If Accepted, Update PROVIDER'S local UI
    if (action === "Accepted") {
      io.to(provider._id.toString()).emit("resource_update", {
        beds: provider.beds,
        icu: provider.icu,
        oxygen: provider.oxygen,
        bloodBank: provider.bloodBank
      });
    }

    res.json({ msg: `Request ${action}`, notification });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ msg: err.message });
  } finally {
    session.endSession();
  }
};