import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";

/* ICONS */
import {
  MdDashboard,
  MdEvent,
  MdSchedule,
  MdDescription,
  MdLocalHospital,
  MdLogout,
  MdMenu,
  MdChevronLeft,
  MdNotificationsNone,
  MdArrowForwardIos,
  MdAccountCircle
} from "react-icons/md";

/**
 * @param {boolean} collapsed - State passed from Parent Layout
 * @param {function} setCollapsed - Setter function passed from Parent Layout
 */
export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch user data for the bottom profile card
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setUser(res.data);
      } catch (err) {
        const localUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(localUser);
      }
    };
    fetchUser();
  }, []);

  const menu = [
    { name: "Dashboard", path: "/patient/dashboard", icon: <MdDashboard /> },
    { name: "Appointments", path: "/patient/appointments", icon: <MdEvent /> },
  { name: "Records", path: "/patient/records", icon: <MdDescription /> },
    { name: "Hospitals", path: "/patient/hospitals", icon: <MdLocalHospital /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <motion.div 
      animate={{ width: collapsed ? 80 : 280 }} 
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 h-screen bg-white text-slate-600 z-[100] flex flex-col justify-between border-r border-slate-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* 1. HEADER (Brand & Toggle) */}
      <div className={`h-20 flex items-center px-5 ${collapsed ? 'justify-center' : 'justify-between'} border-b border-slate-50`}>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <MdLocalHospital className="text-rose-600 text-2xl" />
            <span className="text-slate-900 font-black tracking-tighter text-base italic uppercase">
              Hospital<span className="text-rose-600 font-bold">Connect</span>
            </span>
          </motion.div>
        )}
        
        <button
          type="button"
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
      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        {!collapsed && (
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
            Patient Panel
          </p>
        )}
        <nav className="space-y-1.5">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-200 group
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
                    className="absolute left-0 w-1.5 h-6 bg-rose-600 rounded-r-full" 
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. FOOTER (Profile & Sign Out) */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 mt-auto space-y-2">
        {user && (
          <Link 
            to="/patient/profile"
            className={`flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md hover:border-rose-200 transition-all group overflow-hidden ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
              {user.name?.charAt(0).toUpperCase() || <MdAccountCircle size={24}/>}
            </div>
            
            {!collapsed && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-black text-slate-800 truncate leading-none mb-1">
                  {user.name || "User"}
                </p>
                <p className="text-[10px] font-bold text-rose-600 truncate uppercase tracking-tighter">
                  Manage Profile
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