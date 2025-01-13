import { useState } from "react";
import { Sidebar } from "~/components/siderbar/sidebar";
import { TopBar } from "~/components/top-bar/top-bar";

export default function Graphql() {
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
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800">
        <h1 className="text-3xl font-bold mb-4">GraphQL Playground</h1>
        <p className="text-lg text-gray-600 text-center max-w-md">
          This page will soon feature a fully functional GraphQL playground for
          exploring and testing API queries and mutations.
          <br />
        </p>
      </div>
    </div>
  );
}
