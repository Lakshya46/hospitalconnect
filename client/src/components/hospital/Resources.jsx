import { useState, useEffect } from "react";
import { MdHotel, MdEmergency, MdAir, MdAdd, MdRemove, MdCheck } from "react-icons/md";
import api from "../../utils/api";

export default function Resources() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputValues, setInputValues] = useState({ beds: "", icu: "", oxygen: "" });

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    try {
      const res = await api.get("/api/resources/status");
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (category, field, value) => {
    const currentCategory = data[category];
    
    // Constraint: Don't decrease below 0
    if (value === -1 && currentCategory[field] <= 0) return;

    // Constraint: Availability cannot exceed Total Capacity
    if (field === 'available' && value === 1) {
        if (currentCategory.available >= currentCategory.total) {
            alert("Availability cannot exceed total capacity");
            return;
        }
    }

    try {
      const res = await api.patch("/api/resources/update", { category, field, value });
      setData({ ...data, [category]: res.data.data });
    } catch (err) { alert("Update failed"); }
  };

  const handleManualSubmit = async (category) => {
    const newValue = parseInt(inputValues[category]);
    if (isNaN(newValue) || newValue < 0) return;

    try {
      const res = await api.patch("/api/resources/set-total", { 
        category, 
        value: newValue 
      });
      setData({ ...data, [category]: res.data.data });
      setInputValues({ ...inputValues, [category]: "" }); 
    } catch (err) { alert("Failed to set total"); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-rose-600 animate-pulse italic tracking-widest text-sm">
      SYNCING RESOURCES...
    </div>
  );

  const resourceTypes = [
    { label: "General Beds", cat: "beds", icon: MdHotel, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "ICU Reserve", cat: "icu", icon: MdEmergency, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Oxygen Support", cat: "oxygen", icon: MdAir, color: "text-teal-500", bg: "bg-teal-50" }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-4 sm:p-6 md:p-8 pt-20 md:pt-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic leading-none">
          Live <span className="text-rose-600">Resources</span>
        </h1>
        <p className="text-slate-400 text-[9px] md:text-xs font-bold mt-2 uppercase tracking-[0.2em]">
          Real-time inventory management
        </p>
      </div>

      {/* RESOURCE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
        {resourceTypes.map((item) => {
          const resData = data[item.cat] || { available: 0, total: 0 };
          const isLow = resData.available < 5;
          const isFull = resData.available >= resData.total;
          const progress = resData.total > 0 ? (resData.available / resData.total) * 100 : 0;

          return (
            <div key={item.cat} className="bg-white p-5 sm:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-slate-200/50">
              <div>
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <div className={`p-3 rounded-2xl ${item.bg}`}>
                    <item.icon className={item.color} size={24} />
                  </div>
                  <h3 className="font-black text-slate-800 uppercase text-[10px] sm:text-[11px] tracking-widest">{item.label}</h3>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {/* TOTAL CAPACITY INPUT */}
                  <div>
                    <div className="flex justify-between items-center mb-3 px-1">
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-tighter">Capacity</p>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">Total: {resData.total}</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        placeholder="Set total..."
                        value={inputValues[item.cat]}
                        onChange={(e) => setInputValues({...inputValues, [item.cat]: e.target.value})}
                        className="flex-1 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm p-3 focus:border-rose-100 focus:bg-white focus:ring-0 outline-none transition-all w-full"
                      />
                      <button 
                        onClick={() => handleManualSubmit(item.cat)}
                        className="bg-slate-900 text-white px-4 sm:px-5 rounded-2xl hover:bg-rose-600 transition-all active:scale-90"
                      >
                        <MdCheck size={20} />
                      </button>
                    </div>
                  </div>

                  {/* LIVE AVAILABILITY COUNTER */}
                  <div className={`p-5 sm:p-6 rounded-[2rem] transition-colors ${isLow ? 'bg-rose-50 ring-2 ring-rose-100' : 'bg-slate-50'}`}>
                    <p className={`text-[9px] sm:text-[10px] font-black uppercase mb-4 tracking-widest ${isLow ? 'text-rose-600' : 'text-slate-400'}`}>
                      {isLow ? '⚠️ Critical Stock' : 'Currently Available'}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-baseline gap-1">
                         <p className={`text-4xl sm:text-5xl font-black tracking-tighter ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                            {resData.available}
                         </p>
                         <span className="text-[10px] sm:text-xs font-bold text-slate-400">/{resData.total}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdate(item.cat, 'available', -1)} 
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white shadow-sm flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all active:scale-95 border border-slate-100"
                        >
                          <MdRemove size={20} />
                        </button>
                        <button 
                          onClick={() => handleUpdate(item.cat, 'available', 1)} 
                          disabled={isFull}
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center transition-all active:scale-95 border border-slate-100 ${isFull ? 'bg-slate-100 text-slate-300' : 'bg-white hover:bg-emerald-600 hover:text-white'}`}
                        >
                          <MdAdd size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CAPACITY PROGRESS BAR */}
              <div className="mt-8 pt-6 border-t border-slate-50">
                <div className="w-full bg-slate-100 h-1.5 sm:h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}