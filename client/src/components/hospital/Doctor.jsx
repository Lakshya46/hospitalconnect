import { useState, useEffect } from "react";
import { 
  MdPersonAdd, MdEdit, MdDelete, MdMedicalServices, 
  MdAccessTime, MdCloudUpload 
} from "react-icons/md";
import api from "../../utils/api";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "", specialization: "", experience: "", education: "", 
    availability: "Available", contact: "", email: "",
    schedule: DAYS_OF_WEEK.map(day => ({ day, startTime: "09:00", endTime: "17:00", isAvailable: false }))
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/api/doctors/list");
      setDoctors(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleScheduleToggle = (index) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index].isAvailable = !newSchedule[index].isAvailable;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleTimeChange = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index][field] = value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'schedule') data.append(key, formData[key]);
    });
    data.append("schedule", JSON.stringify(formData.schedule));
    if (selectedFile) data.append("image", selectedFile);

    try {
      if (editingId) {
        await api.put(`/api/doctors/update/${editingId}`, data);
      } else {
        await api.post("/api/doctors/add", data);
      }
      resetForm();
      fetchDoctors();
    } catch (err) { alert("Operation failed."); }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "", specialization: "", experience: "", education: "", 
      availability: "Available", contact: "", email: "",
      schedule: DAYS_OF_WEEK.map(day => ({ day, startTime: "09:00", endTime: "17:00", isAvailable: false }))
    });
    setSelectedFile(null);
  };

  const deleteDoctor = async (id) => {
    if (window.confirm("Remove this doctor permanently?")) {
      await api.delete(`/api/doctors/delete/${id}`);
      fetchDoctors();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-rose-600 animate-pulse text-sm">LOADING REGISTRY...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-0  max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 px-4 md:px-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">
            Medical <span className="text-rose-600">Experts</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">Manage doctor profiles and consultation hours.</p>
        </div>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-600 transition-all shadow-md text-sm"
        >
          <MdPersonAdd size={18} /> Register Doctor
        </button>
      </div>

      {/* MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-4xl p-8 md:p-10 rounded-[40px] shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-slate-900 mb-6">{editingId ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <input value={formData.name} placeholder="Full Name" className="w-full p-3.5 bg-slate-50 rounded-xl border-none font-bold text-sm" onChange={e => setFormData({...formData, name: e.target.value})} required />
                <input value={formData.specialization} placeholder="Specialization" className="w-full p-3.5 bg-slate-50 rounded-xl border-none font-bold text-sm" onChange={e => setFormData({...formData, specialization: e.target.value})} required />
                <div className="flex gap-3">
                    <input type="number" value={formData.experience} placeholder="Exp" className="w-1/3 p-3.5 bg-slate-50 rounded-xl border-none font-bold text-sm" onChange={e => setFormData({...formData, experience: e.target.value})} required />
                    <input value={formData.education} placeholder="Education" className="w-2/3 p-3.5 bg-slate-50 rounded-xl border-none font-bold text-sm" onChange={e => setFormData({...formData, education: e.target.value})} required />
                </div>
                <select value={formData.availability} className="w-full p-3.5 bg-slate-50 rounded-xl border-none font-bold text-sm text-slate-500" onChange={e => setFormData({...formData, availability: e.target.value})}>
                  <option value="Available">🟢 Available</option>
                  <option value="On Leave">🟡 On Leave</option>
                  <option value="In Surgery">🔴 In Surgery</option>
                </select>
                <label className="w-full p-3 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center cursor-pointer flex flex-col items-center gap-1">
                    <MdCloudUpload size={20} className="text-rose-600" />
                    <span className="text-[10px] font-bold text-slate-400">{selectedFile ? selectedFile.name : "Upload Photo"}</span>
                    <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files[0])} />
                </label>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Consultation Schedule</p>
                <div className="space-y-1.5">
                  {formData.schedule.map((item, index) => (
                    <div key={item.day} className={`flex items-center gap-2 p-2 rounded-lg ${item.isAvailable ? 'bg-rose-50' : 'bg-slate-50 opacity-50'}`}>
                      <input type="checkbox" checked={item.isAvailable} onChange={() => handleScheduleToggle(index)} className="w-3.5 h-3.5 accent-rose-600" />
                      <span className="w-16 text-[10px] font-black text-slate-600 uppercase">{item.day.slice(0,3)}</span>
                      <input type="time" disabled={!item.isAvailable} value={item.startTime} onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)} className="bg-transparent text-[10px] font-bold border-none p-0" />
                      <span className="text-slate-400">-</span>
                      <input type="time" disabled={!item.isAvailable} value={item.endTime} onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)} className="bg-transparent text-[10px] font-bold border-none p-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-8">
              <button type="submit" className="flex-1 py-3.5 bg-rose-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-rose-100 transition-all">
                {editingId ? 'Update Profile' : 'Save Doctor'}
              </button>
              <button type="button" onClick={resetForm} className="px-8 py-3.5 bg-slate-100 text-slate-400 rounded-2xl font-bold uppercase text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* DOCTOR LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 md:px-8 pb-12">
        {doctors.map(doc => (
          <div key={doc._id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group">
            
            <div className={`absolute top-5 right-5 px-3 py-1 rounded-full text-[8px] font-black uppercase ${doc.availability === 'Available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
               {doc.availability}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <img src={doc.image || "https://via.placeholder.com/150"} className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-50" />
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Dr. {doc.name}</h3>
                <p className="text-rose-600 font-bold text-[10px] mt-1.5 uppercase tracking-wide">{doc.specialization}</p>
                <p className="text-slate-400 text-[9px] font-medium mt-0.5">{doc.education}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1.5">
                    <MdAccessTime size={12} /> Schedule
                </p>
                <div className="flex flex-wrap gap-1">
                    {doc.schedule?.filter(s => s.isAvailable).map(s => (
                        <span key={s.day} className="text-[8px] font-black px-2 py-0.5 bg-white border border-slate-100 rounded text-slate-500 uppercase">
                            {s.day.slice(0,3)}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => { setFormData(doc); setEditingId(doc._id); setShowForm(true); }} 
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MdEdit size={14} /> Edit
              </button>
              <button 
                onClick={() => deleteDoctor(doc._id)} 
                className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shrink-0"
              >
                <MdDelete size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}