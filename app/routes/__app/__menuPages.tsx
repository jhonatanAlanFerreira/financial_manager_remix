import { Outlet } from "@remix-run/react";
import { useState } from "react";
import NavigationLoader from "~/components/navigationLoader/NavigationLoader";
import Sidebar from "~/components/siderbar/Sidebar";
import { TitleProvider } from "~/components/topBar/TitleContext";
import TopBar from "~/components/topBar/TopBar";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const updateSidebarOpen = (value: boolean) => {
    setSidebarOpen(value);
  };

  return (
    <NavigationLoader>
      <TitleProvider>
        <div className="flex flex-col h-screen">
          <TopBar updateSidebarOpen={updateSidebarOpen}></TopBar>
          <Sidebar
            sidebarOpen={sidebarOpen}
            updateSidebarOpen={updateSidebarOpen}
          ></Sidebar>
          <div className="bg-violet-200 h-full overflow-auto p-3">
            <Outlet></Outlet>
          </div>
        </div>
      </TitleProvider>
    </NavigationLoader>
  );
}
