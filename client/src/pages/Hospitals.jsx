import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import { 
  MdMyLocation, MdSearch, MdLocalHospital, MdDirectionsBus, 
  MdPlace, MdCircle, MdAccessTime, MdStar, MdCall, MdArrowForward
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

// --- CUSTOM MARKER ICONS ---
const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

// Full Filter List from Schema
const hospitalTypes = [
  "General Hospital", "Multi-Specialty", "Super-Specialty",
  "Cardiac Center", "Cancer / Oncology", "Pediatric (Children)",
  "Maternity / Gynecology", "Orthopedic (Bones)", "Neurology",
  "Eye Care (Ophthalmology)", "ENT (Ear, Nose, Throat)", "Dental Clinic",
  "Psychiatric / Mental Health", "Trauma & Emergency", "Ayurvedic / Homeopathy",
  "Diagnostic Center", "Rehabilitation Center"
];

function MapFloatingBtn({ setUserLocation, map }) {
  const handleLocate = (e) => {
    e.stopPropagation();
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(coords);
      if (map) map.flyTo(coords, 15, { duration: 1.5 });
    });
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={handleLocate}
      className="absolute bottom-6 right-6 z-[1000] w-12 h-12 rounded-xl bg-white text-rose-600 flex items-center justify-center shadow-xl border border-slate-100"
    >
      <MdMyLocation size={22} />
    </motion.button>
  );
}

export default function Hospitals() {
  const [map, setMap] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get("/api/hospital/all");
        setHospitals(res.data.map(h => ({
          ...h,
          position: h.coordinates?.coordinates ? [h.coordinates.coordinates[1], h.coordinates.coordinates[0]] : [23.2599, 77.4126]
        })));
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchHospitals();
  }, []);

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h =>
      (h.name?.toLowerCase().includes(search.toLowerCase()) || 
       h.location?.toLowerCase().includes(search.toLowerCase())) &&
      (selectedTypes.length === 0 || h.type?.some(t => selectedTypes.includes(t)))
    );
  }, [hospitals, search, selectedTypes]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FDFEFF] pt-2overflow-hidden">
      
      {/* 1. LEFT SEARCH & CARDS PANE */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-white">
        
        {/* HEADER SECTION */}
        <div className="p-6 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <MdLocalHospital className="text-rose-600" /> Medical Network
            </h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
              <MdCircle size={6} className="animate-pulse" /> Live Data
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="relative group">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                placeholder="Search by name, area or specialty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-50 focus:border-rose-200 transition-all font-medium text-sm outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {hospitalTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border uppercase tracking-wider ${
                    selectedTypes.includes(type) 
                    ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100" 
                    : "bg-white border-slate-200 text-slate-500 hover:border-rose-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. MAP ZONE (Inline) */}
        <div className="px-6 mt-6">
          <div className="relative h-64 w-full rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <MapContainer center={[23.2599, 77.4126]} zoom={13} className="h-full w-full" ref={setMap}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" />
              {userLocation && <Marker position={userLocation} icon={userIcon} />}
              {filteredHospitals.map(h => (
                <Marker key={h._id} position={h.position} icon={hospitalIcon}>
                  <Popup>
                    <div className="p-1 font-bold text-slate-800">{h.name}</div>
                  </Popup>
                </Marker>
              ))}
              <MapFloatingBtn setUserLocation={setUserLocation} map={map} />
            </MapContainer>
          </div>
        </div>

        {/* 3. GRID RESULTS */}
        <div className="p-6 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Centers</h2>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">{filteredHospitals.length} Result</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence>
              {filteredHospitals.map(h => (
                <motion.div
                  layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  key={h._id}
                  onClick={() => navigate(`/${role || 'guest'}/hospital/${h._id}`)}
                  className="group bg-white p-5 rounded-3xl border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-900/5 transition-all cursor-pointer relative overflow-hidden"
                >
                  {/* Status & Rating Row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-1">
                        {h.type?.slice(0, 2).map(t => (
                            <span key={t} className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">{t}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">
                        <MdStar size={12} />
                        <span className="text-[10px] font-bold">4.8</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-800 group-hover:text-rose-600 transition-colors mb-1 truncate">{h.name}</h3>
                  <p className="text-[10px] text-slate-400 mb-4 flex items-center gap-1 font-medium">
                    <MdPlace size={12} className="text-rose-400" /> {h.location}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-slate-50 p-2 rounded-xl text-center">
                        <span className="block text-[7px] font-black text-slate-400 uppercase">Beds</span>
                        <span className="text-xs font-black text-slate-700">{h.beds?.available || 0}</span>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-xl text-center border border-rose-100/50">
                        <span className="block text-[7px] font-black text-rose-400 uppercase">ICU</span>
                        <span className="text-xs font-black text-rose-600">{h.icu?.available || 0}</span>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-xl text-center">
                        <span className="block text-[7px] font-black text-emerald-500 uppercase">Oxygen</span>
                        <span className="text-xs font-black text-emerald-600">Yes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-2 text-slate-500">
                        <MdAccessTime className="text-emerald-500" />
                        <span className="text-[10px] font-bold">Open 24/7</span>
                    </div>
                    <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                        <MdArrowForward size={16} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 4. RIGHT SIDEBAR: AI RECOMMENDATIONS */}
      <div className="w-[380px] bg-slate-50/50 border-l border-slate-100 hidden lg:flex flex-col">
        <div className="p-6 bg-white border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Priority Centers</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Nearest to your location</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredHospitals.slice(0, 5).map((h, i) => (
            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              key={h._id}
              onClick={() => map?.flyTo(h.position, 15)}
              className="p-4 rounded-2xl bg-white border border-slate-100 hover:border-rose-200 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-black shrink-0">
                    {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-xs truncate group-hover:text-rose-600">{h.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <MdDirectionsBus size={12} className="text-rose-400" /> 12 mins
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <MdCall size={12} className="text-emerald-400" /> Call
                        </span>
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          <div className="mt-6 p-5 bg-rose-600 rounded-3xl text-white shadow-xl shadow-rose-200">
             <h4 className="font-black text-sm mb-1 uppercase tracking-widest">Emergency?</h4>
             <p className="text-[10px] opacity-80 leading-relaxed font-bold">Click below to alert the nearest ambulance service and broadcast your GPS coordinates.</p>
             <button className="w-full mt-4 py-3 bg-white text-rose-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-colors">
                SOS Broadcast
             </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F1F5F9; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .leaflet-container { font-family: 'Inter', sans-serif; }
      `}} />
    </div>
  );
}