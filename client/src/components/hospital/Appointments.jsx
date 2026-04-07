import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdEventAvailable, MdAccessTime, MdPerson, 
  MdCheckCircle, MdCancel, MdDeleteOutline, MdFilterList 
} from "react-icons/md";
import api from "../../utils/api";

export default function HospitalAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/api/hospital/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.put(`/api/appointments/${id}/status`, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (err) {
      alert("Action failed");
    }
  };

  const filteredData = appointments.filter(a => filter === "All" || a.status === filter);

  if (loading) return <div className="p-10 pt-24 text-center font-bold text-slate-400">Loading Schedules...</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* TOP HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Patient Appointments</h1>
            <p className="text-slate-500 font-medium">Manage and review your upcoming medical consultations.</p>
          </div>

          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            {["All", "Pending", "Approved", "Completed"].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === tab ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* APPOINTMENT LIST */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredData.map((app) => (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  
                  {/* Patient Info */}
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">
                      <MdPerson size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 leading-none mb-1">{app.patientId.name}</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase">{app.patientId.phone}</p>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 border-l border-slate-100 pl-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Specialist</p>
                    <p className="font-bold text-slate-800 text-sm">Dr. {app.doctorId.name}</p>
                    <p className="text-xs text-rose-600 font-medium">{app.doctorId.specialization}</p>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <MdEventAvailable className="text-slate-300" size={20} />
                      <span className="text-sm font-bold text-slate-700">{app.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="text-slate-300" size={20} />
                      <span className="text-sm font-bold text-slate-700">{app.time}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="min-w-[100px]">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter
                      ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                        app.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}
                    `}>
                      {app.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {app.status === "Pending" && (
                      <button 
                        onClick={() => handleAction(app._id, "Approved")}
                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <MdCheckCircle size={20} />
                      </button>
                    )}
                    {app.status === "Approved" && (
                      <button 
                        onClick={() => handleAction(app._id, "Completed")}
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                      >
                        <MdCheckCircle size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleAction(app._id, "Rejected")}
                      className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                    >
                      <MdCancel size={20} />
                    </button>
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredData.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold italic">No appointments found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}