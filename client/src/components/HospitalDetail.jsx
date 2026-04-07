import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";

export default function HospitalDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const role = user?.role;

  // 🔥 Detect base path (important)
  const isPatient = location.pathname.startsWith("/patient");
  const isHospital = location.pathname.startsWith("/hospital-admin");

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get(`/api/hospital/by-id/${id}`);
        setHospital(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!hospital) return <div className="p-6">Hospital not found</div>;

  return (
    <div className="min-h-screen bg-red-50 p-6">

      {/* 🔥 BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-red-600 font-semibold"
      >
        ← Back
      </button>

      {/* 🔴 HEADER */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-3xl font-bold text-red-700">
          {hospital.name}
        </h1>
        <p className="text-gray-600">{hospital.location}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* 🏥 DETAILS */}
        <div className="bg-white p-6 rounded-xl shadow space-y-3">

          <h2 className="text-xl font-semibold text-red-700">
            Hospital Information
          </h2>

          <p><b>Type:</b> {hospital.type || "-"}</p>
          <p><b>Contact:</b> {hospital.contact || "-"}</p>
          <p><b>Email:</b> {hospital.email || "-"}</p>

          <p>
            <b>Beds:</b> {hospital.beds?.available || 0} / {hospital.beds?.total || 0}
          </p>

          <p>
            <b>ICU:</b> {hospital.icu?.available || 0} / {hospital.icu?.total || 0}
          </p>

          <p>
            <b>Doctors:</b> {hospital.doctorsCount || 0}
          </p>

        </div>

        {/* ⚡ ACTION PANEL */}
        <div className="bg-white p-6 rounded-xl shadow">

          <h2 className="text-xl font-semibold text-red-700 mb-4">
            Actions
          </h2>

          {/* 👤 NOT LOGGED */}
          {!role && (
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gray-500 text-white py-3 rounded"
            >
              Login to Continue
            </button>
          )}

          {/* 🧑‍⚕️ PATIENT */}
          {role === "patient" && (
            <button
              onClick={() => {
                if (isPatient) {
                  navigate(`/patient/appointment/${hospital._id}`);
                } else {
                  navigate(`/appointment/${hospital._id}`);
                }
              }}
              className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700"
            >
              Book Appointment
            </button>
          )}

          {/* 🏥 HOSPITAL */}
          {role === "hospital" && (
            <button
              onClick={() => {
                if (isHospital) {
                  navigate(`/hospital-admin/resources?hospitalId=${hospital._id}`);
                } else {
                  navigate(`/hospital-admin/resources?hospitalId=${hospital._id}`);
                }
              }}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
            >
              Request Resources
            </button>
          )}

        </div>

      </div>

    </div>
  );
}