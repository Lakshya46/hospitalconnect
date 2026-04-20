import Hospital from "../models/Hospital.js";
import Appointment from "../models/Appointment.js";

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Identify the Hospital
    const hospital = await Hospital.findOne({ userId: req.user.id });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital profile not found" });
    }

    // 2. Fetch Appointments & Populate patient details
    // Added "profilePic" to the population string
    const appointments = await Appointment.find({ hospitalId: hospital._id })
      .sort({ createdAt: -1 }) 
      .limit(5)
      .populate("patientId", "name profilePic"); 

    // 3. Format Resources
    const stats = {
      resources: [
        { 
          label: "General Beds", 
          current: hospital.beds.available, 
          total: hospital.beds.total, 
          color: "rose" 
        },
        { 
          label: "ICU Units", 
          current: hospital.icu.available, 
          total: hospital.icu.total, 
          color: "indigo" 
        },
        { 
          label: "Oxygen Supply", 
          current: hospital.oxygen.available, 
          total: hospital.oxygen.total, 
          color: "emerald" 
        }
      ],

      // 4. Transform blood bank data
      bloodGroups: [
        { type: "A+", units: hospital.bloodBank.A_pos },
        { type: "A-", units: hospital.bloodBank.A_neg },
        { type: "B+", units: hospital.bloodBank.B_pos },
        { type: "B-", units: hospital.bloodBank.B_neg },
        { type: "O+", units: hospital.bloodBank.O_pos },
        { type: "O-", units: hospital.bloodBank.O_neg },
        { type: "AB+", units: hospital.bloodBank.AB_pos },
        { type: "AB-", units: hospital.bloodBank.AB_neg },
      ],

      // 5. Format Appointments with Patient Image
      appointments: appointments.map(apt => ({
        _id: apt._id,
        patientName: apt.patientId?.name || "Unknown Patient",
        // Pass the profilePic to the frontend
        patientImage: apt.patientId?.profilePic || null, 
        time: `${apt.date} at ${apt.time}`,
        reason: apt.reason || "Consultation",
        status: apt.status,
        // Optional: Adding priority logic for your UI indicators
        priority: apt.status === "Urgent" ? "High" : "Normal" 
      }))
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};