import { ReactNode, useState } from "react";
import Sidebar from "~/components/siderbar/Sidebar";
import { TopBar } from "./components/topBar/TopBat";

export function Layout({ children }: { children: ReactNode }) {
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
      <div>{children}</div>
    </div>
  );
}
