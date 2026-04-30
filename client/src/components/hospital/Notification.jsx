import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, MessageSquare, AlertCircle, CheckCircle2, Clock, 
  XCircle, Check, Loader2, History,
  Package, Flame, Info, ExternalLink, Timer
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useSocket } from "../../context/SocketContext";

export default function Notifications() {
  const [activeTab, setActiveTab] = useState("live");
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { socket } = useSocket();

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

  useEffect(() => {
    if (!socket || activeTab !== "live") return;
    socket.on("new_notification", (newNote) => setNotifications((prev) => [newNote, ...prev]));
    socket.on("notification_cancelled", ({ requestId }) => {
      setNotifications((prev) => prev.filter(note => {
        const id = note.requestId?._id?.toString() || note.requestId?.toString();
        return id !== requestId.toString();
      }));
    });
    return () => {
      socket.off("new_notification");
      socket.off("notification_cancelled");
    }
  }, [socket, activeTab]);

  const handleAction = async (notificationId, actionType) => {
    setActionLoading(notificationId);
    try {
      await api.patch(`/api/notifications/action/${notificationId}`, { action: actionType });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (err) {
      alert(err.response?.data?.msg || "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-5 px-3 sm:px-4 pt-3 sm:pt-6 font-sans antialiased">
      
      {/* RESPONSIVE TAB SWITCHER */}
      <div className="flex w-full sm:w-fit gap-1 mb-6 sm:mb-8 bg-slate-100 p-1 rounded-xl mx-auto border border-slate-200 shadow-inner">
        <button 
          onClick={() => setActiveTab("live")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "live" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}
        >
          <Bell size={14} /> Live
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "history" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}
        >
          <History size={14} /> History
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {loading ? (
          <LoadingState key="loading" />
        ) : activeTab === "live" ? (
          <motion.div key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <header className="px-1 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                Live <span className="text-rose-600">Demands</span>
              </h2>
              <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[8px] font-black uppercase">{notifications.length} Active</span>
            </header>

            {notifications.length > 0 ? (
              notifications.map((note) => (
                <motion.div layout key={note._id}>
                  <NotificationCard note={note} onAction={handleAction} loading={actionLoading === note._id} />
                </motion.div>
              ))
            ) : (
              <EmptyState icon={<Bell size={32} />} title="All Clear" subtitle="No active requests." />
            )}
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <header className="px-1 mb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                Action <span className="text-rose-600">Logs</span>
              </h2>
            </header>
            {history.length > 0 ? history.map(item => (
              <ArchiveCard key={item._id} item={item} />
            )) : (
              <EmptyState icon={<History size={32} />} title="Archive Empty" subtitle="Logs will appear here." />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationCard({ note, onAction, loading }) {
  const priorityStyle = getPriorityStyles(note.priority);
  
  return (
    <div className={`group relative bg-white p-4 sm:p-5 rounded-2xl sm:rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all`}>
      <div className={`absolute top-0 right-4 sm:right-6 px-2.5 py-1 text-[7px] sm:text-[8px] font-black uppercase tracking-widest rounded-b-lg text-white ${priorityStyle.badge}`}>
        {note.priority || 'Standard'}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
          {getTypeIcon(note.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <Link to={`/hospital-admin/hospital/${note.senderHospital?._id}`} target="_blank" className="inline-flex items-center gap-1.5 font-black text-sm sm:text-base text-slate-800 hover:text-rose-600 transition-colors uppercase tracking-tight mb-1 truncate max-w-full">
            {note.senderHospital?.name || "Request"} <ExternalLink size={12} className="text-rose-300" />
          </Link>
          
          <div className="flex items-center gap-3 mb-3">
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
              <Info size={10} className="text-rose-500"/> ID: {note.requestId?.slice(-6).toUpperCase()}
            </p>
            <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
              <Clock size={10} className="text-slate-300"/> {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <ResourceManifest items={note.items} />
          
          <div className="flex gap-2 mt-4 sm:mt-5">
            <button 
              onClick={() => onAction(note._id, "Accepted")} 
              disabled={loading}
              className="flex-1 sm:flex-none justify-center bg-rose-600 text-white px-5 py-3 sm:py-2.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} strokeWidth={3}/>} Accept
            </button>
            <button 
              onClick={() => onAction(note._id, "Rejected")} 
              disabled={loading}
              className="flex-1 sm:flex-none justify-center bg-white text-slate-400 px-5 py-3 sm:py-2.5 rounded-lg text-[9px] font-black uppercase border border-slate-200 active:bg-slate-50"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArchiveCard({ item }) {
  const isAccepted = item.status === 'Accepted';
  const isPending = item.status === 'Pending';
  const statusStyle = isAccepted ? 'border-emerald-500 text-emerald-600' : isPending ? 'border-orange-500 text-orange-600' : 'border-rose-500 text-rose-600';

  return (
    <div className={`bg-white p-4 rounded-xl border-l-4 shadow-sm ${statusStyle.split(' ')[0]}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-50 ${statusStyle.split(' ')[1]}`}>
          {isAccepted ? <CheckCircle2 size={18}/> : isPending ? <Timer size={18} className="animate-pulse" /> : <XCircle size={18}/>}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
            <span className="font-black text-slate-900 text-[13px] sm:text-sm uppercase tracking-tight truncate">{item.senderHospital?.name}</span>
            <span className={`w-fit text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${statusStyle}`}>{item.status}</span>
          </div>
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mt-0.5">
            {new Date(item.updatedAt).toLocaleDateString()} • {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="mt-3">
            <ResourceManifest items={item.items} isArchive status={item.status} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResourceManifest({ items, isArchive, status }) {
  return (
    <div className={`${isArchive ? 'p-0' : 'bg-slate-50/50 rounded-lg p-2.5 sm:p-3 border border-slate-100'}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items?.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between bg-white border border-slate-100 p-2 rounded-lg shadow-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <Package size={12} className="text-slate-300" />
              <span className="text-[10px] font-bold text-slate-600 truncate uppercase">{item.type}</span>
            </div>
            <span className={`text-[10px] font-black ml-2 ${status === 'Accepted' ? 'text-emerald-600' : status === 'Pending' ? 'text-orange-600' : 'text-rose-600'}`}>x{item.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-rose-600" size={32} />
      <p className="text-[9px] font-black uppercase text-rose-400 tracking-[0.2em] mt-4">Syncing...</p>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="text-center py-10 sm:py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 px-4">
      <div className="text-slate-200 mb-2 flex justify-center">{icon}</div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{title}</p>
      <p className="text-slate-300 text-[10px] mt-1">{subtitle}</p>
    </div>
  );
}

function getPriorityStyles(priority) {
  switch (priority) {
    case "Critical": return { badge: "bg-rose-600 animate-pulse" };
    case "High": return { badge: "bg-orange-500" };
    case "Medium": return { badge: "bg-amber-400" };
    default: return { badge: "bg-slate-400" };
  }
}

function getTypeIcon(type) {
  switch (type) {
    case "urgent": return <Flame size={18} className="text-rose-600" />;
    case "appointment": return <MessageSquare size={18} className="text-sky-500" />;
    default: return <Package size={18} className="text-slate-400" />;
  }
}