import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, Save, RefreshCcw } from "lucide-react";
import api from "../../utils/api";

export default function RescheduleAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation(); 
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.patch(`/api/appointment/${id}/reschedule`, {
        date: newDate, time: newTime, rescheduled: true, status: "Pending" 
      });
      navigate("/patient/appointments"); 
    } catch (err) {
      alert("Error updating appointment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/20 py-8 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-rose-600 mb-4 font-bold transition-colors">
          <ArrowLeft size={16} />
          <span className="text-[10px] uppercase tracking-widest">Back</span>
        </button>

        <div className="bg-white border border-rose-100 rounded-[1.5rem] p-6 shadow-xl shadow-rose-900/5">
          <header className="mb-5 border-b border-slate-50 pb-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-rose-200">
                <RefreshCcw className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-black text-slate-900 leading-none tracking-tight">Modify Visit</h1>
            </div>

            <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100/50">
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Consulting Physician</p>
              <h2 className="text-lg font-black text-slate-800 leading-tight">
                Dr. {state?.doctorName || "Physician"}
              </h2>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">{state?.hospitalName}</p>
            </div>
          </header>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" size={16} />
                <input 
                  type="date" required 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm text-slate-700 focus:border-rose-300 outline-none transition-all"
                  value={newDate} onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" size={16} />
                <input 
                  type="time" required 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm text-slate-700 focus:border-rose-300 outline-none transition-all"
                  value={newTime} onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-rose-600 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-rose-700 active:scale-[0.98] transition-all shadow-lg shadow-rose-100 mt-2"
            >
              {loading ? "Updating..." : <><Save size={16} /> Confirm Changes</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}