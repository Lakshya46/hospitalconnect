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
      


      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-25 pb-32 px-6">
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
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </section>

      {/* ===== RESOURCE MANAGEMENT GRID ===== */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              Critical Resources, <span className="text-rose-600">One Tap Away.</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Our mobile-first infrastructure ensures that healthcare providers can update and request life-saving assets from anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ResourceCard 
              icon="🏥" 
              title="ICU & Beds" 
              desc="Real-time occupancy tracking for General, Oxygen, and ICU beds."
              color="blue"
            />
            <ResourceCard 
              icon="🩸" 
              title="Blood Bank" 
              desc="Live inventory of blood groups with instant 'Emergency Need' broadcasts."
              color="rose"
            />
            <ResourceCard 
              icon="🌬️" 
              title="Oxygen Supply" 
              desc="Monitor cylinder levels and liquid oxygen plant pressure remotely."
              color="cyan"
            />
            <ResourceCard 
              icon="📅" 
              title="Appointments" 
              desc="Smart scheduling to reduce OPD overcrowding and manage patient flow."
              color="emerald"
            />
          </div>
        </div>
      </section>

      {/* ===== INTER-HOSPITAL REQUEST LOGISTICS ===== */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-xs font-bold uppercase tracking-tighter mb-6">
              Mobile Connect Feature
            </div>
            <h2 className="text-4xl font-black mb-6 leading-tight">
              Request Resources <br/> from the Network
            </h2>
            <p className="text-slate-600 text-lg mb-8">
              Short on O+ blood or out of ventilators? Send a high-priority request to all hospitals within a 20km radius instantly via the mobile dashboard.
            </p>
            
            <ul className="space-y-4">
              {['Smart Route Optimization', 'Verified Dispatch Tracking', 'Instant Admin Approval'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-bold text-slate-800">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:w-1/2 w-full">
             <motion.div 
               whileHover={{ scale: 1.02 }}
               className="bg-white p-8 rounded-[32px] shadow-xl border border-slate-100"
             >
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <span className="font-black text-xl">Active Requests</span>
                    <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs animate-pulse">4 Priority</span>
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

// --- HELPER COMPONENTS ---

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

function ResourceCard({ icon, title, desc, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
    cyan: "bg-cyan-50 text-cyan-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all"
    >
      <div className={`w-16 h-16 ${colors[color]} rounded-2xl flex items-center justify-center text-3xl mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-black mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
}

function RequestItem({ type, qty, time, urgency }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">📦</div>
        <div>
          <p className="font-bold text-slate-900 text-sm">{type}: {qty}</p>
          <p className="text-xs text-slate-400">{time}</p>
        </div>
      </div>
      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
        urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
      }`}>
        {urgency}
      </span>
    </div>
  );
}




export default App;