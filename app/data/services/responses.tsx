import { ServerResponseInterface } from "~/shared/server-response-interface";

export function sendResponse(
  res: ServerResponseInterface,
  headers: HeadersInit = {
    "Content-Type": "application/json",
  }
): Response {
  return new Response(JSON.stringify(res), {
    status: res.serverError?.errorCode || res.code || 200,
    headers,
  });
}
