import e from "cors";
import Appointment from "../models/Appointment.js";
import Hospital from "../models/Hospital.js";





// --- 1. PATIENT: GET MY APPOINTMENTS ---
export const getPatientAppointments =    async (req, res) => {
    try {
      const appointments = await Appointment.find({ patientId: req.user.id })
        .populate("hospitalId", "name address logo")
        .populate("doctorId", "name specialization image")
        .sort({ date: -1 });

      res.json(appointments);
    } catch (err) {
      res.status(500).json({ msg: "Failed to fetch appointments", error: err.message });
    }
  }

// --- 2. PATIENT: BOOK APPOINTMENT ---
export const bookAppointment = async (req, res) => {
  try {
    const { hospitalId, doctorId, date, time, reason } = req.body;
    const newAppointment = new Appointment({
      patientId: req.user.id,
      hospitalId,
      doctorId,
      date,
      time,
      reason,
      status: "Pending" 
    });
    const savedApp = await newAppointment.save();
    res.status(201).json({ msg: "Appointment requested!", appointment: savedApp });
  } catch (err) {
    res.status(500).json({ msg: "Booking failed", error: err.message });
  }
}



// --- 3. PATIENT: CANCEL APPOINTMENT ---
// Matches: api.patch(`/api/appointment/${id}/cancel`)
export const cancelAppointment = async (req, res) => {
    try {
      const appointment = await Appointment.findOne({ 
        _id: req.params.id, 
        patientId: req.user.id // Security: Ensure patient owns the appt
      });

      if (!appointment) return res.status(404).json({ msg: "Appointment not found" });

      appointment.status = "Cancelled";
      await appointment.save();

      res.json({ msg: "Appointment cancelled successfully", appointment });
    } catch (err) {
      res.status(500).json({ msg: "Cancellation failed", error: err.message });
    }
  }


// --- 4. PATIENT/HOSPITAL: RESCHEDULE APPOINTMENT ---
// Matches: api.patch(`/api/appointment/${id}/reschedule`)
export const rescheduleAppointment =   async (req, res) => {
    try {
      const { date, time } = req.body;

      if (!date || !time) {
        return res.status(400).json({ msg: "New date and time are required" });
      }

      const updatedAppointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { 
          date, 
          time, 
          rescheduled: true,
          status: "Pending" // Reset to Pending for re-approval
        },
        { new: true }
      );

      if (!updatedAppointment) return res.status(404).json({ msg: "Appointment not found" });

      res.json({ msg: "Appointment rescheduled successfully", appointment: updatedAppointment });
    } catch (err) {
      res.status(500).json({ msg: "Server Error during rescheduling", error: err.message });
    }
  }


// --- 5. HOSPITAL: GET APPOINTMENT LIST ---
export const getHospitalAppointments =   async (req, res) => {
    try {
      const hospitalProfile = await Hospital.findOne({ userId: req.user.id });
      if (!hospitalProfile) return res.status(404).json({ msg: "Hospital profile not found" });

      const list = await Appointment.find({ hospitalId: hospitalProfile._id })
        .populate("patientId", "name phone email profilePic")
        .populate("doctorId", "name specialization") 
        .sort({ date: 1, time: 1 });

      res.json(list);
    } catch (err) {
      res.status(500).json({ msg: "Fetch failed", error: err.message });
    }
  }


// --- 6. HOSPITAL: UPDATE STATUS ---
export const updateAppointmentStatusHospital = async (req, res) => {
    try {
      const { status } = req.body; 
      const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { status },
        { new:true }
      );
      if (!appointment) return res.status(404).json({ msg: "Appointment not found" });
      res.json({ msg: `Status updated to ${status}`, appointment });
    } catch (err) {
      res.status(500).json({ msg: "Update failed", error: err.message });
    }
  }
