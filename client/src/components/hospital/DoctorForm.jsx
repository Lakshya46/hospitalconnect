import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MdArrowBack, MdCloudUpload, MdAccessTime, MdSave, MdPhone, MdEmail } from "react-icons/md";
import api from "../../utils/api";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Oncologist", "Pediatrician", 
  "Gynecologist", "Orthopedic Surgeon", "Neurologist", "Ophthalmologist", 
  "ENT Specialist", "Dentist", "Psychiatrist", "Emergency Specialist", 
  "Ayurvedic Doctor", "Radiologist", "Physiotherapist"
];

export default function DoctorForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "", 
    specialization: "", 
    experience: "", 
    education: "", 
    availability: "Available", 
    contact: "", // ✅ Added
    email: "",   // ✅ Added
    schedule: DAYS_OF_WEEK.map(day => ({ day, startTime: "09:00", endTime: "17:00", isAvailable: false }))
  });

  useEffect(() => {
    if (id) fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      const res = await api.get(`/api/doctors/details/${id}`);
      setFormData(res.data);
    } catch (err) {
      console.error("Failed to load doctor info");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'schedule') data.append(key, formData[key]);
    });
    data.append("schedule", JSON.stringify(formData.schedule));
    if (selectedFile) data.append("image", selectedFile);

    try {
      if (id) {
        await api.put(`/api/doctors/update/${id}`, data);
      } else {
        await api.post("/api/doctors/add", data);
      }
      navigate("/hospital-admin/doctor");
    } catch (err) {
      alert("Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Back Header */}
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => navigate(-1)} className="p-3 bg-white rounded-2xl shadow-sm hover:text-rose-600 transition-all">
          <MdArrowBack size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 italic uppercase">
            {id ? 'Edit' : 'Register'} <span className="text-rose-600">Specialist</span>
          </h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Complete the physician profile below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            
            {/* Basic Info Group */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input value={formData.name} required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-rose-500" onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specialty</label>
                <select value={formData.specialization} required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none appearance-none" onChange={e => setFormData({...formData, specialization: e.target.value})}>
                  <option value="">Select Specialty</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Experience & Education Group */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Experience (Yrs)</label>
                <input type="number" value={formData.experience} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none" onChange={e => setFormData({...formData, experience: e.target.value})} />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credentials / Education</label>
                <input value={formData.education} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none" onChange={e => setFormData({...formData, education: e.target.value})} />
              </div>
            </div>

            {/* ✅ NEW: Contact Details Group */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative">
                    <MdPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" />
                    <input type="tel" value={formData.contact} placeholder="+91 XXXXX XXXXX" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-rose-500" onChange={e => setFormData({...formData, contact: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                    <MdEmail className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" />
                    <input type="email" value={formData.email} placeholder="doctor@hospital.com" className="w-full p-4 pl-12 bg-slate-50 rounded-2xl border-none font-bold text-sm outline-none focus:ring-2 focus:ring-rose-500" onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
              <select value={formData.availability} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm text-slate-700 outline-none" onChange={e => setFormData({...formData, availability: e.target.value})}>
                <option value="Available">Available</option>
                <option value="Busy">Busy / In Surgery</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <label className="flex flex-col items-center justify-center w-full h-48 bg-rose-50/30 rounded-[2.5rem] border-2 border-dashed border-rose-100 cursor-pointer hover:bg-rose-50 transition-all">
            <MdCloudUpload size={40} className="text-rose-600 mb-2" />
            <p className="text-[11px] font-black text-rose-600 uppercase tracking-[0.2em]">{selectedFile ? selectedFile.name : "Upload Professional Avatar"}</p>
            <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files[0])} accept="image/*" />
          </label>
        </div>

        {/* Schedule Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
              <MdAccessTime size={18} className="text-rose-600" /> Availability
            </h3>
            <div className="space-y-3">
              {formData.schedule.map((item, index) => (
                <div key={item.day} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${item.isAvailable ? 'bg-rose-50/50 ring-1 ring-rose-100' : 'opacity-40'}`}>
                  <input type="checkbox" checked={item.isAvailable} onChange={() => {
                    const newSched = [...formData.schedule];
                    newSched[index].isAvailable = !newSched[index].isAvailable;
                    setFormData({...formData, schedule: newSched});
                  }} className="w-4 h-4 accent-rose-600" />
                  <span className="flex-1 text-[10px] font-black text-slate-700 uppercase">{item.day.slice(0,3)}</span>
                  <div className="flex items-center gap-1">
                    <input type="time" disabled={!item.isAvailable} value={item.startTime} className="bg-transparent text-[10px] font-black text-rose-600 outline-none" onChange={e => {
                       const newSched = [...formData.schedule];
                       newSched[index].startTime = e.target.value;
                       setFormData({...formData, schedule: newSched});
                    }} />
                    <span className="text-slate-300">-</span>
                    <input type="time" disabled={!item.isAvailable} value={item.endTime} className="bg-transparent text-[10px] font-black text-rose-600 outline-none" onChange={e => {
                       const newSched = [...formData.schedule];
                       newSched[index].endTime = e.target.value;
                       setFormData({...formData, schedule: newSched});
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-rose-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all flex items-center justify-center gap-3">
            {loading ? "Processing..." : <><MdSave size={20}/> {id ? 'Update Registry' : 'Confirm Registration'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}