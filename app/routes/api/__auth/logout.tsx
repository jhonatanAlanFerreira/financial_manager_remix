import { LoaderFunctionArgs, json } from "@remix-run/node";
import { destroyUserSession } from "~/data/auth.server";

export function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    throw json({ message: "Invalid request method" }, { status: 400 });
  }

  return destroyUserSession(request);
}
