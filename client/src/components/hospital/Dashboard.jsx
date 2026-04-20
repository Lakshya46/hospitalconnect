import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdKingBed, MdBloodtype, MdEventNote, 
  MdAir, MdArrowForward, MdChevronRight, MdSync
} from "react-icons/md";
import { Link } from "react-router-dom";
import api from "../../utils/api";

export default function HospitalDashboard() {
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["hospitalDashboardStats"],
    queryFn: async () => {
      const res = await api.get("/api/hospital/dashboard-stats");
      return res.data;
    },
    refetchInterval: 10000, 
  });

  // Helper to handle profile image paths
  const getProfileImage = (path, name) => {
    if (!path) return `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`;
    // If the path is a full URL (like Cloudinary), use it; otherwise, prepend your API base URL
    return path.startsWith('http') ? path : `${process.env.REACT_APP_API_URL || ''}/${path}`;
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <MdSync className="text-rose-600 animate-spin" size={40} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Hospital Data...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="min-h-screen flex items-center justify-center p-10 text-rose-600 font-bold">
      Failed to connect to hospital server. Please check your connection.
    </div>
  );

  return (
    <div className="p-6 lg:p-10 bg-white min-h-screen font-sans">
      
      {/* 🏥 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4  border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            Hospital<span className="text-rose-600">Connect</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`h-2 w-2 rounded-full ${isFetching ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              {isFetching ? 'Synchronizing...' : 'Live System Status'}
            </p>
          </div>
        </div>
        <Link 
          to="/hospital-admin/appointments" 
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
        >
          Manage Appointments <MdArrowForward size={16}/>
        </Link>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* 📊 LEFT: CRITICAL RESOURCES */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Critical Supply</h2>
          {data.resources?.map((res, i) => (
            <motion.div 
              key={res.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 text-rose-600 flex items-center justify-center text-2xl">
                {res.label.includes("Bed") ? <MdKingBed /> : <MdAir />}
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

        {/* 🩸 MIDDLE: BLOOD BANK */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 italic">
                <MdBloodtype className="text-rose-600 text-2xl" /> Blood Bank <span className="text-slate-200 font-normal">Inventory</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {data.bloodGroups?.map((blood, i) => (
                <motion.div 
                  key={blood.type}
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center group hover:bg-rose-50 transition-all"
                >
                  <span className="text-2xl font-black text-slate-900 mb-1">{blood.type}</span>
                  <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full mb-4 ${
                    blood.units < 5 ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {blood.units < 5 ? 'Low Stock' : 'Stable'}
                  </div>
                  <div className="text-sm font-black text-slate-600 italic">{blood.units} Units</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 📅 BOTTOM: APPOINTMENT TRIAGE */}
        <div className="col-span-12">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 italic">
                <MdEventNote className="text-indigo-600 text-2xl" /> Upcoming Appointments
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {data.appointments?.slice(0, 3).map((apt) => (
                  <motion.div 
                    layout
                    key={apt._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between p-5 rounded-3xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={getProfileImage(apt.patientImage, apt.patientName)} 
                          alt={apt.patientName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        {apt.priority === 'High' && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                          </span>
                        )}
                      </div>
                      
                      <div className="truncate">
                        <h4 className="text-sm font-black text-slate-900 uppercase truncate">{apt.patientName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold truncate">
                          <span className="text-indigo-500">{apt.reason}</span> • {apt.time}
                        </p>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/hospital-admin/appointments/`}
                      className={`p-2 rounded-xl transition-colors ${
                        apt.priority === 'High' 
                          ? 'text-rose-600 bg-rose-50 group-hover:bg-rose-600 group-hover:text-white' 
                          : 'text-slate-300 bg-white border border-slate-100 group-hover:text-indigo-600'
                      }`}
                    >
                      <MdChevronRight size={20} />
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}