import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdEventAvailable, MdAccessTime, MdPerson, 
  MdCheckCircle, MdCancel, MdInfoOutline, MdPhone,
  MdEditCalendar, MdClose
} from "react-icons/md";
import api from "../../utils/api";

export default function HospitalAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  
  // NEW: State for rescheduling
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

  // NEW: Handle Reschedule Submit
  const handleRescheduleSubmit = async (id) => {
    try {
      await api.patch(`/api/appointment/reschedule/${id}`, {
        date: rescheduleData.date,
        time: rescheduleData.time,
        rescheduled: true,
        status: "Pending" // Reset to pending after hospital changes time
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
    <div className="flex flex-col items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-600 mb-4"></div>
       <p className="text-slate-400 font-bold">Synchronizing Clinical Records...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Schedule</h1>
            <p className="text-slate-500 font-medium">Review patient requests and manage doctor availability.</p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
            {["All", "Pending", "Approved", "Completed", "Rejected"].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
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

        {/* APPOINTMENT LIST */}
        <div className="space-y-4">
          <AnimatePresence mode='popLayout'>
            {filteredData.map((app) => (
              <motion.div
                key={app._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  
                  {/* Patient Info */}
                  <div className="flex items-center gap-4 min-w-[220px]">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                      <MdPerson size={28} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{app.patientId?.name || "Unknown Patient"}</h3>
                      <div className="flex items-center gap-1 text-slate-400 mt-1">
                        <MdPhone size={14} />
                        <p className="text-xs font-bold tracking-tighter">{app.patientId?.phone || "No Phone"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Specialist & Reason */}
                  <div className="flex-1 lg:border-l border-slate-100 lg:pl-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Medical Request</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800">Dr. {app.doctorId?.name}</p>
                      <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-bold uppercase">{app.doctorId?.specialization}</span>
                    </div>
                    {app.rescheduled && (
                       <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-black uppercase mt-1 inline-block">Rescheduled</span>
                    )}
                  </div>

                  {/* Schedule Display or Edit Form */}
                  <div className="min-w-[200px]">
                    {reschedulingId === app._id ? (
                      <div className="flex flex-col gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                        <input 
                          type="date" 
                          className="text-xs font-bold p-1 bg-transparent outline-none" 
                          onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                        />
                        <select 
                          className="text-xs font-bold p-1 bg-transparent outline-none"
                          onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                        >
                           <option value="">Select Time</option>
                           <option value="09:00 AM">09:00 AM</option>
                           <option value="11:30 AM">11:30 AM</option>
                           <option value="02:00 PM">02:00 PM</option>
                           <option value="04:30 PM">04:30 PM</option>
                        </select>
                        <div className="flex gap-1 mt-1">
                          <button 
                            onClick={() => handleRescheduleSubmit(app._id)}
                            className="flex-1 bg-amber-500 text-white text-[10px] py-1 rounded-lg font-bold"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setReschedulingId(null)}
                            className="bg-slate-200 p-1 rounded-lg"
                          >
                            <MdClose size={14}/>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-row lg:flex-col gap-4 lg:gap-1 justify-between">
                        <div className="flex items-center gap-2">
                          <MdEventAvailable className="text-rose-500" size={18} />
                          <span className="text-sm font-black text-slate-700">{app.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MdAccessTime className="text-rose-500" size={18} />
                          <span className="text-sm font-black text-slate-700">{app.time}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 min-w-[220px]">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyles(app.status)}`}>
                      {app.status}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reschedule Button */}
                      {(app.status === "Pending" || app.status === "Approved") && reschedulingId !== app._id && (
                        <button 
                          onClick={() => {
                            setReschedulingId(app._id);
                            setRescheduleData({ date: app.date, time: app.time });
                          }}
                          className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all shadow-sm"
                          title="Reschedule"
                        >
                          <MdEditCalendar size={20} />
                        </button>
                      )}

                      {app.status === "Pending" && (
                        <button 
                          onClick={() => handleAction(app._id, "Approved")}
                          className="w-10 h-10 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          <MdCheckCircle size={20} />
                        </button>
                      )}
                      
                      {app.status === "Approved" && (
                        <button 
                          onClick={() => handleAction(app._id, "Completed")}
                          className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <MdCheckCircle size={20} />
                        </button>
                      )}

                      {(app.status === "Pending" || app.status === "Approved") && (
                        <button 
                          onClick={() => handleAction(app._id, "Rejected")}
                          className="w-10 h-10 flex items-center justify-center bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                        >
                          <MdCancel size={20} />
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {/* ... empty state logic ... */}
        </div>
      </div>
    </div>
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