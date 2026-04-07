import React from 'react';
import { motion } from 'framer-motion';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
function App() {
  // Animation Variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const pulseEffect = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <div className="bg-[#fcfdfe] min-h-screen font-sans text-slate-900">
      
      {/* ===== HEADER / NAV ===== */}
 

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-44 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.div variants={fadeInUp} className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              <span className="text-rose-600 font-bold text-sm tracking-widest uppercase">Live Network Active</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-7xl font-black text-slate-900 mb-8 leading-[1.1]">
              Connecting Care, <br/>
              <span className="text-rose-600">Saving Seconds.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl text-slate-500 mb-10 leading-relaxed max-w-lg">
              The central hub for hospitals to sync resources. Request blood, transfer oxygen, and manage bed availability in real-time.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-5">
              <button className="bg-rose-600 text-white px-10 py-5 rounded-2xl font-extrabold text-lg shadow-2xl shadow-rose-200 hover:bg-rose-700 hover:-translate-y-1 transition-all">
                Search Local Resources
              </button>
              <button className="bg-white border-2 border-slate-100 px-10 py-5 rounded-2xl font-extrabold text-lg hover:border-rose-200 transition-all">
                Hospital Login
              </button>
            </motion.div>
          </motion.div>

          {/* Animated Image Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
            <img 
              src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=1000" 
              alt="Medical Team"
              className="rounded-[40px] shadow-2xl grayscale-[20%] hover:grayscale-0 transition-all duration-700"
            />
            {/* Floating Resource Tag */}
            <motion.div 
              animate={pulseEffect}
              className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-50 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl">🩸</div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Blood Request</p>
                <p className="text-lg font-black text-slate-900">O+ Needed Nearby</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== NETWORK STATS ===== */}
      <section className="bg-slate-900 py-24 px-6 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center relative z-10">
          <StatBox number="450+" label="Hospitals Connected" />
          <StatBox number="12,000" label="Beds Managed" />
          <StatBox number="3.2s" label="Avg. Response Time" />
        </div>
        {/* Background Network Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </section>
    </div>
  );
}

function StatBox({ number, label }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="text-5xl font-black text-rose-500 mb-2">{number}</h3>
      <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">{label}</p>
    </motion.div>
  );
}

export default App;