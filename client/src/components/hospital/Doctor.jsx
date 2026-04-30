import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  MdPersonAdd, MdEdit, MdDelete, MdSearch, MdAccessTime, 
  MdSchool, MdWorkHistory, MdEmail, MdPhone, MdPerson
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
    <div className="h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-12 h-12 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Synchronizing Registry...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="w-full lg:w-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter italic uppercase leading-none">
              Medical <span className="text-rose-600">Experts</span>
            </h1>
            <p className="text-slate-400 text-[10px] md:text-xs font-bold mt-2 uppercase tracking-widest italic">
                Hospital Connect Verified Staff
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64 lg:w-80">
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search name or specialty..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link 
              to="/hospital-admin/doctor/add" 
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[11px] flex items-center justify-center gap-3 hover:bg-rose-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <MdPersonAdd size={18} /> Add Expert
            </Link>
          </div>
        </div>

        {/* DOCTOR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredDoctors.map(doc => {
            // Helper to check if the image is actually usable
            const hasValidImage = doc.image && 
                                  typeof doc.image === 'string' && 
                                  doc.image.length > 5 && 
                                  doc.image !== "null" && 
                                  doc.image !== "undefined";

            return (
              <div key={doc._id} className="bg-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group flex flex-col">
                
                {/* TOP PROFILE SECTION */}
                <div className="flex items-center sm:items-start gap-4 md:gap-5 mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-100 border-2 border-slate-50 shadow-inner shrink-0 flex items-center justify-center relative">
                    {hasValidImage ? (
                      <img 
                        src={doc.image} 
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" 
                        alt={doc.name}
                        onError={(e) => { 
                          // If URL exists but is broken, swap for icon
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="text-slate-300"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="60" width="60" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg></div>';
                        }} 
                      />
                    ) : (
                      <MdPerson className="text-slate-300 text-5xl md:text-6xl" />
                    )}
                  </div>
                  <div className="pt-1 min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 italic uppercase leading-tight truncate">Dr. {doc.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-rose-600 font-black text-[9px] md:text-[10px] uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded-md">
                        {doc.specialization}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-emerald-600">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[9px] font-black uppercase tracking-tighter">{doc.availability || 'Verified'}</span>
                    </div>
                  </div>
                </div>

                {/* DETAILS SECTION */}
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-2 gap-3">
                     <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><MdWorkHistory/> Exp.</p>
                        <p className="text-[11px] font-black text-slate-700">{doc.experience} Years</p>
                     </div>
                     <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <p className="text-[8px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5"><MdSchool/> Degree</p>
                        <p className="text-[10px] font-black text-slate-700 truncate">{doc.education}</p>
                     </div>
                  </div>

                  <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50 space-y-2">
                    <div className="flex items-center gap-3">
                      <MdEmail className="text-slate-400 shrink-0" size={14} />
                      <span className="text-[10px] font-bold truncate text-slate-600">{doc.email || "No email listed"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MdPhone className="text-slate-400 shrink-0" size={14} />
                      <span className="text-[10px] font-bold text-slate-600">{doc.contact || "No contact listed"}</span>
                    </div>
                  </div>

                  {/* Schedule Preview */}
                  <div className="px-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <MdAccessTime size={14} /> Duty Schedule
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {doc.schedule?.filter(s => s.isAvailable).length > 0 ? (
                        doc.schedule.filter(s => s.isAvailable).map(s => (
                          <span key={s.day} className="text-[7px] font-black px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-400 uppercase">
                            {s.day.slice(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8px] font-bold text-slate-300 italic">No public hours</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 md:gap-3 mt-6">
                  <Link 
                    to={`/hospital-admin/doctor/edit/${doc._id}`}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-900 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                  >
                    <MdEdit size={16} /> Edit
                  </Link>
                  <button 
                    onClick={() => deleteDoctor(doc._id)} 
                    className="w-12 md:w-14 h-12 md:h-14 bg-rose-50 text-rose-600 rounded-xl md:rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all active:scale-95 shrink-0"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 mt-10">
            <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-xs">No Experts Match Search</p>
          </div>
        )}
      </div>
    </div>
  );
}