import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";

/* ICONS */
import {
  MdDashboard, MdEventAvailable, MdVerified, MdInventory2,
  MdBloodtype, MdPeople, MdPersonAdd, MdLogout, MdMenu,
  MdChevronLeft, MdAccountCircle, MdNotificationsNone, MdArrowForwardIos,
  MdLocalHospital
} from "react-icons/md";

const DEFAULT_LOGO = "https://img.icons8.com/fluency/200/hospital-room.png";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get("/api/hospital/me");
        setHospital(res.data);
      } catch (err) {
        console.error("Sidebar Data Error:", err);
      }
    };
    fetchHospital();
  }, []);

  const menu = [
    { name: "Dashboard", path: "/hospital-admin/dashboard", icon: <MdDashboard /> },
    { name: "Hospitals", path: "/hospital-admin/hospitals", icon: <MdVerified /> },
    { name: "Appointments", path: "/hospital-admin/appointments", icon: <MdEventAvailable /> },
    { name: "Resources", path: "/hospital-admin/resources", icon: <MdInventory2 /> },
    { name: "Blood Bank", path: "/hospital-admin/blood", icon: <MdBloodtype /> },
    { name: "Patients", path: "/hospital-admin/patients", icon: <MdPeople /> },
    { name: "Staff", path: "/hospital-admin/doctor", icon: <MdPersonAdd /> },
    { name: "Inbox", path: "/hospital-admin/notifications", icon: <MdNotificationsNone /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <motion.div 
      animate={{ width: collapsed ? 80 : 260 }} 
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 h-screen bg-white text-slate-600 z-[100] flex flex-col justify-between border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* 1. TOP HEADER (Brand & Toggle) */}
      <div className={`h-16 flex items-center px-4 ${collapsed ? 'justify-center' : 'justify-between'} border-b border-slate-50`}>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 pl-1"
          >
            <MdLocalHospital className="text-rose-600 text-xl" />
            <span className="text-slate-900 font-black tracking-tighter text-base italic">
              Hospital<span className="text-rose-600 font-bold">Connect</span>
            </span>
          </motion.div>
        )}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-xl transition-all border ${
            collapsed 
            ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-100" 
            : "bg-slate-50 text-slate-400 border-slate-100 hover:text-rose-600 hover:bg-rose-50"
          }`}
        >
          {collapsed ? <MdMenu size={20} /> : <MdChevronLeft size={20} />}
        </button>
      </div>

      {/* 2. NAVIGATION AREA */}
      <div className="flex-1 overflow-y-auto px-3 py-6 custom-scrollbar">
        <nav className="space-y-1.5">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? "bg-rose-50 text-rose-600 shadow-sm" 
                    : "hover:bg-slate-50 text-slate-500 hover:text-slate-900"
                  }`}
              >
                <div className={`text-2xl min-w-[32px] flex justify-center transition-transform group-hover:scale-110 ${isActive ? "text-rose-600" : "text-slate-400"}`}>
                  {item.icon}
                </div>
                
                {!collapsed && (
                  <span className={`font-bold text-[13px] whitespace-nowrap ${isActive ? "text-rose-700" : ""}`}>
                    {item.name}
                  </span>
                )}

                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1 h-6 bg-rose-600 rounded-r-full" 
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. FOOTER (Hospital Logo Anchor) */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 mt-auto space-y-2">
        {hospital && (
          <Link 
            to="/hospital-admin/profile"
            className={`flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-rose-200 transition-all group overflow-hidden ${collapsed ? 'justify-center' : ''}`}
          >
            {/* Hospital Logo Image ONLY here at the bottom */}
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-slate-100 overflow-hidden shadow-inner">
              <img 
                src={hospital.image || DEFAULT_LOGO} 
                className="w-full h-full object-cover" 
                alt="hospital logo"
                onError={(e) => e.target.src = DEFAULT_LOGO}
              />
            </div>
            
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-black text-slate-800 truncate leading-none mb-1">
                  {hospital.name || "Administrator"}
                </p>
                <p className="text-[10px] font-bold text-rose-600 truncate uppercase tracking-tighter">
                  Manage Account
                </p>
              </motion.div>
            )}
            
            {!collapsed && <MdArrowForwardIos className="text-slate-300 group-hover:text-rose-600 transition-colors ml-auto" size={10} />}
          </Link>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 p-3 rounded-xl text-slate-400 font-bold text-[13px] hover:bg-rose-600 hover:text-white transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <MdLogout size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #e2e8f0; }
      `}} />
    </motion.div>
  );
}