import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MdSearch, MdSave, MdArrowBack, MdLocalHospital, 
  MdBadge, MdCloudUpload, MdImage, MdExpandMore, MdClose,
  MdVerifiedUser, MdPhoneInTalk, MdDescription, MdEmail, MdPlace
} from "react-icons/md";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext"; // ✅ Global Auth Sync

const HOSPITAL_CATEGORIES = [
  "General Hospital", "Multi-Specialty", "Super-Specialty",
  "Cardiac Center", "Cancer / Oncology", "Pediatric (Children)",
  "Maternity / Gynecology", "Orthopedic (Bones)", "Neurology",
  "Eye Care (Ophthalmology)", "ENT (Ear, Nose, Throat)", "Dental Clinic",
  "Psychiatric / Mental Health", "Trauma & Emergency", "Ayurvedic / Homeopathy",
  "Diagnostic Center", "Rehabilitation Center"
];

const DEFAULT_LOGO = "https://img.icons8.com/fluency/200/hospital-room.png"; 
const DEFAULT_COVER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop";

function MapUpdater({ coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coordinates && coordinates.length === 2) {
      map.setView(coordinates, 14);
    }
  }, [coordinates, map]);
  return null;
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const markerRef = useRef(null);
  const { refreshUser } = useAuth(); // ✅ Extract refresh trigger
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({ image: null, coverPhoto: null });
  const [previews, setPreviews] = useState({ image: DEFAULT_LOGO, coverPhoto: DEFAULT_COVER });

  const [form, setForm] = useState({
    name: "",
    type: [],
    location: "",
    contact: "",
    email: "",
    licenseNumber: "",
    description: "",
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

        setForm({
          name: d.name || "",
          type: Array.isArray(d.type) ? d.type : d.type ? [d.type] : [],
          location: d.location || "",
          contact: d.contact || "",
          email: d.email || "",
          licenseNumber: d.licenseNumber || "",
          description: d.description || "",
          coordinates: coords
        });
        
        setPreviews({
          image: d.image || DEFAULT_LOGO,
          coverPhoto: d.coverPhoto || DEFAULT_COVER
        });
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const toggleCategory = (cat) => {
    setForm(prev => {
      const isSelected = prev.type.includes(cat);
      if (isSelected) {
        return { ...prev, type: prev.type.filter(t => t !== cat) };
      } else {
        return { ...prev, type: [...prev.type, cat] };
      }
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      setSelectedFiles(prev => ({ ...prev, [name]: file }));
      setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  const handleSearch = async (query) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
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
      
      // Construct Payload
      Object.keys(form).forEach(key => {
        if (key === "coordinates") {
          formData.append(key, JSON.stringify({
            type: "Point",
            coordinates: [form.coordinates[1], form.coordinates[0]]
          }));
        } else if (key === "type") {
          formData.append(key, JSON.stringify(form.type));
        } else {
          formData.append(key, form[key]);
        }
      });

      if (selectedFiles.image) formData.append("image", selectedFiles.image);
      if (selectedFiles.coverPhoto) formData.append("coverPhoto", selectedFiles.coverPhoto);

      // 1. Update Database
      await api.put("/api/hospital/update", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 2. 🔥 RE-SYNC GLOBAL STATE (Update Sidebar/Navbar Logo & Name)
      await refreshUser();

      alert("Facility records updated successfully.");
      navigate("/hospital-admin/profile");
    } catch (err) {
      console.error("Update Error:", err);
      alert("Update failed. Please check connection or file sizes.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-rose-600 animate-pulse uppercase tracking-widest italic">
      Syncing Facility...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-4 md:p-8 pt-24 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">
            Facility <span className="text-rose-600">Identity</span>
          </h1>
          <p className="text-slate-500 font-bold text-[10px] mt-2 uppercase tracking-[0.2em]">Medical Registry Management</p>
        </div>
        <button type="button" onClick={() => navigate(-1)} className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
          <MdArrowBack className="group-hover:-translate-x-1 transition-transform" /> Discard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
          {/* BRANDING */}
          <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <header className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600"><MdImage size={24} /></div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Branding Assets</h2>
            </header>
            
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Official Logo</p>
                <div className="relative group w-36 h-36">
                  <div className="w-full h-full rounded-[38px] bg-slate-50 overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-rose-300 transition-colors flex items-center justify-center">
                    <img src={previews.image} className="w-full h-full object-cover p-3" alt="logo" onError={(e) => e.target.src = DEFAULT_LOGO} />
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-[38px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <MdCloudUpload className="text-white text-3xl" />
                    <input type="file" name="image" hidden onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Cover Banner</p>
                <div className="relative group h-36 w-full">
                  <div className="w-full h-full rounded-[32px] bg-slate-50 overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-rose-300 transition-colors">
                    <img src={previews.coverPhoto} className="w-full h-full object-cover" alt="banner" onError={(e) => e.target.src = DEFAULT_COVER} />
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm rounded-[32px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <MdCloudUpload className="text-white text-3xl" />
                    <input type="file" name="coverPhoto" hidden onChange={handleFileChange} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* SPECIFICATIONS */}
          <section className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
            <header className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600"><MdBadge size={24} /></div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Facility Specifications</h2>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Official Name</label>
                    <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 outline-rose-100" required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Specialization Tags</label>
                    <div className="relative">
                        <select onChange={(e) => { if(e.target.value) toggleCategory(e.target.value); e.target.value = ""; }} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-400 appearance-none cursor-pointer outline-rose-100">
                            <option value="">+ Add Specialization</option>
                            {HOSPITAL_CATEGORIES.map(cat => (<option key={cat} value={cat} disabled={form.type.includes(cat)} className="text-slate-700">{cat}</option>))}
                        </select>
                        <MdExpandMore className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                    {form.type.map(cat => (
                        <motion.button key={cat} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} type="button" onClick={() => toggleCategory(cat)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-rose-600 transition-colors shadow-lg shadow-slate-100">
                            {cat} <MdClose size={14} className="opacity-50" />
                        </motion.button>
                    ))}
                </AnimatePresence>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <MdPlace size={12} /> Physical Address / Location
                </label>
                <input 
                  value={form.location} 
                  onChange={(e) => setForm({...form, location: e.target.value})} 
                  placeholder="Enter full hospital address..."
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 outline-rose-100" 
                />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><MdVerifiedUser size={12} /> Medical Accreditation No.</label>
                <input value={form.licenseNumber} onChange={(e) => setForm({...form, licenseNumber: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-rose-100" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><MdPhoneInTalk size={12} /> Emergency Helpline</label>
                <input value={form.contact} onChange={(e) => setForm({...form, contact: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-rose-600 outline-rose-100" />
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1">
                    <MdEmail size={12} /> Registered Facility Email
                </label>
                <input 
                  type="email"
                  value={form.email} 
                  onChange={(e) => setForm({...form, email: e.target.value})} 
                  placeholder="admin@hospital.com"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-slate-700 outline-rose-100" 
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-1"><MdDescription size={12} /> Public Biography</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-medium text-slate-500 h-36 leading-relaxed outline-rose-100" placeholder="Describe clinical expertise..." />
            </div>
          </section>
        </div>

        {/* GEO-LOCATION */}
        <aside className="space-y-8">
          <div className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-xl shadow-rose-100/20 space-y-8 sticky top-24">
            <header className="space-y-2">
              <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em]"><MdLocalHospital size={18} /> GPS Coordination</div>
              <h2 className="text-xl font-black italic tracking-tight text-slate-900">Locate Facility</h2>
            </header>

            <div className="relative group">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={20} />
              <input placeholder="Search district or area..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch(e.target.value))} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-3xl text-sm text-slate-700 focus:border-rose-100 focus:bg-white focus:ring-0 font-bold placeholder:text-slate-400 transition-all outline-none" />
            </div>
            
            <div className="h-[340px] w-full rounded-[40px] overflow-hidden border-4 border-slate-50 relative shadow-inner ring-1 ring-rose-50">
              <MapContainer center={form.coordinates} zoom={14} className="h-full w-full">
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <MapUpdater coordinates={form.coordinates} />
                <Marker position={form.coordinates} draggable={true} ref={markerRef} eventHandlers={{ dragend: () => { const m = markerRef.current; if (m) setForm(p => ({ ...p, coordinates: [m.getLatLng().lat, m.getLatLng().lng] })); } }} />
              </MapContainer>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl text-[9px] font-black uppercase text-center text-rose-600 border border-rose-100 shadow-sm pointer-events-none">Drag marker to adjust GPS location</div>
            </div>

            <button type="submit" disabled={uploading} className="w-full py-5 bg-rose-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-200 hover:bg-rose-700 hover:-translate-y-1 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 transition-all flex items-center justify-center gap-3">
              {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><MdSave size={18} /> Save Identity</>}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}