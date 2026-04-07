import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { MdEmail, MdLockOutline, MdArrowForward } from "react-icons/md";

export default function Login() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [role, setRole] = useState("patient");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/auth/login`, formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      // Enhanced Role-Based Redirect
      const routes = {
        hospital: "/hospital-admin/dashboard",
        patient: "/patient/dashboard",
        admin: "/admin/dashboard",
      };
      
      navigate(routes[user.role] || "/");
    } catch (err) {
      alert(err.response?.data?.msg || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-100 rounded-full blur-[120px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-60"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl w-full max-w-md p-10 rounded-[32px] shadow-2xl shadow-slate-200 border border-white"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-rose-600 rounded-2xl text-white text-3xl font-black mb-4 shadow-xl shadow-rose-200"
          >
            H
          </motion.div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 font-medium mt-2">Access the Hospital Connect Network</p>
        </div>

        {/* ROLE SELECTOR */}
        <div className="flex mb-8 bg-slate-100 rounded-2xl p-1.5 relative">
          {["patient", "hospital", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                role === r ? "text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r}
              {role === r && (
                <motion.div 
                  layoutId="activeRole"
                  className="absolute inset-0 bg-slate-900 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none font-medium"
                required
              />
            </div>

            <div className="relative">
              <MdLockOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all outline-none font-medium"
                required
              />
            </div>
          </div>

          <div className="text-right">
            <a href="#" className="text-xs font-bold text-rose-600 hover:text-rose-700">Forgot Password?</a>
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${
              loading 
              ? "bg-slate-400 cursor-not-allowed" 
              : "bg-rose-600 text-white shadow-rose-200 hover:bg-rose-700"
            }`}
          >
            {loading ? "Authenticating..." : `Login as ${role}`}
            {!loading && <MdArrowForward />}
          </motion.button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          New to the network? 
          <Link to="/signup" className="text-rose-600 ml-1 font-bold hover:underline">
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}