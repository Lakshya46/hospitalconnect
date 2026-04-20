import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, MessageSquare, AlertCircle, CheckCircle2, Clock, 
  XCircle, Check, Loader2, History,
  Package, Flame, Info, ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useSocket } from "../../context/SocketContext"; // 🔥 Added socket hook

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("live");
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

const { socket } = useSocket(); // ✅ This grabs the actual socket instance
  const fetchData = async () => {
    setLoading(true);
    try {
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

  useEffect(() => { fetchData(); }, [activeTab]);

  // 🔥 REAL-TIME SOCKET LISTENER
  useEffect(() => {
    if (!socket || activeTab !== "live") return;

    socket.on("new_notification", (newNote) => {
      console.log("⚡ New Demand Received via Socket:", newNote);
      // Add new notification to the top of the list instantly
      setNotifications((prev) => [newNote, ...prev]);
    });

    socket.on("notification_cancelled", ({ requestId }) => {
      console.log("🗑️ Request Withdrawn by Sender:", requestId);
      // Remove the notification from the list instantly
      setNotifications((prev) => prev.filter(note => note.requestId !== requestId));
    });

    return () =>{

    socket.off("new_notification");
      socket.off("notification_cancelled");
    }
  }, [socket, activeTab]);

  const handleAction = async (notificationId, actionType) => {
    setActionLoading(notificationId);
    try {
      await api.patch(`/api/notifications/action/${notificationId}`, { action: actionType });
      // Remove from live view immediately for smooth UI
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      alert(err.response?.data?.msg || "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 pt-8 font-sans">
      
      {/* ROSE THEME TAB SWITCHER */}
      <div className="flex gap-4 mb-12 bg-rose-50/50 p-2 rounded-[2rem] w-fit mx-auto border border-rose-100 shadow-sm">
        <button 
          onClick={() => setActiveTab("live")}
          className={`flex items-center gap-3 px-10 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all ${activeTab === "live" ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : "text-rose-400 hover:text-rose-600"}`}
        >
          <Bell size={18} /> Live Alerts
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-3 px-10 py-3.5 rounded-2xl text-[12px] font-black uppercase tracking-wider transition-all ${activeTab === "history" ? "bg-rose-600 text-white shadow-lg shadow-rose-200" : "text-rose-400 hover:text-rose-600"}`}
        >
          <History size={18} /> Action Archive
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <LoadingState key="loading" />
        ) : activeTab === "live" ? (
          <motion.div key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 italic tracking-tight uppercase px-2">
              Incoming <span className="text-rose-600">Demands</span>
            </h2>

            {notifications.length > 0 ? (
              notifications.map((note) => (
                <motion.div
                  layout // 🔥 Smoothly re-arranges list when items are added/removed
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={note._id}
                >
                  <NotificationCard 
                    note={note} 
                    onAction={handleAction} 
                    loading={actionLoading === note._id}
                  />
                </motion.div>
              ))
            ) : (
              <EmptyState icon={<Bell size={48} />} title="Network Silent" subtitle="No active resource requests at the moment." />
            )}
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <h2 className="text-3xl font-black text-slate-900 italic mb-8 px-2 uppercase tracking-tight">
              Action <span className="text-rose-600">Archive</span>
            </h2>
            {history.length > 0 ? history.map(item => (
              <ArchiveCard key={item._id} item={item} />
            )) : (
              <EmptyState icon={<History size={48} />} title="Archive Empty" subtitle="Processed requests will appear here." />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * COMPONENT: Notification Card (Live)
 */
function NotificationCard({ note, onAction, loading }) {
  const priorityStyle = getPriorityStyles(note.priority);
  
  return (
    <div className={`relative bg-white p-7 rounded-[2.5rem] border-l-[12px] shadow-sm transition-all duration-300 hover:shadow-md ${priorityStyle.border} ${priorityStyle.bg}`}>
      {/* PRIORITY BADGE */}
      <div className={`absolute top-0 right-10 px-5 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-b-xl text-white ${priorityStyle.badge}`}>
        Priority: {note.priority || 'Standard'}
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-rose-100 flex items-center justify-center shrink-0 shadow-sm">
          {getTypeIcon(note.type)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <Link 
              to={`/hospital-admin/hospital/${note.senderHospital?._id}`} 
              target="_blank"
              className="group flex items-center gap-2 font-black text-xl text-slate-900 hover:text-rose-600 transition-colors uppercase tracking-tight"
            >
              {note.senderHospital?.name || "Resource Request"}
              <ExternalLink size={14} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-all" />
            </Link>
          </div>
          
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
            <Info size={12} className="text-rose-500"/> REF ID: {note.requestId?.slice(-8).toUpperCase()}
          </p>

          <ResourceManifest items={note.items} />
          
          <div className="flex flex-wrap gap-3 mt-6">
            <button 
              onClick={() => onAction(note._id, "Accepted")} 
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase flex items-center gap-3 shadow-lg shadow-rose-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} strokeWidth={3}/>} Approve & Dispatch
            </button>
            <button 
              onClick={() => onAction(note._id, "Rejected")} 
              disabled={loading}
              className="bg-white text-rose-400 px-7 py-4 rounded-2xl text-[11px] font-black uppercase border border-rose-100 hover:bg-rose-50 transition-all active:scale-95"
            >
              Decline
            </button>
          </div>
          
          <div className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Clock size={12} /> Received: {new Date(note.createdAt).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * COMPONENT: Archive Card (History)
 */
function ArchiveCard({ item }) {
  const isAccepted = item.status === 'Accepted';
  
  return (
    <div className={`bg-white p-7 rounded-[2.5rem] border-l-4 transition-all ${isAccepted ? 'border-emerald-400' : 'border-rose-400'}`}>
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-6 flex-1">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isAccepted ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isAccepted ? <CheckCircle2 size={26}/> : <XCircle size={26}/>}
          </div>
          
          <div className="flex-1">
            <Link to={`/hospital-admin/hospital/${item.senderHospital?._id}`} target="_blank" className="flex items-center gap-2 font-black text-slate-900 text-lg hover:text-rose-600 uppercase tracking-tight">
              {item.senderHospital?.name || "Request"} <ExternalLink size={14} className="text-rose-300"/>
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${isAccepted ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                {item.status}
              </span>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                Finalized {new Date(item.updatedAt).toLocaleDateString('en-GB')} • {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ResourceManifest items={item.items} isArchive status={item.status} />
      </div>
    </div>
  );
}

/**
 * UI SUB-COMPONENTS
 */
function ResourceManifest({ items, isArchive, status }) {
  return (
    <div className={`${isArchive ? 'p-0' : 'bg-rose-50/20 border border-rose-100/50 rounded-2xl p-5'}`}>
      {!isArchive && <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">Required Manifest</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items?.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between bg-white border border-rose-50 p-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <Package size={14} className="text-rose-500" />
              <span className="text-sm font-black text-slate-700">{item.type}</span>
            </div>
            <span className={`text-sm font-black ${status === 'Accepted' ? 'text-emerald-600' : 'text-rose-600'}`}>
              x{item.quantity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24">
      <Loader2 className="animate-spin text-rose-600 mb-6" size={40} />
      <p className="text-[11px] font-black uppercase text-rose-400 tracking-[0.2em]">Synchronizing Triage...</p>
    </motion.div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-rose-100 shadow-inner">
      <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-200">{icon}</div>
      <p className="text-rose-400 font-black uppercase tracking-[0.3em] text-sm">{title}</p>
      <p className="text-slate-300 text-base font-bold italic mt-2">{subtitle}</p>
    </div>
  );
}

/**
 * HELPERS
 */
function getPriorityStyles(priority) {
  switch (priority) {
    case "Critical": return { border: "border-rose-600", bg: "bg-rose-50/40", badge: "bg-rose-600 animate-pulse" };
    case "High": return { border: "border-rose-400", bg: "bg-rose-50/20", badge: "bg-rose-500" };
    case "Medium": return { border: "border-rose-300", bg: "bg-white", badge: "bg-rose-400" };
    default: return { border: "border-slate-200", bg: "bg-white", badge: "bg-slate-400" };
  }
}

function getTypeIcon(type) {
  switch (type) {
    case "urgent": return <Flame size={28} className="text-rose-600 animate-pulse" />;
    case "appointment": return <MessageSquare size={28} className="text-rose-400" />;
    default: return <Package size={28} className="text-rose-300" />;
  }
}