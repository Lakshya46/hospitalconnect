import React from "react";
import { motion } from "framer-motion";
import { 
  MdKingBed, MdMeetingRoom, MdBloodtype, MdEventNote, 
  MdAir, MdLocalHospital, MdTrendingUp, MdHistory,
  MdOutlineShield, MdAddAlert
} from "react-icons/md";

export default function Dashboard() {
  // Mock Data - In a real app, these would come from your API
  const liveMetrics = [
    { label: "Beds Available", current: 45, total: 120, icon: <MdMeetingRoom />, color: "rose" },
    { label: "ICU Vacant", current: 8, total: 25, icon: <MdTrendingUp />, color: "indigo" },
    { label: "Oxygen Supply", current: "85%", total: "100%", icon: <MdAir />, color: "emerald" },
    { label: "Today's Appts", current: 32, total: 50, icon: <MdEventNote />, color: "amber" },
  ];

  const bloodStock = [
    { type: "A+", units: 12, status: "Normal" },
    { type: "B+", units: 4, status: "Low" },
    { type: "O+", units: 22, status: "High" },
    { type: "AB+", units: 2, status: "Critical" },
  ];

  return (
    <div className="p-6 lg:p-10 bg-[#F8FAFC] min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Facility <span className="text-rose-600">Overview</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Live monitoring of critical hospital resources</p>
        </div>
        <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                Export Report
            </button>
            <button className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 flex items-center gap-2">
                <MdAddAlert size={16}/> Emergency Alert
            </button>
        </div>
      </div>

      {/* 1. LIVE AVAILABILITY TILES */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        {liveMetrics.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 bg-${item.color}-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform`} />
            
            <div className="relative z-10">
                <div className={`text-${item.color}-600 mb-4 text-2xl`}>{item.icon}</div>
                <h3 className="text-slate-400 font-black text-[10px] uppercase tracking-[0.15em] mb-1">{item.label}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{item.current}</span>
                    <span className="text-slate-400 font-bold text-sm">/ {item.total}</span>
                </div>
                {/* Progress Bar */}
                <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.current / (parseInt(item.total) || 100)) * 100}%` }}
                        className={`h-full bg-${item.color}-500 rounded-full`}
                    />
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* 2. UPDATE SECTION */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-xl"><MdLocalHospital size={20}/></div>
                    <h2 className="text-xl font-bold text-slate-800">Resource Management</h2>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last synced: 2m ago</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Bed Update */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase">General Beds</label>
                    <input type="number" placeholder="Available" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-rose-300 outline-none font-bold text-sm" />
                </div>
                {/* ICU Update */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase">ICU Units</label>
                    <input type="number" placeholder="Vacant" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-rose-300 outline-none font-bold text-sm" />
                </div>
                {/* Oxygen Update */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Oxygen (%)</label>
                    <input type="number" placeholder="Current Level" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-rose-300 outline-none font-bold text-sm" />
                </div>
            </div>
            
            <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-100">
                Push Live Update
            </button>
          </div>

          {/* 3. BLOOD BANK MONITOR */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <MdBloodtype className="text-rose-600 text-2xl" />
                <h2 className="text-xl font-bold text-slate-800">Blood Bank Inventory</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {bloodStock.map((blood) => (
                    <div key={blood.type} className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-lg font-black text-slate-900">{blood.type}</span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                blood.status === 'Critical' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>{blood.status}</span>
                        </div>
                        <div className="text-2xl font-black text-slate-700">{blood.units} <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Units</span></div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* 4. ACTIVITY & ALERTS */}
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <MdHistory className="text-indigo-600 text-2xl" />
                    <h2 className="text-xl font-bold text-slate-800">Recent Logs</h2>
                </div>
                <div className="space-y-6">
                    {[
                        { title: "Oxygen Level Drop", desc: "Main tank at 85% capacity", time: "12m ago", alert: true },
                        { title: "Staff Update", desc: "Dr. Arshad signed in", time: "45m ago", alert: false },
                        { title: "Bed Release", desc: "Ward 4B: 2 beds vacated", time: "1h ago", alert: false },
                    ].map((log, i) => (
                        <div key={i} className="flex gap-4 relative">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.alert ? 'bg-rose-500 animate-pulse' : 'bg-slate-200'}`} />
                            <div>
                                <h4 className="text-sm font-black text-slate-800 leading-none">{log.title}</h4>
                                <p className="text-xs text-slate-400 mt-1 font-medium">{log.desc}</p>
                                <span className="text-[9px] font-bold text-slate-300 uppercase mt-2 block">{log.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                <MdOutlineShield className="absolute -right-4 -bottom-4 text-8xl text-white/10 rotate-12" />
                <h3 className="text-lg font-black mb-2 leading-tight">System<br/>Security</h3>
                <p className="text-xs opacity-80 font-medium mb-6 leading-relaxed">All resource updates are end-to-end encrypted and logged to the central server.</p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    View Security Audit
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}