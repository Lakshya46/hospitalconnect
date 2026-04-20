import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

// @desc    Register a new doctor
export const addDoctor = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) return res.status(404).json({ msg: "Hospital profile not found" });

    // 🛠️ PARSE DATA: FormData sends everything as strings
    const doctorData = { 
      ...req.body, 
      hospitalId: hospital._id,
      experience: Number(req.body.experience) || 0,
      schedule: req.body.schedule ? JSON.parse(req.body.schedule) : [] 
    };
    
    if (req.file) doctorData.image = req.file.path;

    const doctor = new Doctor(doctorData);
    await doctor.save();
    
    // Increment doctor count in Hospital profile
    await Hospital.findByIdAndUpdate(hospital._id, { $inc: { doctorsCount: 1 } });

    res.status(201).json({ msg: "Doctor added to registry", doctor });
  } catch (err) {
    console.error("Add Doctor Error:", err.message);
    res.status(500).json({ msg: "Failed to add doctor", error: err.message });
  }
};

// @desc    Update doctor profile
export const updateDoctor = async (req, res) => {
  try {
    const updates = { ...req.body };

    // 🛠️ PARSE DATA: Ensure types are correct for MongoDB
    if (updates.experience) updates.experience = Number(updates.experience);
    if (updates.schedule) {
        // Handle case where schedule might already be an object or is a JSON string
        updates.schedule = typeof updates.schedule === 'string' ? JSON.parse(updates.schedule) : updates.schedule;
    }
    if (req.file) updates.image = req.file.path;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, 
      { $set: updates }, 
      { new: true, runValidators: true }
    );

    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });

    res.json({ msg: "Doctor profile updated", doctor });
  } catch (err) {
    console.error("Update Doctor Error:", err.message);
    res.status(500).json({ msg: "Update failed", error: err.message });
  }
};

// @desc    Get single doctor details (Needed for the Edit Page)
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ msg: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ msg: "Fetch failed" });
  }
};

// @desc    Get all doctors for the logged-in hospital
export const getDoctors = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ userId: req.user.id });
    if (!hospital) return res.status(404).json({ msg: "Hospital not found" });

    const doctors = await Doctor.find({ hospitalId: hospital._id }).sort({ createdAt: -1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ msg: "Fetch failed" });
  }
};

// @desc    Delete doctor and decrement hospital count
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (doctor) {
      await Hospital.findByIdAndUpdate(doctor.hospitalId, { $inc: { doctorsCount: -1 } });
    }
    res.json({ msg: "Doctor removed successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Deletion failed" });
  }
};

// @desc    Quick status change (Available/Busy/Leave)
export const changeDoctorStatus = async (req, res) => {
  try {
    const { availability } = req.body;
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, 
      { availability }, 
      { new: true }
    );
    res.json({ msg: "Status updated", availability: doctor.availability });
  } catch (err) {
    res.status(500).json({ msg: "Status update failed" });
  }
};