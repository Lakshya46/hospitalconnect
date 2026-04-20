import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MdPersonAdd, MdEdit, MdDelete, MdSearch, MdAccessTime, 
  MdSchool, MdWorkHistory, MdEmail, MdPhone 
} from "react-icons/md";
import api from "../../utils/api";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/api/doctors/list");
      setDoctors(res.data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const deleteDoctor = async (id) => {
    if (window.confirm("Remove this doctor permanently from the registry?")) {
      try {
        await api.delete(`/api/doctors/delete/${id}`);
        fetchDoctors();
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Synchronizing Registry...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-5">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase">
              Medical <span className="text-rose-600">Experts</span>
            </h1>
            <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest italic">
               Hospital Connect Verified Staff
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or specialty..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none shadow-sm transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link 
              to="/hospital-admin/doctor/add" 
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] flex items-center gap-3 hover:bg-rose-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <MdPersonAdd size={18} /> Add Doctor
            </Link>
          </div>
        </div>

        {/* DOCTOR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map(doc => (
            <div key={doc._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all relative group flex flex-col">
              
              {/* TOP PROFILE SECTION */}
              <div className="flex items-start gap-5 mb-6">
                <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-inner shrink-0">
                  <img 
                    src={doc.image || "https://via.placeholder.com/150"} 
                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" 
                    alt={doc.name}
                  />
                </div>
                <div className="pt-2 min-w-0">
                  <h3 className="text-xl font-black text-slate-900 italic uppercase leading-tight truncate">Dr. {doc.name}</h3>
                  <p className="text-rose-600 font-black text-[11px] uppercase tracking-wider mt-1 bg-rose-50 px-2 py-0.5 rounded-lg w-fit">
                    {doc.specialization}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-emerald-600">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-tighter">{doc.availability}</span>
                  </div>
                </div>
              </div>

              {/* DETAILS SECTION */}
              <div className="space-y-4 flex-1">
                {/* Education & Experience Chips */}
                <div className="grid grid-cols-2 gap-3">
                   <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><MdWorkHistory/> Experience</p>
                      <p className="text-xs font-black text-slate-700">{doc.experience} Years+</p>
                   </div>
                   <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><MdSchool/> Education</p>
                      <p className="text-[11px] font-black text-slate-700 truncate">{doc.education}</p>
                   </div>
                </div>

                {/* ✅ UPDATED CONTACT SECTION (White Background) */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Contact Information</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3">
                      <MdEmail className="text-slate-400" size={14} />
                      <span className="text-[11px] font-bold truncate text-slate-800">{doc.email || "staff@hospitalconnect.com"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MdPhone className="text-slate-400" size={14} />
                      <span className="text-[11px] font-bold text-slate-800">{doc.contact || "+91 XXXXX XXXXX"}</span>
                    </div>
                  </div>
                </div>

                {/* Schedule Preview */}
                <div className="px-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <MdAccessTime size={14} /> Active Schedule
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.schedule?.filter(s => s.isAvailable).length > 0 ? (
                      doc.schedule.filter(s => s.isAvailable).map(s => (
                        <span key={s.day} className="text-[8px] font-black px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 uppercase">
                          {s.day.slice(0, 3)}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] font-bold text-slate-300 italic">No public hours</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3 mt-8">
                <Link 
                  to={`/hospital-admin/doctor/edit/${doc._id}`}
                  className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  <MdEdit size={16} /> Edit Profile
                </Link>
                <button 
                  onClick={() => deleteDoctor(doc._id)} 
                  className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all active:scale-95 shrink-0"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 mt-10">
            <p className="text-slate-300 font-black uppercase tracking-[0.3em]">No Experts Found</p>
          </div>
        )}
      </div>
    </div>
  );
}