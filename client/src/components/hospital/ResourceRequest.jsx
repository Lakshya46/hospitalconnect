import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Activity, CheckCircle2, Clock, Package, 
  MapPin, AlertCircle, Phone, Plus, Building2, Trash2, UserPlus, 
  Droplet, Box, ArrowRight, Share2, Loader2, Bed, Flame, XCircle, Search
} from "lucide-react";
import api from "../../utils/api";
import { useSocket } from "../../context/SocketContext";

export default function ResourceRequest() {
  const [panel, setPanel] = useState("request"); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [requestList, setRequestList] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [discoveredHospitals, setDiscoveredHospitals] = useState([]);
  
const { socket } = useSocket(); // ✅ This grabs the actual socket instance
  const [currentItem, setCurrentItem] = useState({
    category: "Supplies",
    type: "Oxygen",
    quantity: 1,
    urgency: "Medium"
  });

  const categories = {
    Supplies: ["Oxygen", "ICU Bed", "General Bed"],
    Blood: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    Doctor: [
      "General Physician", "Cardiologist", "Oncologist", "Pediatrician", 
      "Gynecologist", "Orthopedic Surgeon", "Neurologist", "Ophthalmologist", 
      "ENT Specialist", "Dentist", "Psychiatrist", "Emergency Specialist", 
      "Ayurvedic Doctor", "Radiologist", "Physiotherapist"
    ] 
  };

  const urgencyLevels = ["Low", "Medium", "High", "Critical"];

  const fetchStatusBoard = useCallback(async () => {
    try {
      const res = await api.get("/api/requests/my-requests"); 
      setMyRequests(res.data);
    } catch (err) {
      console.error("Error fetching status board:", err);
    }
  }, []);

  useEffect(() => {
    if (panel === "updates") fetchStatusBoard();
  }, [panel, fetchStatusBoard]);

  // 🔥 REAL-TIME SOCKET LISTENER
// 1. Update the Socket Listener to match your UI structure
useEffect(() => {
  if (!socket) return;

  socket.on("request_status_updated", (data) => {
    // data = { requestId, status, receiverHospital: { _id, name } }
    setMyRequests((prev) => 
      prev.map((req) => 
        req._id === data.requestId 
          ? { 
              ...req, 
              status: data.status, 
              // Ensure this key matches exactly what your JSX (req.receiverHospitalId?.name) uses
              receiverHospitalId: data.receiverHospital 
            } 
          : req
      )
    );
  });

  return () => socket.off("request_status_updated");
}, [socket]);

// 2. Prevent the API from overwriting fresh socket data
useEffect(() => {
  // Only fetch if we don't have requests yet or if explicitly switching to the tab
  // This prevents the "Race Condition" where the API overwrites the Socket
  if (panel === "updates" && myRequests.length === 0) {
    fetchStatusBoard();
  }
}, [panel, fetchStatusBoard, myRequests.length]);


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

  const handleNextStep = async () => {
    if (requestList.length === 0) return;
    setLoading(true);
    const primaryItem = requestList[0];

    try {
      const res = await api.get(`/api/hospital/search-resources`, {
        params: {
          type: primaryItem.type,
          qty: primaryItem.quantity,
          category: primaryItem.category 
        }
      });
      setDiscoveredHospitals(res.data);
      setStep(2);
    } catch (err) {
      alert("Discovery scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async (receiverId = null) => {
    setLoading(true);
    try {
      const payload = {
        items: requestList,
        receiverHospitalId: receiverId,
        urgency: currentItem.urgency 
      };
      await api.post("/api/requests/request", payload); 
      alert(receiverId ? "Direct Request Sent!" : "Broadcast Sent!");
      setRequestList([]);
      setPanel("updates");
    } catch (err) {
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to withdraw this request?")) return;
    try {
      setLoading(true);
      await api.patch(`/api/requests/cancel/${requestId}`);
      fetchStatusBoard();
      alert("Request withdrawn.");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to cancel request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 pt-8 text-slate-700 font-sans">
      
      {/* 1. TOP PANEL SWITCHER */}
      <div className="flex gap-4 mb-12 bg-slate-100 p-2 rounded-[2rem] w-fit mx-auto border border-slate-200 shadow-inner">
        <button 
          onClick={() => { 
            setPanel("request"); 
            setStep(1); 
            setRequestList([]); 
          }} 
          className={`flex items-center gap-3 px-10 py-3.5 rounded-2xl text-[13px] font-black uppercase transition-all ${panel === "request" ? "bg-white text-rose-600 shadow-md" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Plus size={18} /> New Request
        </button>
        <button 
          onClick={() => setPanel("updates")} 
          className={`flex items-center gap-3 px-10 py-3.5 rounded-2xl text-[13px] font-black uppercase transition-all ${panel === "updates" ? "bg-white text-rose-600 shadow-md" : "text-slate-500 hover:text-slate-800"}`}
        >
          <Activity size={18} /> Pipeline
        </button>
      </div>

      <AnimatePresence mode="wait">
        {panel === "request" ? (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {step === 1 && (
              <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-8">
                  <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-8 italic">Requirement <span className="text-rose-600">Entry</span></h3>
                    <div className="space-y-6">
                      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        {Object.keys(categories).map(cat => (
                          <button key={cat} onClick={() => setCurrentItem({...currentItem, category: cat, type: categories[cat][0]})} className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${currentItem.category === cat ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400'}`}>{cat}</button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Select {currentItem.category}</label>
                        <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-base appearance-none" value={currentItem.type} onChange={(e) => setCurrentItem({...currentItem, type: e.target.value})}>
                          {categories[currentItem.category].map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Urgency Level</label>
                        <div className="grid grid-cols-4 gap-3">
                          {urgencyLevels.map(level => (
                            <button key={level} onClick={() => setCurrentItem({...currentItem, urgency: level})} className={`py-3.5 rounded-xl text-[10px] font-black uppercase transition-all border ${currentItem.urgency === level ? getUrgencyColor(level) + " border-transparent shadow-sm" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"}`}>
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        {currentItem.category !== "Doctor" && (
                          <div className="flex-1 space-y-2">
                            <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Quantity</label>
                            <input type="number" min="1" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-lg outline-none" value={currentItem.quantity} onChange={(e) => setCurrentItem({...currentItem, quantity: e.target.value})} />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col justify-end">
                            <button onClick={addItemToRequest} className="w-full p-5 bg-rose-600 text-white rounded-xl font-black uppercase text-[12px] flex items-center justify-center gap-3 hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"><Plus size={20} /> Add Item</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Flame size={120}/></div>
                    <AlertCircle size={32} className="text-rose-500 mb-4" />
                    <h4 className="font-black italic text-lg mb-2 tracking-tight">Priority Protocol</h4>
                    <p className="text-slate-400 text-xs leading-relaxed font-medium">Critical requests trigger real-time alerts across the regional hospital network.</p>
                  </div>
                </div>
                <div className="lg:col-span-7">
                  <div className="bg-white min-h-[520px] rounded-[3.5rem] border border-slate-100 shadow-sm p-10 flex flex-col">
                    <h2 className="text-3xl font-black text-slate-900 mb-8 italic tracking-tight">Request <span className="text-rose-600">Bundle</span></h2>
                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[360px] px-2 custom-scrollbar">
                      {requestList.length > 0 ? requestList.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all hover:border-rose-200">
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.category === 'Blood' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-400'}`}>
                              {item.category === 'Blood' ? <Droplet size={22}/> : item.category === 'Doctor' ? <UserPlus size={22}/> : item.type.includes("Bed") ? <Bed size={22}/> : <Box size={22}/>}
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</p>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${getUrgencyColor(item.urgency)}`}>{item.urgency}</span>
                              </div>
                              <h4 className="font-black text-slate-900 text-lg tracking-tight">{item.type}</h4>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-2xl font-black text-slate-900">x{item.quantity}</span>
                            <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-600 transition-colors p-2"><Trash2 size={22}/></button>
                          </div>
                        </div>
                      )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-6 opacity-50">
                            <Package size={64} strokeWidth={1}/>
                            <p className="font-black uppercase text-[11px] tracking-[0.25em]">Bundle is currently empty</p>
                        </div>
                      )}
                    </div>
                    {requestList.length > 0 && (
                      <button onClick={handleNextStep} disabled={loading} className="mt-10 w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[13px] flex items-center justify-center gap-4 tracking-wider hover:bg-black transition-all shadow-xl">
                        {loading ? <Loader2 className="animate-spin" /> : <>Scan Hospitals for Inventory <ArrowRight size={20}/></>}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm gap-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 italic">Discovered <span className="text-rose-600">Providers</span></h2>
                    <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-1">Scan Complete • Matches found for: {requestList[0]?.type}</p>
                  </div>
                  <button onClick={() => submitRequest(null)} disabled={loading} className="bg-rose-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase text-[12px] shadow-xl shadow-rose-100 flex items-center gap-3 hover:bg-rose-700 transition-all">
                    {loading ? <Loader2 className="animate-spin"/> : <Share2 size={20}/>} Network Broadcast
                  </button>
                </div>
                <div className="grid lg:grid-cols-2 gap-6">
                  {discoveredHospitals.length > 0 ? discoveredHospitals.map((hosp) => (
                    <motion.div whileHover={{ y: -5 }} key={hosp._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8 group hover:border-rose-300 transition-all">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-inner"><Building2 size={32} /></div>
                      <div className="flex-1">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{hosp.name}</h4>
                        <p className="text-slate-400 text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest mb-6 mt-1"><MapPin size={14}/> {hosp.address?.slice(0, 45)}...</p>
                        <div className="flex gap-3">
                          <button onClick={() => submitRequest(hosp._id)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors shadow-lg shadow-slate-200">Direct Request</button>
                          <a href={`tel:${hosp.contact}`} className="p-3.5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"><Phone size={18}/></a>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-2 py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
                       <Search size={48} className="mx-auto text-slate-200 mb-4" />
                       <p className="font-black text-slate-300 uppercase text-[12px] tracking-widest">No matching providers found with current stock.</p>
                    </div>
                  )}
                </div>
                <button onClick={() => setStep(1)} className="text-slate-400 font-black text-[12px] uppercase tracking-widest flex items-center gap-3 hover:text-rose-600 transition-colors ml-4 pt-6"><ArrowRight size={20} className="rotate-180"/> Back to Bundle Builder</button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="updates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 border-l-[6px] border-rose-500">
                <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><Zap size={28}/></div>
                <div><p className="text-3xl font-black text-slate-900">{myRequests.filter(r => r.status === 'Pending').length}</p><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Active Requests</p></div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 border-l-[6px] border-emerald-500">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle2 size={28}/></div>
                <div><p className="text-3xl font-black text-slate-900">{myRequests.filter(r => r.status === 'Accepted').length}</p><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Fulfilled</p></div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 border-l-[6px] border-slate-900">
                <div className="p-4 bg-slate-900 text-white rounded-2xl"><Clock size={28}/></div>
                <div><p className="text-2xl font-black uppercase tracking-tighter italic">LIVE</p><p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Network Sync</p></div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 italic px-4 tracking-tight uppercase">Resource <span className="text-rose-600">Pipeline</span></h3>
              {myRequests.length > 0 ? myRequests.map((req) => (
                <div key={req._id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
                  {req.urgency === 'Critical' && <div className="absolute top-0 right-0 bg-rose-600 text-white px-6 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl animate-pulse">Critical Priority</div>}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center shrink-0 border-2 ${getUrgencyColor(req.urgency)} bg-opacity-10`}><Package size={26} /></div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-slate-900 text-lg uppercase tracking-tighter italic">REQ: {req._id.slice(-6).toUpperCase()}</h4>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${getUrgencyColor(req.urgency)}`}>{req.urgency}</span>
                        </div>
                        <p className="text-slate-400 text-[12px] font-bold flex items-center gap-2 uppercase tracking-widest mt-1"><Clock size={14}/> {new Date(req.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-wrap gap-3 lg:border-l lg:pl-10 border-slate-100">
                      {req.items.map((item, idx) => (
                        <span key={idx} className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl text-[11px] font-black text-slate-700 uppercase">{item.type} <span className="text-rose-600 ml-1">x{item.quantity}</span></span>
                      ))}
                    </div>
                    <div className="flex items-center gap-8 min-w-[280px] justify-between lg:justify-end">
                      <div className="text-right flex flex-col items-end gap-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5">Provider Network</p>
                          <div className="flex items-center gap-3 justify-end">
                            <p className="font-black text-slate-800 text-sm truncate max-w-[150px]">{req.receiverHospitalId?.name || (req.isBroadcast ? "Global Broadcast" : "Pending Direct")}</p>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${req.status === 'Accepted' ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : req.status === 'Cancelled' ? 'text-slate-400 bg-slate-50 border-slate-200' : 'text-amber-500 bg-amber-50 border-amber-100'}`}>{req.status}</div>
                          </div>
                        </div>
                        {req.status === 'Pending' && (
                          <button onClick={() => handleCancelRequest(req._id)} className="flex items-center gap-2 text-rose-500 hover:text-rose-700 text-[11px] font-black uppercase tracking-widest transition-colors py-1 px-2 hover:bg-rose-50 rounded-lg">
                            <XCircle size={15} /> Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <Package size={48} className="text-slate-300 mx-auto mb-4 opacity-40" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[12px]">No activity recorded yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}} />
    </div>
  );
}

function getUrgencyColor(level) {
  switch (level) {
    case "Low": return "bg-slate-100 text-slate-500 border-slate-200";
    case "Medium": return "bg-blue-50 text-blue-600 border-blue-100";
    case "High": return "bg-amber-50 text-amber-600 border-amber-100";
    case "Critical": return "bg-rose-600 text-white border-rose-600";
    default: return "bg-slate-50 text-slate-400 border-slate-100";
  }
}