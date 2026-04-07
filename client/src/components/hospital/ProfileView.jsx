import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { 
  MdEdit, MdLocationOn, MdEmail, MdPhone, MdVerified, 
  MdBadge, MdLocalHospital, MdDescription, MdHome
} from "react-icons/md";
import { motion } from "framer-motion";
import api from "../../utils/api";

const DEFAULT_LOGO = "https://img.icons8.com/fluency/200/hospital-room.png"; 
const DEFAULT_COVER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop";

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
      
      {/* 1. COMPACT HERO */}
      <div className="relative h-[260px] w-full bg-slate-100 overflow-hidden">
        <img 
          src={hospital.coverPhoto || DEFAULT_COVER} 
          className="w-full h-full object-cover" 
          alt="Cover"
          onError={(e) => { e.target.src = DEFAULT_COVER; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FBFCFE] via-transparent to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* 2. SLIM HEADER OVERLAP */}
        <div className="relative -mt-20 flex flex-col md:flex-row items-end justify-between gap-4 mb-10 z-10">
          <div className="flex items-end gap-6">
            <div className="w-32 h-32 bg-white p-2 rounded-[32px] shadow-lg border border-slate-100 overflow-hidden">
              <img 
                src={hospital.image || DEFAULT_LOGO} 
                className="w-full h-full object-cover rounded-[24px] bg-slate-50" 
                alt="Logo"
                onError={(e) => { e.target.src = DEFAULT_LOGO; }}
              />
            </div>
            
            <div className="pb-2 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">
                  {hospital.name}
                </h1>
                {hospital.isVerified && <MdVerified className="text-blue-500" size={18} />}
              </div>
              
              <div className="flex flex-wrap gap-1.5">
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
            className="mb-2 flex items-center gap-2 bg-rose-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-md hover:bg-rose-700 transition-all active:scale-95"
          >
            <MdEdit size={14} /> Edit Profile
          </button>
        </div>

        {/* 3. REFINED GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Card */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <MdDescription size={16} />
                <h2 className="text-[9px] font-black uppercase tracking-widest">Clinical Biography</h2>
              </div>
              <p className="text-slate-600 leading-snug text-base font-medium">
                {hospital.description || "Facility biography not yet provided."}
              </p>
            </div>

            {/* Core Data Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <InfoCard icon={<MdEmail size={20}/>} label="Registry Email" value={hospital.email} />
              <InfoCard icon={<MdHome size={20}/>} label="Location Address" value={hospital.location} />
              <InfoCard icon={<MdPhone size={20}/>} label="Emergency Line" value={hospital.contact} isRose />
              <InfoCard icon={<MdBadge size={20}/>} label="Medical License" value={hospital.licenseNumber} />
            </div>
          </div>

          {/* SIDEBAR MAP */}
          <aside>
            <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MdLocationOn className="text-rose-600" /> GPS Node
              </h2>
              
              <div className="h-[240px] rounded-[20px] overflow-hidden border border-slate-100 relative">
                <MapContainer center={hospital.coordinates} zoom={15} className="h-full w-full" zoomControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  <Marker position={hospital.coordinates} />
                </MapContainer>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-center">
                 <p className="text-[8px] text-slate-400 font-black uppercase tracking-tighter mb-1">Coordinates</p>
                 <p className="text-sm font-black text-slate-700 italic">
                   {hospital.coordinates[0].toFixed(4)}, {hospital.coordinates[1].toFixed(4)}
                 </p>
              </div>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value, isRose = false }) {
  return (
    <div className={`bg-white p-5 rounded-[20px] border ${isRose ? 'border-rose-100' : 'border-slate-50'} flex items-start gap-4`}>
      <div className={`${isRose ? 'text-rose-600' : 'text-slate-300'}`}>
        {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-sm font-bold truncate ${isRose ? 'text-rose-600' : 'text-slate-800'}`}>
          {value || "---"}
        </p>
      </div>
    </div>
  );
}