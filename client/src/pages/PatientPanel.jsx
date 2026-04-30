import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";

export default function PatientLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return  (
      <div className="min-h-screen">
  
        {/* SIDEBAR */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
  
        {/* MAIN CONTENT */}
        <div
          className={`p-6 transition-all duration-300
            ${collapsed ? "ml-15" : "ml-64"}
          `}
        >
          <Outlet />
        </div>
  
      </div>
    );
}