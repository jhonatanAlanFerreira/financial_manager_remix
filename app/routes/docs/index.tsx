import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { useLoaderData } from "@remix-run/react";
import { getBaseUrl } from "~/utils/utilities";

export let loader = async () => {
  const response = await fetch(`${getBaseUrl()}/docs/api-docs`);
  return response.json();
};

export default function SwaggerPage() {
  const swaggerData: any = useLoaderData();
  return <SwaggerUI spec={swaggerData} />;
}
