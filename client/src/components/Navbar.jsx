import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Animation variants for the mobile menu
  const menuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    open: { opacity: 1, height: "auto", transition: { duration: 0.3 } }
  };

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

        {/* DESKTOP NAV LINKS */}
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
          onClick={toggleMenu}
          className="md:hidden p-2 bg-slate-50 rounded-lg text-slate-900 cursor-pointer"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </motion.div>
      </div>

      {/* MOBILE MENU CONTENT */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden bg-white border-t border-slate-50 overflow-hidden"
          >
            <div className="flex flex-col gap-4 p-6">
              <Link to="/" onClick={toggleMenu} className="text-lg font-bold text-slate-700 hover:text-rose-600 transition">
                Home
              </Link>
              <Link to="/hospitals" onClick={toggleMenu} className="text-lg font-bold text-slate-700 hover:text-rose-600 transition">
                Hospitals
              </Link>
              <hr className="border-slate-100" />
              <div className="flex flex-col gap-4 pt-2">
                <Link to="/login" onClick={toggleMenu} className="text-center font-bold text-slate-700 p-3 rounded-xl border border-slate-100">
                  Sign In
                </Link>
                <Link to="/signup" onClick={toggleMenu} className="text-center font-bold bg-slate-900 text-white p-3 rounded-xl shadow-lg">
                  Join Network
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;