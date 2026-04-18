import React, { useState, useEffect } from 'react';
import api from "../../utils/api";
import { useNavigate } from 'react-router-dom'; // 1. Added import
import { 
  Droplets, Calendar, Phone, Mail, MapPin, 
  Edit2, ChevronRight, ShieldAlert, Loader2 
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Using your custom axios instance that automatically attaches the token
        const response = await api.get('api/auth/me'); 
        setPatient(response.data);
      } catch (err) {
        setError(err.response?.data?.msg || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50/30">
      <Loader2 className="animate-spin text-red-600" size={48} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-rose-50/30">
      <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-red-100">
        <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
        <p className="text-gray-800 font-bold">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-rose-50/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Patient Profile</h1>
            <p className="text-gray-500 mt-1">Manage personal details and medical records</p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl shadow-sm font-semibold w-full md:w-auto"
          onClick={() => navigate('/patient/profile/edit')}>
            <Edit2 size={18} /> Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Identity Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden sticky top-8">
              <div className="h-24 bg-gradient-to-r from-red-600 to-rose-500" />
              <div className="px-6 pb-8 flex flex-col items-center">
                <div className="relative -mt-12 mb-4">
                  <img 
                    src={patient.profilePic || 'https://via.placeholder.com/150'} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
                <p className="text-red-600 font-medium text-sm mb-6 uppercase tracking-wider">
                  {patient.role}
                </p>
                
                <div className="space-y-3 w-full">
                  <div className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
                    <span className="text-xs uppercase font-bold text-red-400">Gender</span>
                    <span className="font-bold text-red-900">{patient.gender || 'Not Set'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-rose-600 p-4 rounded-2xl shadow-md">
                    <span className="text-xs uppercase font-bold text-red-100">Blood Group</span>
                    <span className="font-bold text-white text-lg">{patient.bloodGroup || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500"><Mail size={20} /></div>
                  <div><p className="text-xs text-gray-400 font-semibold uppercase">Email</p><p className="font-medium">{patient.email}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500"><Phone size={20} /></div>
                  <div><p className="text-xs text-gray-400 font-semibold uppercase">Phone</p><p className="font-medium">{patient.phone}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500"><Calendar size={20} /></div>
                  <div><p className="text-xs text-gray-400 font-semibold uppercase">Age</p><p className="font-medium">{patient.age ? `${patient.age} Years` : 'Not Set'}</p></div>
                </div>
                
                <div className="flex items-start gap-4 md:col-span-2 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <MapPin className="text-red-500 mt-1" size={20} />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Address</p>
                    <p className="text-gray-900 font-medium leading-relaxed">{patient.address || 'No address added'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <ShieldAlert className="text-red-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Medical History</h3>
              </div>
              <div className="space-y-3">
                {patient.history && patient.history.length > 0 ? (
                  patient.history.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-red-100 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <p className="text-gray-700 font-medium">{record}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-red-500" />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4 italic">No medical history available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}