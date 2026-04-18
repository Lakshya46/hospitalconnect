import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Phone, Mail, Hospital, 
  Stethoscope, Activity, Calendar, Navigation,
  Award, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import api from "../utils/api";

export default function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;
  const isPatientPanel = location.pathname.startsWith("/patient");
  const isHospitalPanel = location.pathname.startsWith("/hospital-admin");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Hospital Details
        const hRes = await api.get(`/api/hospital/by-id/${id}`);
        
        setHospital(hRes.data);

        // 2. Fetch Doctors linked to this Hospital ID
        // Note: Ensure your backend has this route implemented
// Inside useEffect in HospitalDetail.js
const dRes = await api.get(`/api/hospital/doctors/${id}`); // Ensure this path matches the backend route
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

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.address || hospital.location)}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* 🖼️ HERO SECTION */}
      <div className="relative h-64 md:h-80 w-full">
        <img 
          src={hospital.coverPhoto || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000"} 
          alt="Hospital Cover"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white transition-all z-20"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="absolute -bottom-12 left-6 md:left-12 flex items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-2xl border-4 border-white overflow-hidden p-1">
            <img 
              src={hospital.image || "https://cdn-icons-png.flaticon.com/512/3304/3304567.png"} 
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="mb-14 hidden md:flex flex-col gap-2">
             <div className="flex gap-2">
                {hospital.type?.map((t, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {t}
                    </span>
                ))}
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-16">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 🏥 LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-10">
            
            <section>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-black text-slate-900">{hospital.name}</h1>
                {hospital.isVerified && <CheckCircle2 className="text-blue-500 fill-blue-50" size={28} />}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-slate-500">
                <div className="flex items-center gap-1 font-medium">
                  <MapPin size={18} className="text-rose-500" />
                  <span>{hospital.address || hospital.location}</span>
                </div>
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700 transition-colors bg-blue-50 px-3 py-1 rounded-lg text-sm"
                >
                  <Navigation size={16} />
                  Get Directions
                </a>
              </div>

              {/* Description Section */}
              <div className="mt-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-2">About this Facility</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {hospital.description || "Providing comprehensive healthcare services. This facility is equipped with modern medical technology and a professional team dedicated to patient recovery and wellness."}
                </p>
              </div>
            </section>

            {/* 🧑‍⚕️ DOCTORS SECTION */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Stethoscope className="text-rose-500" />
                  Available Specialists
                </h3>
              </div>
              
              {doctors.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {doctors.map((doc) => (
                    <div key={doc._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-rose-200 transition-all flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden relative border border-slate-50">
                        <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${doc.availability === "Available" ? "bg-emerald-500" : "bg-amber-500"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 truncate">{doc.name}</h4>
                        <p className="text-xs text-rose-600 font-bold">{doc.specialization}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                <Award size={12} className="text-amber-500" /> {doc.experience} Years
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                                <Clock size={12} className="text-rose-400" /> {doc.schedule?.[0]?.startTime || "09:00"} - {doc.schedule?.[0]?.endTime || "17:00"}
                            </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-slate-100 rounded-3xl text-center border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium italic">No doctor information currently listed for this hospital.</p>
                </div>
              )}
            </section>

            {/* CAPACITY CARDS */}
            <div className="grid md:grid-cols-3 gap-4">
              <CapacityCard label="Standard Beds" current={hospital.beds?.available} total={hospital.beds?.total} color="bg-blue-500" />
              <CapacityCard label="ICU Units" current={hospital.icu?.available} total={hospital.icu?.total} color="bg-purple-500" />
              <CapacityCard label="Oxygen Cylinders" current={hospital.oxygen?.available} total={hospital.oxygen?.total} color="bg-emerald-500" />
            </div>
          </div>

          {/* ⚡ RIGHT COLUMN: ACTIONS */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
              
              {/* Emergency Alert for Hospital Admins */}
              {role === "hospital" && !hospital.isVerified && (
                 <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 leading-tight font-medium">Your account is pending verification. Some actions may be restricted.</p>
                 </div>
              )}

              <h3 className="text-xl font-black text-slate-900 mb-2">Hospital Services</h3>
              <p className="text-slate-500 text-sm mb-6 font-medium">Access healthcare or manage resources below.</p>

              <div className="space-y-3">
                {!role && (
                  <button onClick={() => navigate("/login")} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    Login to Continue
                  </button>
                )}

                {role === "patient" && (
                  <button
onClick={() => navigate(`/patient/hospital/${hospital._id}/appointment`)}                    className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                  >
                    <Calendar size={20} />
                    Book Appointment
                  </button>
                )}

                {role === "hospital" && (
                  <button
                    onClick={() => navigate(isHospitalPanel ? `/hospital-admin/resources?hospitalId=${hospital._id}` : `/hospital-admin/resources?hospitalId=${hospital._id}`)}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    <Hospital size={20} />
                    Request Resources
                  </button>
                )}
                
                <div className="mt-6 space-y-3">
                    <SidebarContactItem icon={<Phone size={16} />} label="Emergency Call" value={hospital.contact} />
                    <SidebarContactItem icon={<Mail size={16} />} label="Public Email" value={hospital.email} />
                    <SidebarContactItem icon={<Activity size={16} />} label="ER Status" value={hospital.emergencyStatus?.isEROpen ? "Open" : "Closed"} isGreen={hospital.emergencyStatus?.isEROpen} />
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// SUB-COMPONENTS
function CapacityCard({ label, current, total, color }) {
  const percentage = Math.min((current / (total || 1)) * 100, 100);
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-full">
      <div className="mb-4">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-800">{current} <span className="text-slate-300 text-base">/ {total}</span></p>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-700`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function SidebarContactItem({ icon, label, value, isGreen }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
      <div className={`p-2 bg-white rounded-xl shadow-sm ${isGreen ? 'text-emerald-500' : 'text-rose-500'}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
        <p className={`text-xs font-bold truncate ${isGreen ? 'text-emerald-600' : 'text-slate-700'}`}>{value || "N/A"}</p>
      </div>
    </div>
  );
}