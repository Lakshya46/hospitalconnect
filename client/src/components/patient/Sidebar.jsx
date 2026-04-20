import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

/* ICONS */
import {
  MdDashboard,
  MdEvent,
  MdDescription,
  MdLocalHospital,
  MdLogout,
  MdMenu,
  MdChevronLeft,
  MdArrowForwardIos,
  MdAccountCircle
} from "react-icons/md";

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ Accessing global user state. 
  // This component will now re-render automatically when refreshUser() is called elsewhere.
  const { user, logout } = useAuth();

  const menu = [
    { name: "Dashboard", path: "/patient/dashboard", icon: <MdDashboard /> },
    { name: "Appointments", path: "/patient/appointments", icon: <MdEvent /> },
    { name: "Records", path: "/patient/records", icon: <MdDescription /> },
    { name: "Hospitals", path: "/patient/hospitals", icon: <MdLocalHospital /> },
  ];

  const handleLogout = () => {
    logout(); // Use the logout function from context
    navigate("/login");
  };

  return (
    <motion.div 
      animate={{ width: collapsed ? 85 : 280 }} 
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
            <div className="bg-rose-600 p-1.5 rounded-lg shadow-lg shadow-rose-200">
                <MdLocalHospital className="text-white text-xl" />
            </div>
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
            ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-200" 
            : "bg-slate-50 text-slate-400 border-slate-100 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100"
          }`}
        >
          {collapsed ? <MdMenu size={22} /> : <MdChevronLeft size={22} />}
        </button>
      </div>

      {/* 2. NAVIGATION AREA */}
      <div className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
        {!collapsed && (
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 px-2">
            Patient Services
          </p>
        )}
        <nav className="space-y-2">
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-300 group
                  ${isActive 
                    ? "bg-rose-600 text-white shadow-md shadow-rose-100" 
                    : "hover:bg-rose-50 text-slate-500 hover:text-rose-600"
                  }`}
              >
                <div className={`text-2xl min-w-[32px] flex justify-center transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-rose-500"}`}>
                  {item.icon}
                </div>
                
                {!collapsed && (
                  <span className={`font-bold text-[13.5px] whitespace-nowrap`}>
                    {item.name}
                  </span>
                )}

                {isActive && !collapsed && (
                   <motion.div 
                    layoutId="activeIndicator"
                    className="absolute right-3 w-1.5 h-1.5 bg-rose-200 rounded-full" 
                   />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. FOOTER (Profile & Sign Out) */}
     {/* 3. FOOTER (Profile & Sign Out) */}
<div className="p-4 bg-slate-50/80 border-t border-slate-100 mt-auto space-y-3">
  {/* ✅ Fixed Logic: Wrap in parentheses and use optional chaining (?.) */}
  {(user || localStorage.getItem("token")) && (
    <Link 
      to="/patient/profile"
      className={`flex items-center gap-3 p-2 rounded-2xl bg-white border-2 transition-all group overflow-hidden ${
          collapsed 
          ? 'justify-center border-transparent hover:border-rose-500' 
          : 'border-white shadow-sm hover:shadow-md hover:border-rose-100'
      }`}
    >
      {/* Dynamic Avatar Logic */}
      <div className="w-11 h-11 rounded-xl bg-rose-600 flex items-center justify-center flex-shrink-0 text-white font-bold shadow-inner overflow-hidden border-2 border-white ring-1 ring-slate-100">
        {/* ✅ Use ?. to prevent crashing when user is null */}
        {user?.profilePic ? (
          <img 
              src={user.profilePic} 
              alt="profile" 
              className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg">
            {/* ✅ Safe check for name */}
            {user?.name ? user.name.charAt(0).toUpperCase() : <MdAccountCircle size={24}/>}
          </span>
        )}
      </div>
      
      {!collapsed && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex-1 min-w-0"
        >
          <p className="text-[13px] font-black text-slate-900 truncate leading-tight">
            {/* ✅ Fallback text while loading */}
            {user?.name || "Loading..."}
          </p>
          <p className="text-[10px] font-bold text-rose-600 truncate uppercase tracking-tighter">
            Patient Account
          </p>
        </motion.div>
      )}
      
      {!collapsed && <MdArrowForwardIos className="text-slate-300 group-hover:text-rose-600 transition-colors ml-auto mr-1" size={12} />}
    </Link>
  )}

  {/* ... Sign Out Button remains same ... */}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-bold text-[13px] transition-all
            ${collapsed 
                ? 'justify-center text-slate-400 hover:bg-rose-600 hover:text-white' 
                : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
            }`}
        >
          <MdLogout size={22} className={collapsed ? "" : "text-rose-600"} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #fda4af; }
      `}} />
    </motion.div>
  );
}