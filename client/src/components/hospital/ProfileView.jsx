import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { 
  MdEdit, MdLocationOn, MdEmail, MdPhone, MdVerified, 
  MdBadge, MdDescription, MdHome, MdSchedule, MdEventAvailable
} from "react-icons/md";
import api from "../../utils/api";

const DEFAULT_LOGO = "https://img.icons8.com/fluency/200/hospital-room.png"; 
const DEFAULT_COVER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop";

const STATIC_MARKER_ICON = L.divIcon({
  html: `
    <div style="position: relative; width: 38px; height: 38px;">
      <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.3));">
        <path d="M19 0C11.5442 0 5.5 6.04416 5.5 13.5C5.5 23.625 19 38 19 38C19 38 32.5 23.625 32.5 13.5C32.5 6.04416 26.4558 0 19 0Z" fill="#e11d48"/>
        <path d="M24 12H21V9H17V12H14V16H17V19H21V16H24V12Z" fill="white"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

export default function ProfileView() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get("/api/hospital/me");
        const d = res.data;
        const coords = d.coordinates?.coordinates
          ? [d.coordinates.coordinates[1], d.coordinates.coordinates[0]]
          : [23.2599, 77.4126];
        setHospital({ ...d, coordinates: coords });
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchHospital();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FBFCFE] pb-12">
      
      {/* 1. HERO BANNER */}
      <div className="relative h-[200px] md:h-[260px] w-full bg-slate-100 overflow-hidden">
        <img 
          src={hospital.coverPhoto || DEFAULT_COVER} 
          className="w-full h-full object-cover" 
          alt="Cover"
          onError={(e) => { e.target.src = DEFAULT_COVER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FBFCFE] via-transparent to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* 2. HEADER OVERLAP */}
        <div className="relative -mt-12 md:-mt-20 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8 md:mb-10 z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
            <div className="w-28 h-28 md:w-32 md:h-32 bg-white p-2 rounded-[28px] md:rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
              <img 
                src={hospital.image || DEFAULT_LOGO} 
                className="w-full h-full object-cover rounded-[20px] md:rounded-[24px] bg-slate-50" 
                alt="Logo"
                onError={(e) => { e.target.src = DEFAULT_LOGO; }}
              />
            </div>
            
            <div className="pb-2 space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic leading-none">
                  {hospital.name}
                </h1>
                {hospital.isVerified && <MdVerified className="text-blue-500 flex-shrink-0" size={18} />}
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                {hospital.type?.map((cat, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-wider rounded-lg">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/hospital-admin/profile/edit")}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-rose-600 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
          >
            <MdEdit size={14} /> Edit Profile
          </button>
        </div>

        {/* 3. CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Biography Card */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <MdDescription size={16} />
                <h2 className="text-[9px] font-black uppercase tracking-widest">Clinical Biography</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
                {hospital.description || "Facility biography not yet provided."}
              </p>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
               <div className="flex items-center gap-2 mb-6 text-slate-400">
                <MdSchedule size={16} />
                <h2 className="text-[9px] font-black uppercase tracking-widest">Schedule & Availability</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-left">Shift Timing</p>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className="flex-1 max-w-[100px] text-center p-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-base md:text-lg border border-rose-100">
                      {hospital.openingTime}
                    </div>
                    <div className="text-slate-300 font-bold">to</div>
                    <div className="flex-1 max-w-[100px] text-center p-3 bg-rose-50 text-rose-600 rounded-2xl font-black text-base md:text-lg border border-rose-100">
                      {hospital.closingTime}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Days</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-1.5">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                      const isActive = hospital.workingDays?.includes(day);
                      return (
                        <span key={day} className={`px-2.5 py-1.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${isActive ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-50 text-slate-300'}`}>
                          {day}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard icon={<MdEmail size={20}/>} label="Registry Email" value={hospital.email} />
              <InfoCard icon={<MdHome size={20}/>} label="Location Address" value={hospital.location} />
              <InfoCard icon={<MdPhone size={20}/>} label="Emergency Line" value={hospital.contact} isRose />
              <InfoCard icon={<MdBadge size={20}/>} label="Medical License" value={hospital.licenseNumber} />
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MdLocationOn className="text-rose-600" /> GPS Node
              </h2>
              
              <div className="h-[200px] md:h-[240px] rounded-[20px] overflow-hidden border border-slate-100 relative z-0">
                <MapContainer center={hospital.coordinates} zoom={15} className="h-full w-full" zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Marker position={hospital.coordinates} icon={STATIC_MARKER_ICON} />
                </MapContainer>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-center">
                 <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter mb-1">Coordinates</p>
                 <p className="text-xs md:text-sm font-black text-slate-700 italic">
                   {hospital.coordinates[0].toFixed(4)}, {hospital.coordinates[1].toFixed(4)}
                 </p>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[24px] text-white shadow-xl shadow-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">System Status</p>
                </div>
                <p className="text-lg md:text-xl font-black italic tracking-tighter">Facility Records are Live & Active</p>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, isRose = false }) {
  return (
    <div className={`bg-white p-5 rounded-[20px] border ${isRose ? 'border-rose-100 bg-rose-50/10' : 'border-slate-50'} flex items-start gap-4`}>
      <div className={`${isRose ? 'text-rose-600' : 'text-slate-300'} flex-shrink-0`}>
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-xs md:text-sm font-bold break-words ${isRose ? 'text-rose-600' : 'text-slate-800'}`}>
          {value || "---"}
        </p>
      </div>
    </div>
  );
}