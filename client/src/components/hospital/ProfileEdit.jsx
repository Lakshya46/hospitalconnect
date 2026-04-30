import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdSearch, MdSave, MdArrowBack, MdLocalHospital, 
  MdBadge, MdCloudUpload, MdImage, MdExpandMore, MdClose,
  MdVerifiedUser, MdPhoneInTalk, MdDescription, MdEmail, MdPlace, MdSchedule
} from "react-icons/md";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// --- IMPROVED MEDICAL PIN ICON (STATIC) ---
const STATIC_MARKER_ICON = L.divIcon({
  html: `
    <div style="position: relative; width: 38px; height: 38px;">
      <svg viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.3));">
        <path d="M19 0C11.5442 0 5.5 6.04416 5.5 13.5C5.5 23.625 19 38 19 38C19 38 32.5 23.625 32.5 13.5C32.5 6.04416 26.4558 0 19 0Z" fill="#e11d48"/>
        <path d="M24 12H21V9H17V12H14V16H17V19H21V16H24V12Z" fill="white"/>
      </svg>
      <div style="position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 8px; height: 3px; background: rgba(0,0,0,0.2); border-radius: 50%; filter: blur(1px);"></div>
    </div>
  `,
  className: "",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const HOSPITAL_CATEGORIES = [
  "General Hospital", "Multi-Specialty", "Super-Specialty", "Cardiac Center", 
  "Cancer / Oncology", "Pediatric (Children)", "Maternity / Gynecology", 
  "Orthopedic (Bones)", "Neurology", "Eye Care (Ophthalmology)", 
  "ENT (Ear, Nose, Throat)", "Dental Clinic", "Psychiatric / Mental Health", 
  "Trauma & Emergency", "Ayurvedic / Homeopathy", "Diagnostic Center", "Rehabilitation Center"
];

const DEFAULT_LOGO = "https://img.icons8.com/fluency/200/hospital-room.png"; 
const DEFAULT_COVER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop";

function MapUpdater({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      map.setView(coordinates, 14);
      setTimeout(() => { map.invalidateSize(); }, 300);
    }
  }, [coordinates, map]);
  return null;
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const markerRef = useRef(null);
  const { refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState({ image: null, coverPhoto: null });
  const [previews, setPreviews] = useState({ image: DEFAULT_LOGO, coverPhoto: DEFAULT_COVER });

  const [form, setForm] = useState({
    name: "", type: [], location: "", contact: "",
    email: "", licenseNumber: "", description: "",
    openingTime: "09:00", closingTime: "21:00",
    workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    coordinates: [23.2599, 77.4126] 
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/hospital/me");
        const d = res.data;
        const coords = d.coordinates?.coordinates 
          ? [d.coordinates.coordinates[1], d.coordinates.coordinates[0]] 
          : [23.2599, 77.4126];

        setForm(prev => ({
          ...prev,
          name: d.name || "",
          type: Array.isArray(d.type) ? d.type : d.type ? [d.type] : [],
          location: d.location || "",
          contact: d.contact || "",
          email: d.email || "",
          licenseNumber: d.licenseNumber || "",
          description: d.description || "",
          openingTime: d.openingTime || "09:00",
          closingTime: d.closingTime || "21:00",
          workingDays: d.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
          coordinates: coords
        }));
        setPreviews({ image: d.image || DEFAULT_LOGO, coverPhoto: d.coverPhoto || DEFAULT_COVER });
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleDayToggle = (day) => {
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day) 
        ? prev.workingDays.filter(d => d !== day) 
        : [...prev.workingDays, day]
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setSelectedFiles(prev => ({ ...prev, [name]: files[0] }));
      setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) }));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data.length > 0) {
        setForm(p => ({ 
          ...p, 
          coordinates: [parseFloat(data[0].lat), parseFloat(data[0].lon)], 
          location: data[0].display_name 
        }));
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      
      // Clean type array to fix Enum validation error
      const cleanedTypes = form.type.filter(t => t && t.trim() !== "");

      Object.keys(form).forEach(key => {
        if (key === "coordinates") {
          formData.append(key, JSON.stringify({
            type: "Point", coordinates: [form.coordinates[1], form.coordinates[0]]
          }));
        } else if (key === "type") {
          formData.append(key, JSON.stringify(cleanedTypes));
        } else if (key === "workingDays") {
          formData.append(key, JSON.stringify(form.workingDays));
        } else {
          formData.append(key, form[key]);
        }
      });

      if (selectedFiles.image) formData.append("image", selectedFiles.image);
      if (selectedFiles.coverPhoto) formData.append("coverPhoto", selectedFiles.coverPhoto);

      await api.put("/api/hospital/update", formData, { 
        headers: { "Content-Type": "multipart/form-data" } 
      });
      
      await refreshUser();
      alert("Facility records updated successfully.");
      navigate("/hospital-admin/profile");
    } catch (err) {
      const msg = err.response?.data?.message || "Update failed.";
      alert(msg);
    } finally { setUploading(false); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-rose-600 animate-pulse italic">
      Syncing Facility...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-1 md:p-7 pt-5 md:pt-24 max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 italic leading-tight">Facility <span className="text-rose-600">Identity</span></h1>
          <p className="text-slate-500 font-bold text-[9px] md:text-[10px] mt-1 uppercase tracking-widest">Medical Registry Management</p>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="w-full md:w-auto px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-400 hover:text-rose-600 transition-all flex items-center justify-center gap-2 shadow-sm">
          <MdArrowBack size={16} /> Discard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        
        {/* ROW 1: BRANDING & CONTACT */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* BRANDING CARD */}
          <section className="bg-white p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <header className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <MdImage className="text-rose-600" size={20} />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Branding Assets</h2>
            </header>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="relative group w-28 h-28 mx-auto sm:mx-0 flex-shrink-0">
                <div className="w-full h-full rounded-[25px] bg-slate-50 overflow-hidden border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <img src={previews.image} className="w-full h-full object-cover p-2" alt="logo" />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-[25px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                  <MdCloudUpload className="text-white text-2xl" />
                  <input type="file" name="image" hidden onChange={handleFileChange} />
                </label>
              </div>
              <div className="relative group h-28 w-full">
                <div className="w-full h-full rounded-[25px] bg-slate-50 overflow-hidden border-2 border-dashed border-slate-200">
                  <img src={previews.coverPhoto} className="w-full h-full object-cover" alt="banner" />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-[25px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                  <MdCloudUpload className="text-white text-2xl" />
                  <input type="file" name="coverPhoto" hidden onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </section>

          {/* CONTACT CARD */}
          <section className="bg-white p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center gap-3 border-b border-slate-50 pb-4">
              <MdBadge className="text-rose-600" size={20} />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Core Details</h2>
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Official Name</label>
              <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-rose-100 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Emergency Helpline</label>
              <input value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-rose-600 outline-rose-100 text-sm" />
            </div>
            <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Official Email</label>
                <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-rose-100 text-sm" />
            </div>
          </section>
        </div>

        {/* ROW 2: SCHEDULE & SPECS */}
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* SCHEDULE CARD */}
          <section className="bg-white p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <header className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <MdSchedule className="text-rose-600" size={20} />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Operating Hours</h2>
            </header>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Opens At</label>
                <input type="time" value={form.openingTime} onChange={(e) => setForm({...form, openingTime: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-rose-100 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Closes At</label>
                <input type="time" value={form.closingTime} onChange={(e) => setForm({...form, closingTime: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-rose-100 text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Working Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all ${
                      form.workingDays.includes(day) 
                        ? "bg-rose-600 text-white shadow-md shadow-rose-200" 
                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ACCREDITATION CARD */}
          <section className="bg-white p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-6">
            <header className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <MdVerifiedUser className="text-rose-600" size={20} />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Accreditation</h2>
            </header>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">License No.</label>
                <input value={form.licenseNumber} onChange={(e) => setForm({...form, licenseNumber: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold outline-rose-100 text-sm" />
              </div>
              <div className="space-y-1 relative">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Specializations</label>
                <select 
                  onChange={(e) => { 
                    const val = e.target.value;
                    if(val) { 
                      setForm(prev => ({...prev, type: [...new Set([...prev.type, val])]})); 
                      e.target.value=""; 
                    } 
                  }} 
                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-500 outline-rose-100 appearance-none text-sm"
                >
                  <option value="">+ Add Specialization</option>
                  {HOSPITAL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <MdExpandMore className="absolute right-3 top-[34px] text-slate-400 pointer-events-none" />
              </div>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {form.type.map(t => (
                    <motion.span 
                      key={t}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-wider"
                    >
                      {t} <MdClose className="cursor-pointer text-rose-400" onClick={() => setForm(p => ({...p, type: p.type.filter(x => x !== t)}))} />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>

        {/* ROW 3: BIOGRAPHY */}
        <section className="bg-white p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <MdDescription className="text-rose-600" size={20} />
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest">Public Biography</h2>
          </div>
          <textarea 
            value={form.description} 
            onChange={(e) => setForm({...form, description: e.target.value})} 
            placeholder="Describe clinical expertise, departments, and available facilities..." 
            className="w-full p-4 bg-slate-50 rounded-2xl h-28 font-medium text-slate-600 outline-rose-100 text-sm" 
          />
        </section>

        {/* ROW 4: MAP REGISTRATION */}
        <section className="bg-white p-5 md:p-8 rounded-[30px] md:rounded-[40px] border border-slate-100 shadow-xl shadow-rose-100/20 space-y-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <header className="space-y-1">
              <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em]"><MdLocalHospital size={18} /> GPS Coordination</div>
              <h2 className="text-xl font-black italic text-slate-900">Map Registration</h2>
            </header>

            <div className="flex flex-col sm:flex-row w-full xl:w-[500px] gap-2">
              <div className="relative flex-grow">
                <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder="Search location..." 
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())} 
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-rose-100" 
                />
              </div>
              <button 
                type="button" 
                onClick={handleSearch} 
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-rose-600 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><MdPlace size={12} /> Confirmed Address</label>
            <input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full p-3 md:p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 outline-rose-100 text-sm" />
          </div>

          <div className="h-[300px] md:h-[400px] w-full rounded-[25px] md:rounded-[30px] overflow-hidden border-4 border-slate-50 relative z-0">
            <MapContainer center={form.coordinates} zoom={14} className="h-full w-full">
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              <MapUpdater coordinates={form.coordinates} />
              <Marker 
                position={form.coordinates} 
                draggable={true} 
                icon={STATIC_MARKER_ICON} 
                ref={markerRef} 
                eventHandlers={{ dragend: () => { const m = markerRef.current; if (m) setForm(p => ({ ...p, coordinates: [m.getLatLng().lat, m.getLatLng().lng] })); } }} 
              />
            </MapContainer>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[8px] md:text-[10px] font-black text-rose-600 shadow-sm z-[1000] border border-rose-100">
              DRAG PIN TO ADJUST
            </div>
          </div>

          <button 
            type="submit" 
            disabled={uploading} 
            className="w-full py-5 bg-rose-600 text-white rounded-[25px] md:rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 disabled:bg-slate-200"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><MdSave size={18} /> Update Facility Identity</>
            )}
          </button>
        </section>

      </form>
    </div>
  );
}