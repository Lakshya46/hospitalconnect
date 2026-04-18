import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Activity, Clock, 
  ChevronRight, Bell, Plus, ArrowUpRight, Heart, Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from "../../utils/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Using the absolute path to your patient dashboard stats
        const response = await api.get('api/patient/dashboard');
        setData(response.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCFB]">
      <Loader2 className="animate-spin text-rose-600 mb-4" size={48} />
      <p className="text-rose-600 font-black uppercase tracking-widest text-xs">Syncing Medical Data...</p>
    </div>
  );

  const user = data?.user || {};
  const stats = data?.stats || {};
  const nextApp = data?.nextAppointment || null;

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      <div className="h-64 bg-gradient-to-br from-rose-800 via-rose-600 to-pink-500 w-full absolute top-0 z-0 shadow-inner" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="text-white">
            <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">
              Hello, {user.name ? user.name.split(' ')[0] : 'Patient'}!
            </h1>
            <p className="text-white/80 font-medium">Your Health Records are up to date.</p>
          </div>
          <button 
            onClick={() => navigate('/patient/hospitals')}
            className="flex items-center justify-center gap-3 bg-white text-rose-600 px-8 py-4 rounded-[1.5rem] shadow-2xl shadow-rose-900/30 hover:scale-105 transition-all font-black uppercase tracking-widest text-xs"
          >
            <Plus size={18} /> Book Appointment
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <StatCard title="Upcoming" value={stats.upcomingCount ?? 0} subtitle="Appointments" icon={<Calendar size={24} />} color="bg-rose-50 text-rose-600" />
          <StatCard title="History" value={stats.totalVisits ?? 0} subtitle="Total Visits" icon={<Activity size={24} />} color="bg-blue-50 text-blue-600" />
          <StatCard title="Records" value={stats.reportsCount ?? 0} subtitle="Medical Records" icon={<FileText size={24} />} color="bg-emerald-50 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            
            {/* Next Appointment Detail */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-50">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-8">Next Appointment</h3>
              
              {nextApp ? (
                <div className="flex flex-col md:flex-row items-center gap-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                  <div className="w-full md:w-32 h-32 bg-white rounded-[1.5rem] shadow-sm flex flex-col items-center justify-center border border-rose-100 shrink-0">
                    <span className="text-rose-600 text-sm font-black uppercase tracking-widest">
                      {new Date(nextApp.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-4xl font-black text-gray-800">
                      {new Date(nextApp.date).getDate()}
                    </span>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    {/* ✅ FIXED: Accessing doctor name from the populated doctorId object */}
                    <h4 className="text-xl font-bold text-gray-800">
                        {nextApp.doctorId?.name || "Doctor Pending"}
                    </h4>
                    <p className="text-gray-500 font-medium">
                      {nextApp.hospitalId?.name || 'Hospital Details Unavailable'}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-xs font-bold text-gray-400">
                      <span className="flex items-center gap-1 uppercase"><Clock size={14}/> {nextApp.time}</span>
                      
                      {/* ✅ FIXED: Dynamic status colors based on your Model's Enum */}
                      <span className={`px-2 py-0.5 rounded-md uppercase tracking-widest ${
                          nextApp.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                      }`}>
                          {nextApp.status}
                      </span>
                    </div>
                  </div>

                  <button onClick={() => navigate(`/patient/hospital/${nextApp.hospitalId?._id}`)} className="p-4 bg-white text-gray-400 hover:text-rose-600 rounded-2xl shadow-sm border border-gray-100">
                    <ArrowUpRight size={24} />
                  </button>
                </div>
              ) : (
                <div className="p-10 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold mb-2 tracking-tight">No Active Appointments</p>
                  <button onClick={() => navigate('/patient/hospitals')} className="text-rose-600 font-black text-[10px] uppercase tracking-widest">Explore Hospitals</button>
                </div>
              )}
            </div>

            {/* History Preview */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-50">
              <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-8">Recent History</h3>
              <div className="space-y-4">
                {user.history && user.history.length > 0 ? (
                  user.history.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl hover:bg-rose-50/20 transition-all group border border-transparent hover:border-rose-100">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-all">
                          <Activity size={20} />
                        </div>
                        <p className="font-bold text-gray-800">{item}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-rose-600" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4 font-medium italic">No recent history items found.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Alerts */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-gray-200/40 border border-gray-50">
              <div className="flex items-center gap-3 mb-6">
                <Bell size={20} className="text-rose-600" />
                <h3 className="text-lg font-black text-gray-800 tracking-tight">Alerts</h3>
              </div>
              <div className="space-y-4">
                {(!user.history || user.history.length === 0) && (
                  <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 text-xs font-bold text-rose-900 leading-relaxed">
                    Set up your medical history in your profile to improve diagnosis.
                  </div>
                )}
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs font-bold text-blue-900 leading-relaxed">
                  Real-time synchronization with HospitalConnect Bhopal is active.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col justify-between h-48 group hover:translate-y-[-5px] transition-all">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition-transform`}>{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{title}</span>
      </div>
      <div>
        <h2 className="text-4xl font-black text-gray-800 mb-1 tracking-tight">{value}</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.1em]">{subtitle}</p>
      </div>
    </div>
  );
}