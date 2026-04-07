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
      // Matches app.use("/api/blood", bloodRoutes) + router.get("/inventory")
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
      // Matches app.use("/api/blood", bloodRoutes) + router.patch("/update")
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

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-rose-600 animate-pulse">SYNCING INVENTORY...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 pt-24 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <MdOpacity className="text-rose-600" /> Blood Bank <span className="text-rose-600">Inventory</span>
        </h1>
        <p className="text-slate-500 font-medium">Manage your hospital's real-time blood reserves.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {bloodTypes.map((type) => {
          const stock = bloodData[type] || 0;
          const isLow = stock < 5;
          return (
            <div key={type} className={`bg-white p-6 rounded-[32px] border transition-all ${isLow ? 'border-rose-200 ring-4 ring-rose-50 shadow-lg' : 'border-slate-100 hover:shadow-md'}`}>
              <div className="flex justify-between items-center mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isLow ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white'}`}>
                  {type.replace("_pos", "+").replace("_neg", "-").replace("_", "")}
                </div>
                {isLow && <span className="text-[10px] font-black text-rose-600 flex items-center gap-1 animate-pulse"><MdWarning /> CRITICAL</span>}
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Reserve</p>
                <p className="text-3xl font-black text-slate-800">{stock} <span className="text-xs font-medium text-slate-400">Units</span></p>
              </div>

              <div className="space-y-3">
                <input
                  type="number"
                  value={quantity[type] || ""}
                  onChange={(e) => setQuantity({...quantity, [type]: e.target.value})}
                  placeholder="Unit Count"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold text-sm focus:ring-2 focus:ring-slate-900"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(type, "add")} className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-[10px] uppercase hover:bg-emerald-600 hover:text-white transition-all">Restock</button>
                  <button onClick={() => handleUpdate(type, "use")} className="flex-1 py-3 bg-rose-50 text-rose-700 rounded-xl font-bold text-[10px] uppercase hover:bg-rose-600 hover:text-white transition-all">Dispatch</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}