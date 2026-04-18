import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, MessageSquare, AlertCircle, CheckCircle2, Clock, 
  Trash2, ShieldAlert, XCircle, Check, Loader2, History,
  ArrowUpRight
} from "lucide-react";
import api from "../../utils/api";

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("live"); // 'live' or 'history'
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // FETCH REAL DATA FROM BACKEND
  const fetchData = async () => {
    setLoading(true);
    try {
      // The 'tab' query matches our backend logic (Pending vs Accepted/Rejected)
      const res = await api.get(`/api/notifications?tab=${activeTab}`);
      
      if (activeTab === "live") {
        setNotifications(res.data);
      } else {
        setHistory(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // HANDLE ACCEPT / REJECT ACTIONS
  const handleAction = async (notificationId, requestId, actionType) => {
    setActionLoading(notificationId);
    try {
      // Sends "Accepted" or "Rejected" to the backend
      await api.patch(`/api/notifications/action/${notificationId}`, { 
        action: actionType 
      });
      
      // Local UI optimization: remove the item from live list immediately
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Re-fetch to populate the History tab correctly
      if (activeTab === "live") {
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.msg || "Transaction failed. Check stock levels.");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteNotification = async (id) => {
    try {
      // Optional: Add a DELETE route in backend to remove notification docs
      // await api.delete(`/api/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setHistory(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error("Delete failed");
    }
  };

  // Filter Logic for the "Live" tab
  const filteredLive = notifications.filter(n => {
    if (filter === "Unread") return !n.read;
    if (filter === "Urgent") return n.type === "urgent";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* 1. TAB SWITCHER */}
      <div className="flex gap-4 mb-10 bg-slate-100 p-1.5 rounded-3xl w-fit mx-auto border border-slate-200">
        <button 
          onClick={() => setActiveTab("live")}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === "live" ? "bg-white text-rose-600 shadow-xl" : "text-slate-500"}`}
        >
          <Bell size={16} /> Live Alerts
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === "history" ? "bg-white text-rose-600 shadow-xl" : "text-slate-500"}`}
        >
          <History size={16} /> Action History
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-rose-600 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Syncing with server...</p>
          </motion.div>
        ) : activeTab === "live" ? (
          <motion.div key="live" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
             <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-black text-slate-900 italic">Incoming <span className="text-rose-600">Requests</span></h2>
                <div className="flex bg-white p-1 rounded-xl border border-slate-100">
                    {["All", "Unread", "Urgent"].map(t => (
                        <button key={t} onClick={() => setFilter(t)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${filter === t ? "bg-slate-900 text-white shadow-md" : "text-slate-400"}`}>{t}</button>
                    ))}
                </div>
             </div>

             {filteredLive.length > 0 ? filteredLive.map(note => (
               <div key={note._id} className={`bg-white p-8 rounded-[3rem] border transition-all ${!note.read ? "border-rose-100 shadow-xl shadow-rose-100/10" : "border-slate-100"}`}>
                  <div className="flex gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getTypeStyles(note.type)}`}>
                      {getTypeIcon(note.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-lg text-slate-900">{note.title}</h3>
                      <p className="text-slate-500 text-sm mt-1 leading-relaxed">{note.message}</p>
                      
                      {note.isActionable && note.status === "Pending" && (
                        <div className="flex gap-3 mt-6">
                          <button 
                            disabled={actionLoading === note._id}
                            onClick={() => handleAction(note._id, note.requestId, "Accepted")} 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                          >
                            {actionLoading === note._id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14}/>} 
                            Approve & Send
                          </button>
                          <button 
                            disabled={actionLoading === note._id}
                            onClick={() => handleAction(note._id, note.requestId, "Rejected")} 
                            className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase border border-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all"
                          >
                            <XCircle size={14}/> Reject
                          </button>
                        </div>
                      )}
                      <div className="mt-4 text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                        <Clock size={12}/> {new Date(note.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
               </div>
             )) : (
                <EmptyState icon={<Bell size={40} />} title="All Clear" subtitle="No new resource requests at the moment." />
             )}
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
             <h2 className="text-2xl font-black text-slate-900 italic mb-6">Action <span className="text-rose-600">Archive</span></h2>
             
             {history.length > 0 ? history.map(item => (
               <div key={item._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 flex items-center justify-between group hover:border-rose-100 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {item.status === 'Accepted' ? <CheckCircle2 size={24}/> : <XCircle size={24}/>}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                           <h4 className="font-black text-slate-900 text-lg">{item.title}</h4>
                           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${item.status === 'Accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{item.status}</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">{item.message}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(item.updatedAt).toLocaleDateString()}</span>
                     <button onClick={() => deleteNotification(item._id)} className="p-3 bg-slate-50 rounded-xl text-slate-300 group-hover:bg-rose-600 group-hover:text-white transition-all">
                        <Trash2 size={18}/>
                     </button>
                  </div>
               </div>
             )) : (
                <EmptyState icon={<History size={40} />} title="Archive Empty" subtitle="Processed requests will appear here." />
             )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-Component for Empty States
function EmptyState({ icon, title, subtitle }) {
    return (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                {icon}
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{title}</p>
            <p className="text-slate-300 text-sm italic mt-1">{subtitle}</p>
        </div>
    );
}

// Helpers for Icons and Colors
function getTypeStyles(type) {
    switch (type) {
      case "urgent": return "bg-rose-50 text-rose-600";
      case "appointment": return "bg-blue-50 text-blue-600";
      case "system": return "bg-amber-50 text-amber-600";
      default: return "bg-slate-100 text-slate-500";
    }
}
  
function getTypeIcon(type) {
    switch (type) {
      case "urgent": return <ShieldAlert size={28} />;
      case "appointment": return <MessageSquare size={28} />;
      case "system": return <AlertCircle size={28} />;
      default: return <Bell size={28} />;
    }
}