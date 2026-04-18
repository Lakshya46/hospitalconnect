import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  History, 
  RefreshCcw, 
  MoreVertical,
  AlertCircle,
  XCircle
} from "lucide-react";
import api from "../../utils/api";

export default function Appointments() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/appointment/patient-appointments");
        setAppointments(response.data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load your appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // 1. UPDATED FILTER LOGIC: Mapping Schema Enums to UI Tabs
  const filteredData = appointments.filter(app => {
    if (activeTab === "Upcoming") {
      return app.status === "Pending" || app.status === "Approved";
    }
    if (activeTab === "Rescheduled") {
      return app.rescheduled === true;
    }
    if (activeTab === "Past") {
      return app.status === "Completed" || app.status === "Cancelled" || app.status === "Rejected";
    }
    return false;
  });

  const tabs = ["Upcoming", "Rescheduled", "Past"];

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-rose-600"></div>
      <p className="text-slate-500 font-bold italic">Loading medical schedule...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Appointments</h1>
        <p className="text-slate-500 font-medium">Manage and track your clinical visits</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 font-bold text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-white text-rose-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((app) => (
            <div 
              key={app._id} 
              className="group bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex gap-4 items-start">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getStatusStyles(app.status)}`}>
                  {getStatusIcon(app.status)}
                </div>

                <div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight group-hover:text-rose-600 transition-colors">
                    {app.hospitalId?.name || "General Hospital"}
                  </h3>
                  <p className="text-slate-500 text-sm font-bold flex items-center gap-1 mt-1">
                    <span className="text-rose-500 italic">Dr. {app.doctorId?.name || "Specialist"}</span>
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar size={14} className="text-rose-400" />
                      {new Date(app.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <Clock size={14} className="text-rose-400" />
                      {app.time}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-4 md:pt-0">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(app.status)}`}>
                  {app.status}
                </span>
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <History className="text-slate-300 mx-auto mb-4" size={40} />
            <p className="text-slate-400 font-bold">No {activeTab.toLowerCase()} appointments found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. UPDATED UI HELPERS: Matching Schema Status Names
function getStatusStyles(status) {
  switch (status) {
    case "Approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
    case "Pending": return "bg-amber-50 text-amber-600 border-amber-100";
    case "Completed": return "bg-blue-50 text-blue-600 border-blue-100";
    case "Cancelled": 
    case "Rejected": return "bg-rose-50 text-rose-600 border-rose-100";
    default: return "bg-slate-50 text-slate-600 border-slate-100";
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "Approved": return <CheckCircle2 size={24} />;
    case "Pending": return <Clock size={24} />;
    case "Completed": return <History size={24} />;
    case "Cancelled":
    case "Rejected": return <XCircle size={24} />;
    default: return <Calendar size={24} />;
  }
}