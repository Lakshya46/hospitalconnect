import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { MdPerson, MdEmail, MdPhone, MdLock, MdBusiness, MdAssignmentTurnedIn, MdArrowForward } from "react-icons/md";

export default function Signup() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [role, setRole] = useState("patient");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    hospitalName: "",
    licenseNumber: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.phone.length !== 10) {
      alert("Enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role,
        phone: formData.phone
      };

      if (role === "hospital") {
        payload.hospitalName = formData.hospitalName;
        payload.licenseNumber = formData.licenseNumber;
      }

      const res = await axios.post(`${API}/api/auth/signup`, payload);
      
      // We usually redirect to login after signup to ensure the user 
      // goes through the full AuthContext flow, or you can log them in directly.
      if (role === "hospital") {
        // Local storage set here allows the profile edit page to access the token
        localStorage.setItem("token", res.data.token);
        navigate("/hospital-admin/profile/edit");
      } else {
        alert("Registration successful! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-100 rounded-full blur-[120px] opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/80 backdrop-blur-xl w-full max-w-lg p-10 rounded-[40px] shadow-2xl shadow-slate-200 border border-white"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-medium mt-2">Join the interconnected healthcare network</p>
        </div>

        {/* ROLE SELECTOR - Admin Removed */}
        <div className="flex mb-8 bg-slate-100 rounded-2xl p-1.5 relative">
          {["patient", "hospital"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                role === r ? "text-white" : "text-slate-500"
              }`}
            >
              {r}
              {role === r && (
                <motion.div 
                  layoutId="activeSignupRole"
                  className="absolute inset-0 bg-slate-900 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput icon={<MdPerson />} name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
            <FormInput icon={<MdEmail />} name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          </div>

          <FormInput icon={<MdPhone />} name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput icon={<MdLock />} name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
            <FormInput icon={<MdLock />} name="confirmPassword" type="password" placeholder="Confirm" value={formData.confirmPassword} onChange={handleChange} />
          </div>

          {/* HOSPITAL SPECIFIC FIELDS */}
          <AnimatePresence mode="wait">
            {role === "hospital" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden pt-2"
              >
                <div className="h-px bg-slate-100 w-full mb-4" />
                <FormInput icon={<MdBusiness />} name="hospitalName" placeholder="Hospital Name" value={formData.hospitalName} onChange={handleChange} />
                <FormInput icon={<MdAssignmentTurnedIn />} name="licenseNumber" placeholder="Medical License Number" value={formData.licenseNumber} onChange={handleChange} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all mt-6 ${
              loading 
              ? "bg-slate-400 cursor-not-allowed" 
              : "bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700"
            }`}
          >
            {loading ? "Registering..." : `Register as ${role}`}
            {!loading && <MdArrowForward />}
          </motion.button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          Already have an account? 
          <Link to="/login" className="text-rose-600 ml-1 font-bold hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function FormInput({ icon, ...props }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none font-medium text-sm"
        required
      />
    </div>
  );
}