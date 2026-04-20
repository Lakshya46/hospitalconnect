import { useState, useEffect } from "react";
import { MdHotel, MdEmergency, MdAir, MdAdd, MdRemove, MdFlashOn, MdCheck } from "react-icons/md";
import api from "../../utils/api";

export default function Resources() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State to track manual input for each category
  const [inputValues, setInputValues] = useState({ beds: "", icu: "", oxygen: "" });

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      const res = await api.get("/api/resources/status");
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Handle standard +/- buttons (uses $inc on backend)
  const handleUpdate = async (category, field, value) => {
    if (value === -1 && data[category][field] <= 0) return;
    try {
      const res = await api.patch("/api/resources/update", { category, field, value });
      setData({ ...data, [category]: res.data.data });
    } catch (err) { alert("Update failed"); }
  };

  // Handle manual input submission (sets the absolute value)
  const handleManualSubmit = async (category) => {
    const newValue = parseInt(inputValues[category]);
    if (isNaN(newValue) || newValue < 0) return;

    try {
      // We need a small change in backend to support "SET" instead of just "INC"
      // For now, let's assume we send a specific type
      const res = await api.patch("/api/resources/set-total", { 
        category, 
        value: newValue 
      });
      setData({ ...data, [category]: res.data.data });
      setInputValues({ ...inputValues, [category]: "" }); // Clear input
    } catch (err) { alert("Failed to set total"); }
  };

  const toggleEmergency = async (field) => {
    try {
      const res = await api.patch("/api/resources/toggle-emergency", { field });
      setData({ ...data, emergencyStatus: res.data.status });
    } catch (err) { alert("Toggle failed"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-rose-600 animate-pulse">CONNECTING...</div>;

  return (
    <div className="min-h-screen bg-white p-0 pt-2 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="px-6 md:px-8 mb-10">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">Live <span className="text-rose-600">Resources</span></h1>
      </div>

      {/* EMERGENCY TOGGLES (Same as before) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 md:px-8 mb-10">
          <div onClick={() => toggleEmergency('isEROpen')} className={`cursor-pointer p-6 rounded-[32px] flex items-center justify-between transition-all ${data.emergencyStatus?.isEROpen ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
              <div className="flex items-center gap-4">
                  <MdFlashOn size={32} />
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-80">Emergency Ward</p>
                    <p className="text-2xl font-black uppercase">{data.emergencyStatus?.isEROpen ? 'Open' : 'Closed'}</p>
                  </div>
              </div>
          </div>
          {/* ... Ambulance Toggle ... */}
      </div>

      {/* RESOURCE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 md:px-8 pb-12">
        {[
          { label: "General Beds", cat: "beds", icon: MdHotel, color: "rose" },
          { label: "ICU Reserve", cat: "icu", icon: MdEmergency, color: "blue" },
          { label: "Oxygen Support", cat: "oxygen", icon: MdAir, color: "teal" }
        ].map((item) => (
          <div key={item.cat} className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <item.icon className={`text-${item.color}-500`} size={22} />
                <h3 className="font-black text-slate-800 uppercase text-[10px] tracking-widest">{item.label}</h3>
            </div>

            <div className="space-y-6">
                {/* TOTAL CAPACITY WITH INPUT */}
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Set Total Capacity</p>
                    <div className="flex gap-2 mb-3">
                        <input 
                          type="number" 
                          placeholder={data[item.cat]?.total}
                          value={inputValues[item.cat]}
                          onChange={(e) => setInputValues({...inputValues, [item.cat]: e.target.value})}
                          className="flex-1 bg-slate-50 border-none rounded-xl font-bold text-sm p-3 focus:ring-2 focus:ring-slate-900"
                        />
                        <button 
                          onClick={() => handleManualSubmit(item.cat)}
                          className="bg-slate-900 text-white px-4 rounded-xl hover:bg-rose-600 transition-all"
                        >
                          <MdCheck size={20} />
                        </button>
                    </div>
                </div>

                {/* LIVE AVAILABILITY (The big buttons) */}
                <div className={`p-6 rounded-[28px] ${data[item.cat]?.available < 5 ? 'bg-rose-50 ring-2 ring-rose-100' : 'bg-slate-50'}`}>
                    <p className={`text-[10px] font-black uppercase mb-4 ${data[item.cat]?.available < 5 ? 'text-rose-600' : 'text-slate-400'}`}>
                        Live Available
                    </p>
                    <div className="flex justify-between items-center">
                        <p className={`text-5xl font-black ${data[item.cat]?.available < 5 ? 'text-rose-600' : 'text-slate-900'}`}>{data[item.cat]?.available}</p>
                        <div className="flex gap-2">
                            <button onClick={() => handleUpdate(item.cat, 'available', -1)} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"><MdRemove size={20} /></button>
                            <button onClick={() => handleUpdate(item.cat, 'available', 1)} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"><MdAdd size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}