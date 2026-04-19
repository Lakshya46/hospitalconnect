import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, Clock, CheckCircle2, History, RefreshCcw, 
  MoreVertical, XCircle, Ban
} from "lucide-react";
import api from "../../utils/api";

export default function Appointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/appointment/patient-appointments");
      setAppointments(response.data);
    } catch (err) {
      console.error("Fetch error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel?")) return;
    try {
      await api.patch(`/api/appointment/${id}/cancel`);
      setOpenMenuId(null);
      fetchAppointments();
    } catch (err) {
      alert("Error cancelling appointment.");
    }
  };

  const filteredData = appointments.filter(app => {
    if (activeTab === "Upcoming") return app.status === "Pending" || app.status === "Approved";
    if (activeTab === "Rescheduled") return app.rescheduled === true;
    if (activeTab === "Past") return ["Completed", "Cancelled", "Rejected"].includes(app.status);
    return false;
  });

  if (loading) return <div className="p-10 text-center font-black text-rose-500 animate-pulse uppercase tracking-widest">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          My <span className="text-rose-600">Health</span>
        </h1>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-tighter">Clinical Schedule & Timeline</p>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mb-8">
        {["Upcoming", "Rescheduled", "Past"].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setOpenMenuId(null); }}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
              activeTab === tab ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredData.map((app) => {
          const isActionable = !["Completed", "Cancelled", "Rejected"].includes(app.status);
          const theme = getStatusTheme(app.status);

          return (
            <div key={app._id} className={`group bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 border-l-4 ${theme.border}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${theme.bg} ${theme.text}`}>
                    {getStatusIcon(app.status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-xl text-slate-800">{app.hospitalId?.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${theme.bg} ${theme.text} ${theme.border}`}>
                        {app.status}
                      </span>
                    </div>
                    
                    <p className="text-rose-600 font-black italic text-base mb-3">Dr. {app.doctorId?.name}</p>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        <Calendar size={14} className="text-rose-500" />
                        {new Date(app.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        <Clock size={14} className="text-rose-500" />
                        {app.time}
                      </div>
                    </div>
                  </div>
                </div>

                {isActionable && (
                  <div className="relative self-center md:self-start">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === app._id ? null : app._id)}
                      className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                    >
                      <MoreVertical size={22} />
                    </button>

                    {openMenuId === app._id && (
                      <div ref={menuRef} className="absolute right-0 top-12 w-48 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <button 
                          onClick={() => navigate(`/patient/appointments/reschedule/${app._id}`, { 
                            state: { doctorName: app.doctorId?.name, hospitalName: app.hospitalId?.name }
                          })}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <RefreshCcw size={16} /> Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancelAppointment(app._id)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Ban size={16} /> Cancel Visit
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStatusTheme(status) {
  switch (status) {
    case "Approved": return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" };
    case "Pending": return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" };
    case "Completed": return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" };
    default: return { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" };
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "Approved": return <CheckCircle2 size={24} />;
    case "Pending": return <Clock size={24} />;
    case "Completed": return <History size={24} />;
    default: return <XCircle size={24} />;
  }
}