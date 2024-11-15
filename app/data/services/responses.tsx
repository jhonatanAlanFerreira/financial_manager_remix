import { ServerResponseInterface } from "~/shared/server-response-interface";

export function createResponse(res: ServerResponseInterface): Response {
  return new Response(JSON.stringify(res), { status: 201 });
}
