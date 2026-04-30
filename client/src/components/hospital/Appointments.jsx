import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdEventAvailable, MdAccessTime, MdPerson, 
  MdCheckCircle, MdCancel, MdPhone,
  MdEditCalendar, MdClose
} from "react-icons/md";
import api from "../../utils/api";

export default function HospitalAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/api/appointment/hospital-list");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.patch(`/api/appointment/update-status/${id}`, { status });
      setAppointments(prev => 
        prev.map(a => a._id === id ? { ...a, status } : a)
      );
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.msg || "Server Error"));
    }
  };

  const handleRescheduleSubmit = async (id) => {
    try {
      await api.patch(`/api/appointment/reschedule/${id}`, {
        date: rescheduleData.date,
        time: rescheduleData.time,
        rescheduled: true,
        status: "Pending" 
      });
      
      setAppointments(prev => 
        prev.map(a => a._id === id ? { 
          ...a, 
          date: rescheduleData.date, 
          time: rescheduleData.time, 
          rescheduled: true,
          status: "Pending" 
        } : a)
      );
      setReschedulingId(null);
    } catch (err) {
      alert("Reschedule failed");
    }
  };

  const filteredData = appointments.filter(a => filter === "All" || a.status === filter);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-600 mb-4"></div>
       <p className="text-slate-400 font-bold">Synchronizing Clinical Records...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 pt-20 md:pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Clinic Schedule</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">Manage patient requests and availability.</p>
          </div>

          {/* FILTER TABS - Scrollable on mobile */}
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
            {["All", "Pending", "Approved", "Completed", "Rejected"].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 md:px-5 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === tab 
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' 
                  : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="space-y-4">
          <AnimatePresence mode='popLayout'>
            {filteredData.length > 0 ? filteredData.map((app) => (
              <motion.div
                key={app._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start lg:items-center">
                  
                  {/* 1. Patient Info (4 Cols) */}
                  <div className="lg:col-span-3 flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img 
                        src={app.patientId?.profilePic || `https://ui-avatars.com/api/?name=${app.patientId?.name}&background=random`} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-900 text-base md:text-lg leading-tight truncate">
                        {app.patientId?.name || "Unknown Patient"}
                      </h3>
                      <div className="flex items-center gap-1 text-slate-400 mt-1">
                        <MdPhone size={12} />
                        <p className="text-[11px] font-bold truncate">{app.patientId?.phone || "No Phone"}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. Medical Request (3 Cols) */}
                  <div className="lg:col-span-3 lg:border-l lg:pl-6 border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Provider & Service</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">Dr. {app.doctorId?.name}</p>
                      <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-bold uppercase whitespace-nowrap">
                        {app.doctorId?.specialization}
                      </span>
                    </div>
                    {app.rescheduled && (
                       <span className="text-[8px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-black uppercase mt-1 inline-block">Rescheduled</span>
                    )}
                  </div>

                  {/* 3. Schedule (3 Cols) */}
                  <div className="lg:col-span-3 lg:border-l lg:pl-6 border-slate-100">
                    {reschedulingId === app._id ? (
                      <div className="space-y-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                        <input 
                          type="date" 
                          className="w-full text-xs font-bold p-1 bg-transparent outline-none border-b border-slate-200" 
                          onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                        />
                        <select 
                          className="w-full text-xs font-bold p-1 bg-transparent outline-none"
                          onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                        >
                           <option value="">Time Slot</option>
                           <option value="09:00 AM">09:00 AM</option>
                           <option value="11:30 AM">11:30 AM</option>
                           <option value="02:00 PM">02:00 PM</option>
                        </select>
                        <div className="flex gap-2">
                          <button onClick={() => handleRescheduleSubmit(app._id)} className="flex-1 bg-amber-500 text-white text-[10px] py-1.5 rounded-lg font-black uppercase">Save</button>
                          <button onClick={() => setReschedulingId(null)} className="px-2 bg-slate-200 rounded-lg"><MdClose size={14}/></button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex lg:flex-col gap-4 lg:gap-1">
                        <div className="flex items-center gap-2">
                          <MdEventAvailable className="text-rose-500 flex-shrink-0" size={16} />
                          <span className="text-xs md:text-sm font-black text-slate-700">{app.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MdAccessTime className="text-rose-500 flex-shrink-0" size={16} />
                          <span className="text-xs md:text-sm font-black text-slate-700">{app.time}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Actions (3 Cols) */}
                  <div className="lg:col-span-3 flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 lg:gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${getStatusStyles(app.status)}`}>
                      {app.status}
                    </div>

                    <div className="flex items-center gap-2">
                      {(app.status === "Pending" || app.status === "Approved") && reschedulingId !== app._id && (
                        <ActionButton icon={<MdEditCalendar size={18}/>} color="bg-slate-100 text-slate-600" onClick={() => {
                          setReschedulingId(app._id);
                          setRescheduleData({ date: app.date, time: app.time });
                        }} />
                      )}

                      {app.status === "Pending" && (
                        <ActionButton icon={<MdCheckCircle size={18}/>} color="bg-emerald-50 text-emerald-600 hover:bg-emerald-600" onClick={() => handleAction(app._id, "Approved")} />
                      )}
                      
                      {app.status === "Approved" && (
                        <ActionButton icon={<MdCheckCircle size={18}/>} color="bg-blue-50 text-blue-600 hover:bg-blue-600" onClick={() => handleAction(app._id, "Completed")} />
                      )}

                      {(app.status === "Pending" || app.status === "Approved") && (
                        <ActionButton icon={<MdCancel size={18}/>} color="bg-rose-50 text-rose-600 hover:bg-rose-600" onClick={() => handleAction(app._id, "Rejected")} />
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            )) : (
              <div className="text-center py-20">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records found for this category</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

// Reusable Action Button Component
function ActionButton({ icon, color, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-xl transition-all shadow-sm hover:text-white ${color}`}
    >
      {icon}
    </button>
  );
}

function getStatusStyles(status) {
  switch (status) {
    case 'Approved': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    case 'Pending': return 'bg-amber-50 text-amber-600 border border-amber-100';
    case 'Completed': return 'bg-blue-50 text-blue-600 border border-blue-100';
    case 'Rejected': return 'bg-rose-50 text-rose-600 border border-rose-100';
    default: return 'bg-slate-50 text-slate-500';
  }
}