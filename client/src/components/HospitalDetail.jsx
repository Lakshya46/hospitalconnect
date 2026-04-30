import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Phone, Mail, Hospital, 
  Stethoscope, Activity, Calendar, Navigation,
  Award, Clock, CheckCircle2, Droplets, User,
  Globe, ShieldCheck
} from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = user?.role;

  const bloodGroups = [
    { label: "A+", key: "A_pos" }, { label: "A-", key: "A_neg" },
    { label: "B+", key: "B_pos" }, { label: "B-", key: "B_neg" },
    { label: "O+", key: "O_pos" }, { label: "O-", key: "O_neg" },
    { label: "AB+", key: "AB_pos" }, { label: "AB-", key: "AB_neg" }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hRes = await api.get(`/api/hospital/by-id/${id}`);
        setHospital(hRes.data);
        const dRes = await api.get(`/api/hospital/doctors/${id}`);
        setDoctors(dRes.data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (!hospital) return <div className="p-12 text-center font-bold">Hospital not found</div>;

  const googleMapsUrl = hospital.coordinates?.coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates.coordinates[1]},${hospital.coordinates.coordinates[0]}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.address || hospital.location)}`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-10 font-sans">
      
      {/* 🖼️ HERO SECTION */}
      <div className="relative h-64 md:h-96 w-full">
        <img 
          src={hospital.coverPhoto || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"} 
          alt="Hospital Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 md:top-8 md:left-8 p-2 md:p-3 bg-white/10 backdrop-blur-md hover:bg-white/30 rounded-xl text-white transition-all z-20 border border-white/20">
          <ArrowLeft size={20} />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
          <div className="w-24 h-24 md:w-40 md:h-40 bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl border-[4px] md:border-[6px] border-white overflow-hidden p-1 md:p-2 -mb-8 md:mb-0">
            <img src={hospital.image || "https://cdn-icons-png.flaticon.com/512/3304/3304567.png"} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 mt-10 md:mt-0 pb-2">
            <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 mb-1 md:mb-2">
               <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight leading-tight">{hospital.name}</h1>
               {hospital.isVerified && <ShieldCheck className="text-rose-400 fill-rose-400/20" size={24} className="md:w-8 md:h-8" />}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-slate-200 text-xs md:text-base font-medium">
                <div className="flex items-center gap-1"><MapPin size={14} className="text-rose-400 md:w-[18px]" /> {hospital.location}</div>
                <div className="flex items-center gap-1"><Globe size={14} className="text-rose-400 md:w-[18px]" /> {hospital.type?.[0] || "Medical Center"}</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-16 md:mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
          
          <div className="lg:col-span-2 space-y-8 md:space-y-12">
            {/* ABOUT & DIRECTIONS */}
            <section className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter">Facility Overview</h3>
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center gap-2 bg-rose-600 text-white px-5 py-3 rounded-2xl font-black text-xs md:text-sm shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95 w-full md:w-auto"
                >
                  <Navigation size={16} /> GET DIRECTIONS
                </a>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-lg">
                {hospital.description || "A premier healthcare destination committed to clinical excellence and patient-centric care."}
              </p>
            </section>

            {/* 👨‍⚕️ SPECIALISTS SECTION */}
            <section className="space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3">
                <Stethoscope className="text-rose-500" size={24} className="md:w-7 md:h-7" />
                Available Doctors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {doctors.map((doc) => {
                  const avatarUrl = doc.image && doc.image.trim() !== "" 
                    ? doc.image 
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=fff1f2&color=e11d48&bold=true&size=128`;

                  return (
                    <div key={doc._id} className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                      <div className="flex items-center gap-4 md:gap-5 mb-5 md:mb-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-rose-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <img 
                            src={avatarUrl} 
                            alt={doc.name} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"; }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 text-base md:text-lg leading-tight truncate">{doc.name}</h4>
                          <p className="text-xs md:text-sm text-rose-600 font-bold mb-1">{doc.specialization}</p>
                          <div className="flex items-center gap-1 text-[9px] md:text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg w-fit">
                            <Award size={10} className="text-amber-500 md:w-3 md:h-3" /> {doc.experience} YRS EXP
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#F9FAFB] p-3 md:p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center border-b border-slate-200 pb-2">Visiting Schedule</p>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          {doc.schedule && typeof doc.schedule === 'object' ? (
                             Array.isArray(doc.schedule) ? (
                              doc.schedule.map((s, i) => (
                                <div key={i} className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                  <p className="text-[9px] md:text-[10px] font-black text-rose-500">{s.day}</p>
                                  <p className="text-[8px] md:text-[9px] font-bold text-slate-700">{s.startTime}-{s.endTime}</p>
                                </div>
                              ))
                             ) : (
                              <div className="col-span-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                <p className="text-[9px] md:text-[10px] font-black text-rose-500">{doc.schedule.day}</p>
                                <p className="text-[8px] md:text-[9px] font-bold text-slate-700">{doc.schedule.startTime} - {doc.schedule.endTime}</p>
                              </div>
                             )
                          ) : (
                            <p className="col-span-2 text-[10px] font-bold text-slate-400 py-1 italic">Consultant schedule available on call</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 🔐 LIVE MONITORING */}
            {role === "hospital" && (
<section className="p-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">               
<div className="p-4 md:p-6 pb-2">     
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-1 gap-1">
                    <h3 className="text-lg md:text-2xl font-black text-rose-600 flex items-center gap-3">
                      <Activity className="text-rose-600" size={24} className="md:w-7 md:h-7" />
                      Resource Dashboard
                    </h3>
                    <div className="w-fit px-3 py-1 bg-rose-50 rounded-full flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                       <span className="text-[8px] md:text-[10px] font-black text-rose-600 uppercase tracking-widest">Network Live</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-6 p-6 md:p-8 pt-0">
                  <CapacityCard label="ICU Vacancy" current={hospital.icu?.available} total={hospital.icu?.total} />
                  <CapacityCard label="Standard Beds" current={hospital.beds?.available} total={hospital.beds?.total} />
                  <CapacityCard label="Oxygen Cylinders" current={hospital.oxygen?.available} total={hospital.oxygen?.total} />
                </div>

                <div className="mx-4 md:mx-8 mb-6 md:mb-8 p-4 md:p-8 bg-[#F9FAFB] rounded-3xl md:rounded-[2.5rem] border border-slate-100">
                   <div className="flex items-center gap-3 mb-6 md:mb-8">
                      <div className="p-2 md:p-3 bg-rose-100 text-rose-600 rounded-xl md:rounded-2xl shrink-0"><Droplets size={20} className="md:w-6 md:h-6" /></div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm md:text-lg uppercase tracking-tighter">Blood Reserve</h4>
                        <p className="text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Hospital Inventory</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                      {bloodGroups.map((group) => {
                        const stock = hospital.bloodBank?.[group.key] || 0;
                        return (
                          <div key={group.key} className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm text-center md:text-left">
                            <p className="text-[8px] md:text-[12px] font-black text-rose-500 uppercase mb-1 md:mb-2 tracking-widest">{group.label}</p>
                            <div className="flex items-baseline justify-center md:justify-start gap-1">
                               <p className={`text-xl md:text-3xl font-black ${stock > 0 ? 'text-slate-900' : 'text-slate-200'}`}>
                                 {stock}
                               </p>
                               <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase">Unit</span>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              </section>
            )}
          </div>

          {/* ⚡ SIDEBAR - NON-STICKY FOR MOBILE */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-50">
              <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6">Access Panel</h3>
              
              <div className="space-y-4">
                {user && role === "hospital" ? (
                  <button onClick={() => navigate(`/hospital-admin/resource-request`)} className="w-full bg-rose-600 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-base md:text-lg shadow-xl shadow-rose-200 flex items-center justify-center gap-3 hover:bg-rose-700 transition-all active:scale-95">
                    <Hospital size={20} className="md:w-5 md:h-5" /> Request Resources
                  </button>
                ) : user && role === "patient" ? (
                  <button onClick={() => navigate(`/patient/hospital/${hospital._id}/appointment`)} className="w-full bg-rose-600 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-base md:text-lg shadow-xl shadow-rose-200 flex items-center justify-center gap-3 hover:bg-rose-700 transition-all active:scale-95">
                    <Calendar size={20} className="md:w-5 md:h-5" /> Book Appointment
                  </button>
                ) : (
                  <button onClick={() => navigate("/login")} className="w-full bg-slate-900 text-white py-4 md:py-5 rounded-2xl md:rounded-3xl font-black text-base md:text-lg shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                    Login to Access
                  </button>
                )}

                <div className="pt-6 md:pt-8 space-y-3 md:space-y-4">
                    <SidebarContactItem icon={<Phone size={16} />} label="Primary Line" value={hospital.contact} />
                    <SidebarContactItem icon={<Mail size={16} />} label="Email Address" value={hospital.email} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl md:rounded-[3rem] border border-slate-100">
              <h3 className="text-base md:text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                <Clock size={18} className="text-rose-500 md:w-5 md:h-5" />
                Working Hours
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs md:text-sm font-bold bg-[#F9FAFB] p-3 md:p-4 rounded-xl md:rounded-2xl">
                  <span className="text-slate-400 uppercase text-[9px] md:text-[10px] tracking-widest">Shift</span>
                  <span className="text-slate-800">{hospital.openingTime} - {hospital.closingTime}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1 md:pt-2">
                   {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                     <span key={day} className={`px-2.5 py-1 md:px-3 md:py-1 rounded-lg text-[9px] md:text-[10px] font-black ${hospital.workingDays?.includes(day) ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                       {day}
                     </span>
                   ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function CapacityCard({ label, current, total }) {
  const percentage = Math.min((current / (total || 1)) * 100, 100);
  return (
    // Changed h-36 md:h-44 to h-auto and reduced vertical padding
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-auto gap-3 hover:border-rose-200 transition-all">
      <div>
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl md:text-3xl font-black text-slate-900">{current || 0}</span>
          <span className="text-slate-300 font-bold text-xs md:text-sm">/ {total || 0}</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 h-1.5 md:h-2 rounded-full overflow-hidden">
        <div className="h-full bg-rose-600 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function SidebarContactItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-[#F9FAFB] rounded-2xl md:rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:border-rose-200">
      <div className="p-2 md:p-2.5 bg-white rounded-xl shadow-sm text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs font-black text-slate-700 truncate">{value || "N/A"}</p>
      </div>
    </div>
  );
}