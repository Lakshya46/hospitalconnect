import Appointment from "../models/Appointment.js";
import Hospital from "../models/Hospital.js";

// @desc    Patient books a new appointment
// @route   POST /api/appointments/book
export const bookAppointment = async (req, res) => {
  try {
    const { hospitalId, doctorId, date, time, reason } = req.body;

    const appointment = new Appointment({
      patientId: req.user.id, // From Auth Middleware
      hospitalId,
      doctorId,
      date,
      time,
      reason,
      status: "Pending"
    });

    await appointment.save();
    res.status(201).json({ msg: "Appointment requested successfully", appointment });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

// @desc    Hospital views all their appointments
// @route   GET /api/hospital/appointments
export const getHospitalAppointments = async (req, res) => {
  try {
    // We find the Hospital record associated with the logged-in User
    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) return res.status(404).json({ msg: "Hospital profile not found" });

    const appointments = await Appointment.find({ hospitalId: hospital._id })
      .populate("patientId", "name email phone") // Get Patient details
      .populate("doctorId", "name specialization") // Get Doctor details
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching data" });
  }
};

// @desc    Update Appointment (Approve/Complete/Reject)
// @route   PUT /api/appointments/:id/status
export const updateStatus = async (req, res) => {
  try {
    const { status, prescription } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, prescription },
      { new: true }
    );
    res.json({ msg: `Appointment ${status}`, appointment });
  } catch (error) {
    res.status(500).json({ msg: "Update failed" });
  }
};


exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update status to Cancelled
    appointment.status = "Cancelled";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Reschedule an appointment
// @route   PATCH /api/appointment/:id/reschedule
exports.rescheduleAppointment = async (req, res) => {
  const { date, time } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update fields
    appointment.date = date;
    appointment.time = time;
    appointment.rescheduled = true;
    appointment.status = "Pending"; // Set back to pending for hospital approval

    await appointment.save();

    res.status(200).json({ message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};