import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({

  /* 🔗 LINK WITH USER (FOR AUTHENTICATION) */
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  /* 🏥 BASIC IDENTITY */
  name: {
    type: String,
    required: true,
    trim: true
  },

  /* 🏥 SPECIALTY CATEGORIES (MULTIPLE) */
  type: [{
    type: String,
    enum: [
      "General Hospital", "Multi-Specialty", "Super-Specialty",
      "Cardiac Center", "Cancer / Oncology", "Pediatric (Children)",
      "Maternity / Gynecology", "Orthopedic (Bones)", "Neurology",
      "Eye Care (Ophthalmology)", "ENT (Ear, Nose, Throat)", "Dental Clinic",
      "Psychiatric / Mental Health", "Trauma & Emergency", "Ayurvedic / Homeopathy",
      "Diagnostic Center", "Rehabilitation Center"
    ]
  }],

  /* 📍 PUBLIC CONTACT & LOCATION */
  // 'location' is the automated string from the Map Search (Bhopal, MP, etc.)
  location: {
    type: String,
    trim: true
  },
  // 'address' is the manual specific field (Building No, Street, etc.)
  address: {
    type: String,
    trim: true
  },
  // 'email' is the public contact email shown to patients
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  // 'contact' is the emergency phone line
  contact: {
    type: String,
    trim: true
  },

  /* 🗺️ GEO-SPATIAL LOCATION (FOR MAP & SEARCH) */
  coordinates: {
    type: {
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: {
      type: [Number], // [Longitude, Latitude]
      required: true,
      default: [77.4126, 23.2599] 
    }
  },

  /* 🛏️ MEDICAL CAPACITY */
  beds: {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  icu: {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },
  oxygen: {
    total: { type: Number, default: 0 },
    available: { type: Number, default: 0 }
  },

  /* 🚑 STATUS & AMENITIES */
  emergencyStatus: {
    isEROpen: { type: Boolean, default: true },
    isAmbulanceAvailable: { type: Boolean, default: false }
  },
  facilities: {
    hasPharmacy: { type: Boolean, default: false },
    hasLab: { type: Boolean, default: false },
    hasRadiology: { type: Boolean, default: false }, 
    hasVentilator: { type: Boolean, default: false }
  },

  /* 🩸 BLOOD INVENTORY */
  bloodBank: {
    A_pos: { type: Number, default: 0 }, A_neg: { type: Number, default: 0 },
    B_pos: { type: Number, default: 0 }, B_neg: { type: Number, default: 0 },
    O_pos: { type: Number, default: 0 }, O_neg: { type: Number, default: 0 },
    AB_pos: { type: Number, default: 0 }, AB_neg: { type: Number, default: 0 }
  },

  /* 👨‍⚕️ STAFFING */
  doctorsCount: { type: Number, default: 0 },
  departments: [String],

  /* 📝 PUBLIC PROFILE DATA */
  description: { type: String, trim: true },
  openingTime: {
      type: String, // "09:00"
      default: "09:00",
    },
    closingTime: {
      type: String, // "21:00"
      default: "21:00",
    },
    workingDays: {
      type: [String], 
      default: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },

  /* 🟢 VERIFICATION & SECURITY */
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },

  /* 🖼️ MEDIA ASSETS */
  image: { 
    type: String, 
    default: "" 
  },
  coverPhoto: { 
    type: String, 
    default: "" 
  }

}, { timestamps: true });

/* ⚡ INDEXING FOR PROXIMITY SEARCH (Find nearby hospitals) */
hospitalSchema.index({ coordinates: "2dsphere" });

export default mongoose.model("Hospital", hospitalSchema);