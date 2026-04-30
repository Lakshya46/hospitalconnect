import { Outlet } from "react-router-dom";
import Sidebar from "../components/hospital/Sidebar";
import { useState } from "react";

export default function HospitalAdmin() {

  // 🔥 match sidebar collapse (optional but recommended)
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen">

      {/* SIDEBAR */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* MAIN CONTENT */}
      <div
        className={`p-4 transition-all duration-300
          ${collapsed ? "ml-15" : "ml-64"}
        `}
      >
        <Outlet />
      </div>

    </div>
  );
}