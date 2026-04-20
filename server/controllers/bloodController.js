
import Hospital from "../models/Hospital.js";


export const addBlood = async (req, res) => {
    try {
      const hospital = await Hospital.findOne({ userId: req.user.id }).select("bloodBank");
      if (!hospital) {
        return res.status(404).json({ success: false, msg: "Hospital not found" });
      }
      res.json(hospital.bloodBank || {});
    } catch (err) {
      res.status(500).json({ success: false, msg: "Server Error" });
    }
}





export const updateBlood = async (req, res) => {
    try {
      const { type, quantity, action } = req.body;
      const numQuantity = Number(quantity);

      if (!numQuantity || numQuantity <= 0) {
        return res.status(400).json({ success: false, msg: "Invalid quantity" });
      }

      // Create the dynamic key for the update
      const increment = action === "add" ? numQuantity : -numQuantity;
      const updateKey = `bloodBank.${type}`;

      // If action is "use", check stock first
      if (action === "use") {
        const hospital = await Hospital.findOne({ userId: req.user.id });
        if ((hospital.bloodBank[type] || 0) < numQuantity) {
          return res.status(400).json({ success: false, msg: "Insufficient stock" });
        }
      }

      // 🔥 USE findOneAndUpdate with $inc
      // This bypasses the 'beds' validation error you are seeing
      const updatedHospital = await Hospital.findOneAndUpdate(
        { userId: req.user.id },
        { $inc: { [updateKey]: increment } },
        { new: true }
      );

      res.json({
        success: true,
        msg: "Inventory updated",
        bloodBank: updatedHospital.bloodBank
      });

    } catch (err) {
      console.error("BLOOD UPDATE CRASH:", err.message);
      res.status(500).json({ success: false, msg: err.message });
    }
  }



