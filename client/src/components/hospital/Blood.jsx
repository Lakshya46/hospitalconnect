import { useState, useEffect } from "react";
import { MdOpacity, MdAdd, MdRemove, MdWarning } from "react-icons/md";
import api from "../../utils/api";

export default function Blood() {
  const bloodTypes = ["A_pos", "A_neg", "B_pos", "B_neg", "O_pos", "O_neg", "AB_pos", "AB_neg"];
  const [bloodData, setBloodData] = useState({});
  const [quantity, setQuantity] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlood();
  }, []);

  const fetchBlood = async () => {
    try {
      const res = await api.get("/api/blood/inventory");
      setBloodData(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (type, action) => {
    const amount = Number(quantity[type]);
    if (!amount || amount <= 0) return alert("Enter a valid amount");

    try {
      const res = await api.patch("/api/blood/update", {
        type,
        quantity: amount,
        action
      });

      setBloodData(res.data.bloodBank);
      setQuantity({ ...quantity, [type]: "" });
      alert(res.data.msg);
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-rose-600 animate-pulse text-sm tracking-widest">
      SYNCING INVENTORY...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-4 sm:p-6 md:p-8 pt-20 md:pt-4 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-3 italic uppercase leading-none">
          <MdOpacity className="text-rose-600" /> Blood <span className="text-rose-600">Inventory</span>
        </h1>
        <p className="text-slate-400 text-[10px] md:text-xs font-bold mt-2 uppercase tracking-[0.2em] italic">
          Real-time Hematological Reserve Management
        </p>
      </div>

      {/* RESPONSIVE GRID */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {bloodTypes.map((type) => {
          const stock = bloodData[type] || 0;
          const isLow = stock < 5;
          return (
            <div 
              key={type} 
              className={`bg-white p-5 sm:p-6 rounded-[2.5rem] border transition-all duration-300 ${
                isLow 
                ? 'border-rose-200 ring-4 ring-rose-50 shadow-xl shadow-rose-100/20' 
                : 'border-slate-100 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1'
              }`}
            >
              {/* CARD TOP */}
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
                  isLow ? 'bg-rose-600 text-white shadow-rose-200' : 'bg-slate-900 text-white shadow-slate-200'
                }`}>
                  {type.replace("_pos", "+").replace("_neg", "-").replace("_", "")}
                </div>
                {isLow && (
                  <div className="bg-rose-50 px-3 py-1 rounded-full flex items-center gap-1.5 border border-rose-100 animate-pulse">
                    <MdWarning className="text-rose-600" size={12} />
                    <span className="text-[9px] font-black text-rose-600 uppercase tracking-tighter">Critical</span>
                  </div>
                )}
              </div>

              {/* STOCK DISPLAY */}
              <div className="mb-6">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Reserve</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">{stock}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Units</p>
                </div>
              </div>

              {/* ACTION AREA */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="number"
                    value={quantity[type] || ""}
                    onChange={(e) => setQuantity({...quantity, [type]: e.target.value})}
                    placeholder="Enter Units"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent font-bold text-sm focus:border-rose-100 focus:bg-white focus:ring-0 transition-all outline-none placeholder:text-slate-300"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdate(type, "add")} 
                    className="flex-1 py-3.5 bg-emerald-50 text-emerald-700 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    Restock
                  </button>
                  <button 
                    onClick={() => handleUpdate(type, "use")} 
                    className="flex-1 py-3.5 bg-rose-50 text-rose-700 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  >
                    Dispatch
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    
    </div>
  );
}