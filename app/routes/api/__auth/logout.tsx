import { LoaderFunctionArgs, json } from "@remix-run/node";
import { destroyUserSession } from "~/data/auth/auth.server";

/**
 * @swagger
 * tags:
 *   - name: Auth Services
 *     description: API for managing Auth
 */

/**
 * @swagger
 * /api/logout:
 *   get:
 *     tags:
 *       - Auth Services
 *     summary: End the user session
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully logged out
 */
export function loader({ request }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    throw json({ message: "Invalid request method" }, { status: 400 });
  }

  return destroyUserSession(request);
}
