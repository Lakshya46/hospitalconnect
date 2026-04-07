import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import Hospitals from "./pages/Hospitals.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";

import Layout from "./components/Layout.jsx";
import NotFound from "./pages/NotFound";
/* HOSPITAL PROFILE */
import ProfileView from "./components/hospital/ProfileView.jsx";
import ProfileEdit from "./components/hospital/ProfileEdit.jsx";
import HospitalDetail from "./components/HospitalDetail.jsx";

/* ADMIN */
import HospitalAdmin from "./pages/HospitalAdmin.jsx";

/* HOSPITAL SECTIONS */
import HospitalDashboard from "./components/hospital/Dashboard.jsx";
import HospitalAppointments from "./components/hospital/Appointments.jsx";
import Resources from "./components/hospital/Resources.jsx";
import Blood from "./components/hospital/Blood.jsx";
import Patients from "./components/hospital/Patients.jsx";
import Doctor from "./components/hospital/Doctor.jsx";
import ResourceRequest from "./components/hospital/ResourceRequest";

/* PATIENT PANEL */
import PatientPanel from "./pages/PatientPanel";

/* PATIENT SECTIONS */
import PatientDashboard from "./components/patient/Dashboard.jsx";
import PatientAppointments from "./components/patient/Appointments.jsx";
import Schedule from "./components/patient/Schedule.jsx";
import Records from "./components/patient/Records.jsx";
import Profile from "./components/patient/Profile.jsx";

/* ✅ IMPORT ROUTE GUARDS */
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import "leaflet/dist/leaflet.css";
import "./index.css";

/* ================= APP ================= */

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>

      {/* 🔓 PUBLIC ROUTES (BLOCKED WHEN LOGGED IN) */}
      <Route element={<Layout />}>

        <Route
          path="/"
          element={
            <PublicRoute>
              <App />
            </PublicRoute>
          }
        />

        <Route
          path="/hospitals"
          element={
            <PublicRoute>
              <Hospitals />
            </PublicRoute>
          }
        />

        <Route
          path="/hospital/:id"
          element={
            <PublicRoute>
              <HospitalDetail />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

      </Route>

      {/* 🔒 HOSPITAL ADMIN */}
      <Route
        path="/hospital-admin"
        element={
          <PrivateRoute allowedRole="hospital">
            <HospitalAdmin />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="appointments" element={<HospitalAppointments />} />
        <Route path="resources" element={<Resources />} />
        <Route path="blood" element={<Blood />} />
        <Route path="patients" element={<Patients />} />
        <Route path="doctor" element={<Doctor />} />
       // <Route path="resource" element={<ResourceRequest />} />
        <Route path="profile" element={<ProfileView />} />
        <Route path="profile/edit" element={<ProfileEdit />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="hospital/:id" element={<HospitalDetail />} />
      </Route>

      {/* 🔒 PATIENT PANEL */}
      <Route
        path="/patient"
        element={
          <PrivateRoute allowedRole="patient">
            <PatientPanel />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="records" element={<Records />} />
        <Route path="profile" element={<Profile />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="hospital/:id" element={<HospitalDetail />} />
      </Route>
<Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);