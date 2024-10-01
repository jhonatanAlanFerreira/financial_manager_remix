import { Outlet } from "@remix-run/react";
import { useState } from "react";
import { NavigationLoader } from "~/components/navigation-loader/navigation-loader";
import { Sidebar } from "~/components/siderbar/sidebar";
import { TitleProvider } from "~/components/top-bar/title-context";
import { TopBar } from "~/components/top-bar/top-bar";

export function App() {
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
