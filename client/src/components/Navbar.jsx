import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* BRAND LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ rotate: 90 }}
            className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-rose-200"
          >
            H
          </motion.div>
          <span className="text-xl font-black text-slate-900 tracking-tight">
            Hospital<span className="text-rose-600">Connect</span>
          </span>
        </Link>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-10">
          <ul className="flex items-center gap-8 font-semibold text-slate-500 text-sm uppercase tracking-wider">
            <li>
              <Link to="/" className="hover:text-rose-600 transition-colors relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-600 transition-all group-hover:w-full"></span>
              </Link>
            </li>
            <li>
              <Link to="/hospitals" className="hover:text-rose-600 transition-colors relative group">
                Hospitals
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-rose-600 transition-all group-hover:w-full"></span>
              </Link>
            </li>
            
          </ul>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
            <Link 
              to="/login" 
              className="text-sm font-bold text-slate-700 hover:text-rose-600 transition"
            >
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-600 transition shadow-lg shadow-slate-200"
              >
                Join Network
              </Link>
            </motion.div>
          </div>
        </div>

        {/* MOBILE MENU ICON */}
        <motion.div 
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 bg-slate-50 rounded-lg text-slate-900 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </motion.div>

      </div>
    </motion.nav>
  );
}

export default Navbar;