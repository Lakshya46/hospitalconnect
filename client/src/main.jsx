import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* BASE APP & LAYOUTS */
import App from "./App.jsx";
import Layout from "./components/Layout.jsx";
import NotFound from "./pages/NotFound";
import Hospitals from "./pages/Hospitals.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Notifications from "./components/hospital/Notification.jsx";
import NotificationManager from "./components/NotificationManager.jsx";
/* ✅ ROUTE GUARDS */
import PublicRoute from "./routes/PublicRoute";
import PrivateRoute from "./routes/PrivateRoute";

/* HOSPITAL ADMIN COMPONENTS */
import HospitalAdmin from "./pages/HospitalAdmin.jsx";
import HospitalDashboard from "./components/hospital/Dashboard.jsx";
import HospitalAppointments from "./components/hospital/Appointments.jsx";
import Resources from "./components/hospital/Resources.jsx";
import Blood from "./components/hospital/Blood.jsx";
import Patients from "./components/hospital/Patients.jsx";
import Doctor from "./components/hospital/Doctor.jsx";
import ResourceRequest from "./components/hospital/ResourceRequest"; 
import ProfileView from "./components/hospital/ProfileView.jsx";
import ProfileEdit from "./components/hospital/ProfileEdit.jsx";
import HospitalDetail from "./components/HospitalDetail.jsx";

/* PATIENT PANEL COMPONENTS */
import PatientPanel from "./pages/PatientPanel";
import PatientDashboard from "./components/patient/Dashboard.jsx";
import PatientAppointments from "./components/patient/Appointments.jsx";
import Records from "./components/patient/Records.jsx";
import Profile from "./components/patient/Profile.jsx";
import BookAppointment from "./components/patient/BookAppointment.jsx";
import PatientProfileEdit from "./components/patient/ProfileEdit.jsx";
import RescheduleAppointment from "./components/patient/RescheduleAppointment.jsx"; // Renamed alias
/* CSS */
import "leaflet/dist/leaflet.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
  <NotificationManager />
    <Routes>
      
      {/* 🔓 PUBLIC ROUTES */}
      <Route element={<Layout />}>
        <Route path="/" element={<PublicRoute><App /></PublicRoute>} />
        <Route path="/hospitals" element={<PublicRoute><Hospitals /></PublicRoute>} />
        <Route path="/hospital/:id" element={<PublicRoute><HospitalDetail /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      </Route>

      {/* 🔒 HOSPITAL ADMIN PANEL */}
      <Route
        path="/hospital-admin"
        element={
          <PrivateRoute allowedRole="hospital">
            <HospitalAdmin />
          </PrivateRoute>
        }
      >
        <Route index element={<HospitalDashboard />} />
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="appointments" element={<HospitalAppointments />} />
        <Route path="resources" element={<Resources />} />
        <Route path="resource-request" element={<ResourceRequest />} />
        <Route path="blood" element={<Blood />} />
        <Route path="patients" element={<Patients />} />
        <Route path="doctor" element={<Doctor />} />
        <Route path="profile" element={<ProfileView />} />
        <Route path="profile/edit" element={<ProfileEdit />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="hospital/:id" element={<HospitalDetail />} />
        {/* Placeholder wrapped in a component to avoid route errors */}
        <Route path="notifications" element={<Notifications />} />
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
        <Route index element={<PatientDashboard />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointments />} />
        <Route path="records" element={<Records />} />
        <Route path="profile" element={<Profile />} />
         <Route path="profile/edit" element={<PatientProfileEdit />} />
         <Route path="appointments/reschedule/:id" element={<RescheduleAppointment />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="hospital/:id" element={<HospitalDetail />} />
        <Route path="hospital/:id/appointment" element={<BookAppointment />} />
      </Route>

      {/* 404 CATCH ALL */}
      <Route path="*" element={<NotFound />} />
      
    </Routes>
  </BrowserRouter>
);