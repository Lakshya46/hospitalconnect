import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext"; // ✅ Added Auth Hook
import { 
  ArrowLeft, Save, Camera, Loader2, User, 
  Phone, Calendar, MapPin, Droplets, Plus, X, 
  Info, HeartPulse, UserCircle
} from 'lucide-react';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { refreshUser } = useAuth(); // ✅ Extract refresh trigger

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '', phone: '', age: '', gender: '', 
    bloodGroup: '', address: '', history: []
  });

  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('api/auth/me'); 
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          age: data.age || '',
          gender: data.gender || '',
          bloodGroup: data.bloodGroup || '',
          address: data.address || '',
          history: Array.isArray(data.history) ? data.history : []
        });
        if (data.profilePic) setPreviewUrl(data.profilePic);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleHistoryChange = (index, value) => {
    const newHistory = [...formData.history];
    newHistory[index] = value;
    setFormData({ ...formData, history: newHistory });
  };

  const addHistoryField = () => setFormData({ ...formData, history: [...formData.history, ""] });
  const removeHistoryField = (index) => setFormData({ ...formData, history: formData.history.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const uploadData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'history') uploadData.append(key, JSON.stringify(formData[key]));
      else uploadData.append(key, formData[key]);
    });
    
    if (selectedFile) uploadData.append('profilePic', selectedFile);

    try {
      // 1. Send Update to Server
      await api.put('api/auth/update-profile', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 2. 🔥 TRIGGER GLOBAL RE-RENDER
      // This updates the Context 'user' state, which forces Sidebar & Header to update
      await refreshUser(); 

      navigate('/patient/profile'); 
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-red-50 border-t-red-600 rounded-full animate-spin"></div>
          <HeartPulse className="absolute inset-0 m-auto text-red-600 animate-pulse" size={24} />
        </div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Accessing Vital Records</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20 font-sans">
      <div className="h-64 bg-gradient-to-br from-rose-800 via-rose-600 to-rose-500 w-full absolute top-0 z-0 shadow-inner" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between mb-10">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-all bg-white/10 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/20 shadow-lg"
          >
            <ArrowLeft size={20} />
            <span className="font-bold text-sm tracking-tight">Cancel</span>
          </button>
          
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-3 bg-white text-red-600 px-8 py-3 rounded-2xl shadow-2xl shadow-red-900/30 hover:translate-y-[-2px] active:translate-y-[1px] transition-all font-black uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Syncing...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Avatar Section */}
          <div className="lg:col-span-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-200/60 border border-gray-100 flex flex-col items-center sticky top-10">
              <div className="relative group">
                <div className="w-44 h-44 rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-gray-50 group-hover:ring-red-50 transition-all duration-500">
                  <img 
                    src={previewUrl || 'https://via.placeholder.com/150'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Profile"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-4 rounded-2xl shadow-xl hover:bg-red-700 transition-all hover:rotate-12"
                >
                  <Camera size={20} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">{formData.name || 'Set Name'}</h2>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Profile Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50/50 rounded-bl-[5rem] -mr-10 -mt-10" />
              <div className="flex items-center gap-4 mb-10 relative">
                <div className="p-3.5 bg-red-50 text-red-600 rounded-[1.2rem]">
                  <UserCircle size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">Personal Details</h3>
                  <p className="text-xs font-medium text-gray-400">Update your primary identification records</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                <FormInput label="Full Name" name="name" value={formData.name} onChange={handleChange} icon={<User size={18}/>} />
                <FormInput label="Mobile" name="phone" value={formData.phone} onChange={handleChange} icon={<Phone size={18}/>} />
                <FormInput label="Age" name="age" type="number" value={formData.age} onChange={handleChange} icon={<Calendar size={18}/>} />
                
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Blood Group</label>
                  <div className="relative group">
                    <select 
                      name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50/50 outline-none transition-all appearance-none font-bold text-gray-700"
                    >
                      <option value="">Choose Type</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                    <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" size={18} />
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Address</label>
                  <div className="relative group">
                    <textarea 
                      name="address" rows="3" value={formData.address} onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50/50 outline-none transition-all resize-none font-bold text-gray-700"
                      placeholder="Street, Landmark..."
                    />
                    <MapPin className="absolute left-4 top-5 text-red-400" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-rose-50 text-rose-600 rounded-[1.2rem]">
                    <HeartPulse size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight">Clinical Records</h3>
                </div>
                <button 
                  type="button" onClick={addHistoryField}
                  className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-5 py-2.5 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                >
                  <Plus size={16} /> New Entry
                </button>
              </div>

              <div className="space-y-5">
                {formData.history.map((item, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-1 relative">
                      <input 
                        value={item} 
                        onChange={(e) => handleHistoryChange(index, e.target.value)}
                        placeholder="Condition / Surgery Name (Year)"
                        className="w-full pl-12 pr-4 py-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50/50 outline-none transition-all font-bold text-gray-700"
                      />
                      <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    </div>
                    <button 
                      type="button" onClick={() => removeHistoryField(index)}
                      className="p-5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                    >
                      <X size={24} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, icon, ...props }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">{label}</label>
      <div className="relative group">
        <input 
          {...props}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50/50 outline-none transition-all font-bold text-gray-700"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400">
          {icon}
        </div>
      </div>
    </div>
  );
}