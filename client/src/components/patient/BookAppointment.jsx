import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Calendar as CalIcon, Clock, User, Stethoscope, 
  ChevronRight, ArrowLeft, CheckCircle2, AlertCircle,
  Hospital
} from "lucide-react";
import api from "../../utils/api";

export default function BookAppointment() {
  // MATCHED TO ROUTER: Changed hospitalId to id to match path="hospital/:id/appointment"
  const { id } = useParams(); 
  const navigate = useNavigate();

  // Data State
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  
  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for 'id' because that is what your router uses
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [hRes, dRes] = await Promise.all([
          api.get(`/api/hospital/by-id/${id}`),
          api.get(`/api/hospital/doctors/${id}`)
        ]);
        setHospital(hRes.data);
        setDoctors(dRes.data);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Could not load hospital data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return setError("Please select a doctor.");
    
    setSubmitting(true);
    setError("");

    try {
      const appointmentPayload = {
        hospitalId: id, // Using 'id' from params
        doctorId: selectedDoctor._id,
        date,
        time,
        reason
      };

      await api.post("/api/appointment/book", appointmentPayload);
      navigate("/patient/appointments", { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.msg || "Booking failed. The slot might be full.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-600"></div>
      <p className="text-slate-500 font-medium italic">Preparing clinical schedule...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="p-3 bg-white hover:bg-rose-50 rounded-2xl border border-slate-100 transition-all text-slate-600 hover:text-rose-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Book Appointment</h1>
            <div className="text-slate-500 text-sm font-medium flex items-center gap-1">
              <Hospital size={14} className="text-rose-500" /> {hospital?.name}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 font-bold text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT: DOCTOR & DETAILS */}
        <div className="lg:col-span-8 space-y-6">
          
          <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs">01</span>
              Select a Specialist
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <button
                  key={doc._id}
                  type="button"
                  onClick={() => setSelectedDoctor(doc)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex gap-4 ${
                    selectedDoctor?._id === doc._id 
                    ? "border-rose-600 bg-rose-50/30 ring-4 ring-rose-50" 
                    : "border-slate-50 bg-slate-50/40 hover:border-slate-200"
                  }`}
                >
                  <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 overflow-hidden flex-shrink-0 shadow-sm">
                    <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-sm truncate">{doc.name}</p>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{doc.specialization}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold italic">{doc.education}</p>
                  </div>
                  {selectedDoctor?._id === doc._id && (
                    <div className="absolute top-2 right-2 text-rose-600">
                      <CheckCircle2 size={18} fill="currentColor" className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs">02</span>
              Preferred Timing
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Appointment Date</label>
                <div className="relative">
                  <CalIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Preferred Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all appearance-none font-bold text-slate-700"
                  >
                    <option value="">Select Time</option>
                    <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="11:30 AM">11:30 AM - 12:30 PM</option>
                    <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="04:30 PM">04:30 PM - 05:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Reason for Appointment</label>
                <textarea 
                  placeholder="Describe symptoms..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all font-medium min-h-[100px]"
                />
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: CONFIRMATION BOX */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[3rem] p-8 border-[1.5px] border-slate-100 shadow-2xl sticky top-10 overflow-hidden group transition-all">
            <div className="relative z-10">
              <h4 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-5 tracking-tight flex items-center gap-3">
                <div className="w-2 h-6 bg-rose-600 rounded-full"></div>
                Booking Summary
              </h4>

              <div className="space-y-8 mb-10">
                <SummaryItem 
                  icon={<User size={18}/>} 
                  label="Specialist" 
                  value={selectedDoctor?.name || "Choose Doctor"} 
                  subValue={selectedDoctor?.specialization}
                  active={!!selectedDoctor}
                />
                <SummaryItem 
                  icon={<CalIcon size={18}/>} 
                  label="Schedule" 
                  value={date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "Pick Date"} 
                  subValue={time}
                  active={!!date}
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedDoctor || !date || !time}
                className="w-full py-5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Confirm Appointment <ChevronRight size={18} /></>
                )}
              </button>

              {/* FIX: div instead of p */}
              <div className="text-[10px] text-slate-400 mt-6 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function SummaryItem({ icon, label, value, subValue, active }) {
  return (
    <div className="flex gap-5 relative">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
        active 
        ? 'bg-white border-rose-500 text-rose-600 shadow-lg shadow-rose-100' 
        : 'bg-slate-50 border-slate-100 text-slate-300'
      }`}>
        {icon}
      </div>
      <div className="min-w-0 pt-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className={`text-sm font-bold truncate ${active ? 'text-slate-900' : 'text-slate-300 italic'}`}>
          {value}
        </p>
        {subValue && active && (
          <div className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
             <span className="w-1 h-1 bg-rose-400 rounded-full inline-block"></span> {subValue}
          </div>
        )}
      </div>
    </div>
  );
}