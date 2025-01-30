import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Sidebar } from "~/components/siderbar/sidebar";
import { TopBar } from "~/components/top-bar/top-bar";
import { loader as swaggerLoader } from "~/routes/docs/api-docs";

export let loader = async () => {
  return await swaggerLoader();
};

export default function SwaggerPage() {
  const swaggerData: any = useLoaderData();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const updateSidebarOpen = (value: boolean) => {
    setSidebarOpen(value);
  };

  return (
    <div className="flex flex-col h-screen">
      <TopBar
        updateSidebarOpen={updateSidebarOpen}
        overrideTitle={{ pageTitle: "API Overview" }}
      ></TopBar>
      <Sidebar
        sidebarOpen={sidebarOpen}
        updateSidebarOpen={updateSidebarOpen}
      ></Sidebar>
      <div className="overflow-auto">
        <SwaggerUI spec={swaggerData} />
      </div>
    </div>
  );
}
