import { ActionFunctionArgs, json } from "@remix-run/node";
import { LoginRequestInterface } from "~/data/auth/auth-request-interfaces";
import { createUserSession, login } from "~/data/auth/auth.server";

/**
 * @swagger
 * tags:
 *   - name: Auth Services
 *     description: API for managing Auth
 */

/**
 * @swagger
 * /api/login:
 *   post:
 *     tags:
 *       - Auth Services
 *     summary: Log into app
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login succeeded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "6705d447724aa25c72ff57fc"
 *                     name:
 *                       type: string
 *                       example: "Admin"
 *                     login:
 *                       type: string
 *                       example: "Admin"
 *                     accountant_balance:
 *                       type: number
 *                       example: 0
 *                 message:
 *                   type: string
 *                   example: "OK"
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Login Invalid
 */

export let action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 });
  }

  const body = await request.formData();

  const data: LoginRequestInterface = {
    login: String(body.get("login")),
    password: String(body.get("password")),
  };

  const res = await login(data);

  let status: number;
  let headers: HeadersInit = [];

  if (res.errors) {
    status = res.errors.errorCode;
  } else {
    status = 200;
    headers = [["Set-Cookie", await createUserSession(res.data.id)]];
  }

  return new Response(JSON.stringify(res), { status, headers });
};
