import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, History, Activity, CheckCircle2, Clock, XCircle, Package, ArrowUpRight, 
  MapPin, AlertCircle, Phone, Search, Plus, Building2, Trash2, UserPlus, 
  Droplet, Box, ArrowRight, Share2, Loader2, Send
} from "lucide-react";
import api from "../../utils/api";

export default function ResourceRequest() {
  const [panel, setPanel] = useState("request"); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [requestList, setRequestList] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [discoveredHospitals, setDiscoveredHospitals] = useState([]);
  
  const [currentItem, setCurrentItem] = useState({
    category: "Supplies",
    type: "Oxygen",
    quantity: 1,
    urgency: "High"
  });

  // Inside ResourceRequest.jsx
const categories = {
  Supplies: ["Oxygen", "ICU Bed", "Ventilator"],
  Blood: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  // These should match the strings in your 'departments' array in the DB
  Doctor: ["Cardiology", "Neurology", "Pediatrics", "Surgery"] 
};

  // --- FETCH DATA LOGIC ---

 // Inside ResourceRequest.jsx -> fetchStatusBoard
const fetchStatusBoard = useCallback(async () => {
  try {
    // 🔥 Changed from /api/resources/my-requests to /api/requests/my-requests
    const res = await api.get("/api/requests/my-requests"); 
    setMyRequests(res.data);
  } catch (err) {
    console.error("Error fetching status board:", err);
  }
}, []);

  useEffect(() => {
    if (panel === "updates") {
      fetchStatusBoard();
    }
  }, [panel, fetchStatusBoard]);

  // --- HANDLERS ---

  const addItemToRequest = () => {
    const finalItem = { 
      ...currentItem, 
      quantity: currentItem.category === "Doctor" ? 1 : currentItem.quantity,
      id: Date.now() 
    };
    setRequestList([...requestList, finalItem]);
  };

  const removeItem = (id) => {
    setRequestList(requestList.filter(item => item.id !== id));
  };

  // Step 1 -> Step 2: Search for matching hospitals based on the first item in bundle
 const handleNextStep = async () => {
    if (requestList.length === 0) return;
    setLoading(true);
    
    const primaryItem = requestList[0];
    console.log("🔍 API CALL: Discovery Search Initiated", {
      endpoint: "/api/hospital/search-resources",
      params: { type: primaryItem.type, qty: primaryItem.quantity }
    });

    try {
      const res = await api.get(`/api/hospital/search-resources?type=${encodeURIComponent(primaryItem.type)}&qty=${primaryItem.quantity}`);
      
      console.log("✅ API RESPONSE: Hospitals Found", res.data);
      setDiscoveredHospitals(res.data);
      setStep(2);
    } catch (err) {
      console.error("❌ API ERROR: Discovery Failed", err.response?.data || err.message);
      alert("Discovery failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

// Inside ResourceRequest.jsx -> submitRequest function
const submitRequest = async (receiverId = null) => {
  setLoading(true);
  try {
    const payload = {
      items: requestList,
      receiverHospitalId: receiverId,
      urgency: currentItem.urgency
    };

    // 🔥 Changed from /api/resources/request to /api/requests/request
    const res = await api.post("/api/requests/request", payload); 
    
    console.log("✅ Request Created:", res.data);
    alert(receiverId ? "Direct Request Sent!" : "Broadcast Sent!");
    setRequestList([]);
    setPanel("updates");
  } catch (err) {
    console.error("❌ Submission Error:", err.response?.data || err.message);
    alert(err.response?.data?.msg || "Failed to submit request");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      {/* 1. TOP PANEL SWITCHER */}
      <div className="flex gap-4 mb-10 bg-slate-100 p-1.5 rounded-3xl w-fit mx-auto border border-slate-200 shadow-inner">
        <button 
          onClick={() => { setPanel("request"); setStep(1); }} 
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all ${panel === "request" ? "bg-white text-rose-600 shadow-xl" : "text-slate-500"}`}
        >
          <Plus size={16} /> New Request
        </button>
        <button 
          onClick={() => setPanel("updates")} 
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all ${panel === "updates" ? "bg-white text-rose-600 shadow-xl" : "text-slate-500"}`}
        >
          <Activity size={16} /> Status Board
        </button>
      </div>

      <AnimatePresence mode="wait">
        {panel === "request" ? (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            
            {/* STEP 1: BUNDLE BUILDER */}
            {step === 1 && (
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6 italic">Add <span className="text-rose-600">Requirement</span></h3>
                    <div className="space-y-4">
                      <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                        {Object.keys(categories).map(cat => (
                          <button key={cat} onClick={() => setCurrentItem({...currentItem, category: cat, type: categories[cat][0]})} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentItem.category === cat ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>{cat}</button>
                        ))}
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{currentItem.category === 'Doctor' ? 'Specialist' : 'Type'}</label>
                        <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" value={currentItem.type} onChange={(e) => setCurrentItem({...currentItem, type: e.target.value})}>
                          {categories[currentItem.category].map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      </div>

                      <div className="flex gap-4">
                        {currentItem.category !== "Doctor" && (
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Qty</label>
                            <input type="number" min="1" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" value={currentItem.quantity} onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})} />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col justify-end">
                            <button onClick={addItemToRequest} className="w-full p-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors"><Plus size={18} /> Add Item</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
                    <AlertCircle size={32} className="text-rose-500 mb-4" />
                    <h4 className="font-black italic text-lg mb-2">Network Sync</h4>
                    <p className="text-slate-400 text-xs leading-relaxed font-medium">Bundling ensures providers see the full clinical context.</p>
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <div className="bg-white min-h-[520px] rounded-[4rem] border border-slate-100 shadow-sm p-10 flex flex-col">
                    <h2 className="text-3xl font-black text-slate-900 mb-8 italic">Request <span className="text-rose-600">Bundle</span></h2>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[380px] custom-scrollbar">
                      {requestList.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 group">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.category === 'Blood' ? 'bg-rose-100 text-rose-600' : item.category === 'Doctor' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                              {item.category === 'Blood' ? <Droplet size={20}/> : item.category === 'Doctor' ? <UserPlus size={20}/> : <Box size={20}/>}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.category}</p>
                              <h4 className="font-black text-slate-900">{item.type}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            {item.category !== "Doctor" ? <span className="text-xl font-black text-slate-900">x{item.quantity}</span> : <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">Urgent</span>}
                            <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={20}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {requestList.length > 0 && (
                      <button onClick={handleNextStep} disabled={loading} className="mt-8 w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" /> : <>Next: Select Hospitals <ArrowRight size={18}/></>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DISCOVERY (REAL DATA) */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-4">
                   <div>
                    <h2 className="text-3xl font-black text-slate-900 italic">Hospital <span className="text-rose-600">Discovery</span></h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Scan complete • {discoveredHospitals.length} verified matches found</p>
                  </div>
                  <button onClick={() => submitRequest(null)} disabled={loading} className="bg-rose-600 text-white px-10 py-5 rounded-3xl font-black uppercase text-xs shadow-xl shadow-rose-100 flex items-center gap-2 hover:bg-rose-700 transition-all">
                    {loading ? <Loader2 className="animate-spin"/> : <Share2 size={20}/>} Broadcast to All
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {discoveredHospitals.map((hosp) => (
                    <motion.div whileHover={{ y: -5 }} key={hosp._id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 group hover:border-rose-300 transition-all">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2.2rem] flex items-center justify-center text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500"><Building2 size={32} /></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-xl font-black text-slate-900">{hosp.name}</h4>
                        </div>
                        <p className="text-slate-400 text-xs font-bold flex items-center gap-1 uppercase tracking-widest mb-4"><MapPin size={12}/> {hosp.address}</p>
                        <div className="flex gap-2">
                          <button onClick={() => submitRequest(hosp._id)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors">Direct Request</button>
                          <a href={`tel:${hosp.phone}`} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"><Phone size={16}/></a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button onClick={() => setStep(1)} className="text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-rose-600 transition-colors"><ArrowRight size={14} className="rotate-180"/> Modify Request Bundle</button>
              </div>
            )}
          </motion.div>
        ) : (
          /* PANEL: STATUS BOARD (REAL DATA) */
          <motion.div key="updates" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><Zap size={24}/></div>
                <div><p className="text-2xl font-black text-slate-900">{myRequests.filter(r => r.status === 'Pending').length}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Requests</p></div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 size={24}/></div>
                <div><p className="text-2xl font-black text-slate-900">{myRequests.filter(r => r.status === 'Accepted').length}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fulfilled</p></div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-slate-900 text-white rounded-2xl"><Clock size={24}/></div>
                <div><p className="text-2xl font-black">LIVE</p><p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Network Sync</p></div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2 italic">Operations <span className="text-rose-600">Feed</span></h3>
              {myRequests.map((req) => (
                <div key={req._id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center shrink-0 border-2 ${req.urgency === 'Critical' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-slate-100 bg-slate-50 text-slate-400'}`}><Package size={28} /></div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-slate-900 text-lg uppercase tracking-tighter">ID: {req._id.slice(-4)}</h4>
                          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${req.urgency === 'Critical' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>{req.urgency}</span>
                        </div>
                        <p className="text-slate-400 text-xs font-bold flex items-center gap-1 uppercase tracking-widest"><Clock size={12}/> {new Date(req.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-wrap gap-2 lg:border-l lg:pl-8 border-slate-100">
                      {req.items.map((item, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-[10px] font-black text-slate-700 uppercase">{item.type} <span className="text-rose-600 ml-1">x{item.quantity}</span></span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 min-w-[250px] justify-between lg:justify-end">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Provider</p>
                        <div className="flex items-center gap-2 justify-end">
                          <p className="font-black text-slate-800 text-sm truncate max-w-[150px]">{req.receiverHospitalId?.name || (req.isBroadcast ? "Broadcasting..." : "Pending Direct")}</p>
                          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${req.status === 'Accepted' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-amber-500 bg-amber-50 border-amber-100'}`}>{req.status}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {myRequests.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Package size={40} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No activity recorded yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}