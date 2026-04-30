import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { 
  ArrowLeft, Save, Camera, Loader2, User, 
  Phone, Calendar, MapPin, Droplets, Plus, X, 
  Info, HeartPulse, UserCircle, Venus, Mars, Transgender
} from 'lucide-react';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { refreshUser } = useAuth();

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
  const handleGenderSelect = (val) => setFormData({ ...formData, gender: val });

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
      await api.put('api/auth/update-profile', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-red-50 border-t-red-600 rounded-full animate-spin"></div>
          <HeartPulse className="absolute inset-0 m-auto text-red-600 animate-pulse" size={20} />
        </div>
        <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Syncing Vital Data</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-24 font-sans selection:bg-rose-100">
      {/* Background Header - Reduced height for mobile */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-rose-800 via-rose-600 to-rose-500 w-full absolute top-0 z-0 shadow-inner" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-6 md:pt-10">
        
        {/* Header Actions - Adjusted for small screens */}
        <div className="flex items-center justify-between mb-8 md:mb-10 gap-3">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white text-rose-600 h-12 md:h-auto md:px-8 md:py-3.5 rounded-2xl shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all font-black uppercase tracking-widest text-[10px] md:text-xs disabled:opacity-50"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline ml-2 font-bold text-sm">Cancel</span>
          </button>
          
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white text-rose-600 h-12 md:h-auto md:px-8 md:py-3.5 rounded-2xl shadow-xl hover:translate-y-[-2px] active:scale-95 transition-all font-black uppercase tracking-widest text-[10px] md:text-xs disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Syncing...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* Avatar Section - Compact on Mobile */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-gray-200/60 border border-gray-100 flex flex-col items-center lg:sticky lg:top-10">
              <div className="relative group">
                <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 md:ring-8 ring-gray-50 group-hover:ring-red-50 transition-all duration-500">
                  <img 
                    src={previewUrl || 'https://via.placeholder.com/150'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Profile"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current.click()}
                  className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-xl hover:bg-red-700 active:scale-90 transition-all"
                >
                  <Camera size={18} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              <div className="mt-6 md:mt-8 text-center">
                <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight px-4">{formData.name || 'Set Name'}</h2>
                <div className="mt-2 md:mt-3 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Active Profile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/50 rounded-bl-[4rem] -mr-8 -mt-8" />
              
              <div className="flex items-center gap-4 mb-8 md:mb-10 relative">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <UserCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">Identity Records</h3>
                  <p className="text-[10px] md:text-xs font-medium text-gray-400">Manage your core medical profile</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <FormInput label="Full Name" name="name" value={formData.name} onChange={handleChange} icon={<User size={18}/>} />
                <FormInput label="Mobile" name="phone" value={formData.phone} onChange={handleChange} icon={<Phone size={18}/>} />
                <FormInput label="Age" name="age" type="number" value={formData.age} onChange={handleChange} icon={<Calendar size={18}/>} />
                
                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Gender</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100">
                    {[
                      { id: 'Male', icon: <Mars size={14} /> },
                      { id: 'Female', icon: <Venus size={14} /> },
                      { id: 'Other', icon: <Transgender size={14} /> }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGenderSelect(g.id)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[10px] md:text-xs transition-all ${
                          formData.gender === g.id 
                            ? 'bg-white text-rose-600 shadow-md ring-1 ring-rose-100' 
                            : 'text-gray-400'
                        }`}
                      >
                        {g.icon}
                        {g.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Blood Group</label>
                  <div className="relative group">
                    <select 
                      name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}
                      className="w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-red-100 outline-none transition-all appearance-none font-bold text-gray-700 text-sm"
                    >
                      <option value="">Select Type</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                    <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400" size={18} />
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Home Address</label>
                  <div className="relative group">
                    <textarea 
                      name="address" rows="3" value={formData.address} onChange={handleChange}
                      className="w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 rounded-[1.5rem] bg-gray-50 border border-transparent focus:bg-white focus:border-red-100 outline-none transition-all resize-none font-bold text-gray-700 text-sm"
                      placeholder="Current residential address..."
                    />
                    <MapPin className="absolute left-4 top-4 text-red-400" size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History Section */}
            <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                    <HeartPulse size={24} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">Health History</h3>
                </div>
                <button 
                  type="button" onClick={addHistoryField}
                  className="w-full sm:w-auto bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white px-5 py-3 rounded-xl transition-all font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> New Entry
                </button>
              </div>

              <div className="space-y-4 md:space-y-5">
                {formData.history.map((item, index) => (
                  <div key={index} className="flex gap-3 group">
                    <div className="flex-1 relative">
                      <input 
                        value={item} 
                        onChange={(e) => handleHistoryChange(index, e.target.value)}
                        placeholder="Condition or Surgery Name"
                        className="w-full pl-11 md:pl-12 pr-4 py-4 md:py-5 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-red-100 outline-none transition-all font-bold text-gray-700 text-sm"
                      />
                      <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    </div>
                    <button 
                      type="button" onClick={() => removeHistoryField(index)}
                      className="p-4 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                {formData.history.length === 0 && (
                  <p className="text-center py-10 text-gray-300 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-[2rem]">No historical data logged</p>
                )}
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
      <label className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 ml-1">{label}</label>
      <div className="relative group">
        <input 
          {...props}
          className="w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-red-100 outline-none transition-all font-bold text-gray-700 text-sm"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400">
          {icon}
        </div>
      </div>
    </div>
  );
}