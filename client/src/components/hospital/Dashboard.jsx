import React from "react";
import { motion } from "framer-motion";
import { 
  MdKingBed, MdBloodtype, MdEventNote, 
  MdAir, MdLocalHospital, MdTrendingUp, 
  MdArrowForward, MdChevronRight
} from "react-icons/md";
import { Link } from "react-router-dom";

export default function SyncDashboard() {
  // Logic: These metrics represent your Hospital Schema fields
  const resources = [
    { label: "General Beds", current: 45, total: 120, icon: <MdKingBed />, color: "rose" },
    { label: "ICU Units", current: 8, total: 25, icon: <MdTrendingUp />, color: "indigo" },
    { label: "Oxygen Supply", current: "85%", total: "100%", icon: <MdAir />, color: "emerald" },
  ];

  // Logic: Matches your BloodBank Schema fields
  const bloodGroups = [
    { type: "A+", units: 12, status: "Normal" },
    { type: "A-", units: 2, status: "Critical" },
    { type: "B+", units: 4, status: "Low" },
    { type: "B-", units: 7, status: "Normal" },
    { type: "O+", units: 22, status: "High" },
    { type: "O-", units: 1, status: "Critical" },
    { type: "AB+", units: 6, status: "Normal" },
    { type: "AB-", units: 3, status: "Low" },
  ];

  return (
    <div className="p-6 lg:p-10 bg-[#F8FAFC] min-h-screen font-sans">
      
      {/* 🏥 HEADER: PROJECT TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Hospital<span className="text-rose-600">Connect</span>
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            Resource Monitoring & Appointment Triage
          </p>
        </div>
        <Link 
          to="/hospital-admin/appointments" 
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          View Appointments <MdArrowForward size={16}/>
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* 📊 LEFT: CRITICAL RESOURCES (Beds/Oxygen) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Critical Supply</h2>
          {resources.map((res, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${res.color}-50 text-${res.color}-600 flex items-center justify-center text-2xl`}>
                {res.icon}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{res.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{res.current}</span>
                  <span className="text-slate-300 font-bold text-sm">/ {res.total}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 🩸 MIDDLE: FULL BLOOD BANK (Grid of 8) */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 italic">
                <MdBloodtype className="text-rose-600 text-2xl" /> Blood Bank <span className="text-slate-200 font-normal">Inventory</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bloodGroups.map((blood, i) => (
                <div key={i} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center group hover:bg-rose-50 hover:border-rose-100 transition-all">
                  <span className="text-2xl font-black text-slate-900 mb-1">{blood.type}</span>
                  <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mb-4 ${
                    blood.status === 'Critical' ? 'bg-rose-600 text-white' : 
                    blood.status === 'Low' ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {blood.status}
                  </div>
                  <div className="text-sm font-black text-slate-600 italic">{blood.units} Units</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 📅 BOTTOM: APPOINTMENT TRIAGE SHORTLIST */}
        <div className="col-span-12">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 italic">
                <MdEventNote className="text-indigo-600 text-2xl" /> Upcoming <span className="text-slate-200 font-normal">Appointments</span>
              </h2>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-lg">Today's Schedule</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Arshad Khan", time: "10:30 AM", type: "Consultation", status: "Checked In" },
                { name: "Rahul Sharma", time: "11:15 AM", type: "Checkup", status: "Waiting" },
                { name: "Sneha Patel", time: "12:00 PM", type: "Emergency", status: "Immediate" },
              ].map((apt, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-3xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-xs">
                      {apt.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{apt.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{apt.type} • {apt.time}</p>
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl ${apt.status === 'Immediate' ? 'text-rose-600 bg-rose-50' : 'text-slate-300'}`}>
                    <MdChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}