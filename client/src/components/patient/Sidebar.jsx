import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";

/* ICONS */
import {
  MdDashboard,
  MdEvent,
  MdSchedule,
  MdDescription,
  MdPerson,
  MdLocalHospital,
  MdLogout
} from "react-icons/md";

export default function Sidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // 🔥 FETCH USER INFO
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/api/auth/me"); // optional route
        setUser(res.data);
      } catch (err) {
        // fallback (from localStorage)
        const localUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(localUser);
      }
    };

    fetchUser();
  }, []);

  const menu = [
    { name: "Dashboard", path: "/patient/dashboard", icon: <MdDashboard /> },
    { name: "Appointments", path: "/patient/appointments", icon: <MdEvent /> },
    { name: "Schedule", path: "/patient/schedule", icon: <MdSchedule /> },
    { name: "Records", path: "/patient/records", icon: <MdDescription /> },

    // 🔥 ADD HOSPITALS
    { name: "Hospitals", path: "/patient/hospitals", icon: <MdLocalHospital /> },

    { name: "Profile", path: "/patient/profile", icon: <MdPerson /> },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // 🔥 LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-white shadow-lg p-5 flex flex-col justify-between">

      {/* TOP */}
      <div>

        <h2 className="text-2xl font-bold text-red-700 mb-4">
          👤 Patient Panel
        </h2>

        {/* 🔥 USER INFO */}
        {user && (
          <div className="mb-6 p-3 bg-red-50 rounded-lg">
            <p className="font-semibold text-red-700">
              {user.name}
            </p>
            <p className="text-xs text-gray-600">
              {user.email}
            </p>
          </div>
        )}

        {/* MENU */}
        <ul className="space-y-3">
          {menu.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition
                  ${
                    isActive(item.path)
                      ? "bg-red-600 text-white"
                      : "hover:bg-red-100 text-gray-700"
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

      </div>

      {/* 🔥 LOGOUT */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 p-3 rounded-lg text-red-600 hover:bg-red-100 transition"
      >
        <MdLogout size={22} />
        Logout
      </button>

    </div>
  );
}