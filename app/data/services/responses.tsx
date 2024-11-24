import { ServerResponseInterface } from "~/shared/server-response-interface";

export function sendResponse(res: ServerResponseInterface): Response {
  return new Response(JSON.stringify(res), {
    status: res.serverError?.errorCode || res.code || 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
