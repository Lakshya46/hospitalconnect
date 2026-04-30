import React from 'react';
import { motion } from 'framer-motion';

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
    <div className="bg-[#fcfdfe] min-h-screen font-sans text-slate-900 overflow-x-hidden">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-12 md:pt-15 pb-20 md:pb-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
          
          <motion.div 
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
            className="order-2 lg:order-1 text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="flex items-center justify-center lg:justify-start gap-2 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              <span className="text-rose-600 font-bold text-xs md:text-sm tracking-widest uppercase">Live Network Active</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 md:mb-8 leading-[1.1]">
              Connecting Care, <br/>
              <span className="text-rose-600">Saving Seconds.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-slate-500 mb-8 md:mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              The central hub for hospitals to sync resources. Request blood, transfer oxygen, and manage bed availability in real-time.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 md:gap-5">
              <a href='./hospitals' className="w-full sm:w-auto">
                <button className="w-full bg-rose-600 text-white px-8 py-4 md:px-10 md:py-5 rounded-2xl font-extrabold text-lg shadow-xl shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all">
                  Search Resources
                </button>
              </a>
              <a href='./login' className="w-full sm:w-auto">
                <button className="w-full bg-white border-2 border-slate-100 px-8 py-4 md:px-10 md:py-5 rounded-2xl font-extrabold text-lg hover:border-rose-200 active:scale-95 transition-all">
                  Hospital Login
                </button>
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Image Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative order-1 lg:order-2 px-4 md:px-0"
          >
            <div className="absolute -top-5 -left-5 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
            <img 
src="/img3.png"
        alt="Medical Team"
              className="rounded-[30px] md:rounded-[40px] shadow-2xl grayscale-[20%] w-full aspect-video md:aspect-auto object-cover"
            />
            {/* Floating UI Card */}
            <motion.div 
              animate={pulseEffect}
              className="absolute -bottom-4 md:-bottom-6 right-4 md:-right-6 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-50 flex items-center gap-3 md:gap-4"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-100 text-rose-600 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl">🩸</div>
              <div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">Blood Request</p>
                <p className="text-sm md:text-lg font-black text-slate-900">O+ Needed Nearby</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== NETWORK STATS ===== */}
      <section className="bg-slate-900 py-16 md:py-24 px-6 text-white relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center relative z-10">
          <StatBox number="450+" label="Hospitals Connected" />
          <StatBox number="12,000" label="Beds Managed" />
          <StatBox number="3.2s" label="Avg. Response Time" />
        </div>
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </section>

      {/* ===== RESOURCE MANAGEMENT GRID ===== */}
      <section className="py-20 md:py-32 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 md:mb-20 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 leading-tight">
              Critical Resources, <br className="md:hidden" /> <span className="text-rose-600">One Tap Away.</span>
            </h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto px-4">
              Our mobile-first infrastructure ensures that healthcare providers can update and request life-saving assets from anywhere.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <ResourceCard icon="🏥" title="ICU & Beds" desc="Real-time occupancy tracking for General, Oxygen, and ICU beds." color="blue" />
            <ResourceCard icon="🩸" title="Blood Bank" desc="Live inventory of blood groups with instant broadcasts." color="rose" />
            <ResourceCard icon="🌬️" title="Oxygen Supply" desc="Monitor cylinder levels and liquid oxygen plant pressure." color="cyan" />
            <ResourceCard icon="📅" title="Appointments" desc="Smart scheduling to reduce OPD overcrowding." color="emerald" />
          </div>
        </div>
      </section>

      {/* ===== INTER-HOSPITAL REQUEST LOGISTICS ===== */}
      <section className="py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-16">
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-tighter mb-6">
              Mobile Connect Feature
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
              Request Resources <br className="hidden md:block"/> from the Network
            </h2>
            <p className="text-slate-600 text-base md:text-lg mb-8 max-w-lg mx-auto lg:mx-0">
              Short on O+ blood or out of ventilators? Send high-priority requests to hospitals within 20km instantly.
            </p>
            
            <ul className="space-y-4 inline-block lg:block text-left">
              {['Smart Route Optimization', 'Verified Dispatch Tracking', 'Instant Admin Approval'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-slate-800 text-sm md:text-base">
                  <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[8px] md:text-[10px]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 w-full max-w-md lg:max-w-none">
             <motion.div 
               whileHover={{ scale: 1.01 }}
               className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-xl border border-slate-100"
             >
                <div className="space-y-4 md:space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className="font-black text-lg md:text-xl text-slate-900">Active Requests</span>
                    <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] animate-pulse">4 Priority</span>
                  </div>
                  <RequestItem type="Oxygen" qty="10 Cylinders" time="2m ago" urgency="High" />
                  <RequestItem type="Ventilator" qty="2 Units" time="15m ago" urgency="Critical" />
                  <RequestItem type="Plasma" qty="B+ Type" time="32m ago" urgency="Normal" />
                </div>
             </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- REUSABLE COMPONENTS (Updated for responsiveness) ---

function StatBox({ number, label }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h3 className="text-4xl md:text-5xl font-black text-rose-500 mb-1 md:mb-2">{number}</h3>
      <p className="text-slate-400 font-bold tracking-widest uppercase text-[10px] md:text-sm">{label}</p>
    </motion.div>
  );
}

function ResourceCard({ icon, title, desc, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    cyan: "bg-cyan-50 text-cyan-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all"
    >
      <div className={`w-12 h-12 md:w-16 md:h-16 ${colors[color]} rounded-xl md:rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6`}>
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-black mb-2 md:mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-xs md:text-sm">{desc}</p>
    </motion.div>
  );
}

function RequestItem({ type, qty, time, urgency }) {
  return (
    <div className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm text-sm">📦</div>
        <div>
          <p className="font-bold text-slate-900 text-xs md:text-sm">{type}: {qty}</p>
          <p className="text-[10px] text-slate-400">{time}</p>
        </div>
      </div>
      <span className={`text-[8px] md:text-[10px] font-black uppercase px-2 py-1 md:px-3 md:py-1 rounded-md md:rounded-lg ${
        urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
      }`}>
        {urgency}
      </span>
    </div>
  );
}

export default App;