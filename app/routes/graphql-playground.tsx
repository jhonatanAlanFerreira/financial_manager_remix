import { useState } from "react";
import { Sidebar } from "~/components/siderbar/sidebar";
import { TopBar } from "~/components/top-bar/top-bar";

export default function GraphqlPlayground() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const updateSidebarOpen = (value: boolean) => {
    setSidebarOpen(value);
  };

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        updateSidebarOpen={updateSidebarOpen}
        overrideTitle={{ pageTitle: "GraphQL Playground" }}
      ></TopBar>
      <Sidebar
        sidebarOpen={sidebarOpen}
        updateSidebarOpen={updateSidebarOpen}
      ></Sidebar>
      <iframe
        className="h-screen w-screen"
        src="/api/graphql"
        title="GraphQL Playground"
      />
    </div>
  );
}
