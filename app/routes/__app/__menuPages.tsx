import { Outlet } from "@remix-run/react";
import { useState } from "react";
import Sidebar from "~/components/siderbar/Sidebar";
import TopBar from "~/components/topBar/TopBar";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateSidebarOpen = (value: boolean) => {
    setSidebarOpen(value);
  };

  return (
    <div className="flex flex-col">
      <TopBar updateSidebarOpen={updateSidebarOpen}></TopBar>
      <Sidebar
        sidebarOpen={sidebarOpen}
        updateSidebarOpen={updateSidebarOpen}
      ></Sidebar>
      <div>
        <Outlet></Outlet>
      </div>
    </div>
  );
}
