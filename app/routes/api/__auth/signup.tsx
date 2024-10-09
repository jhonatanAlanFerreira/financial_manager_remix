import { ActionFunctionArgs, json } from "@remix-run/node";
import { SignupRequestInterface } from "~/data/auth/auth-request-interfaces";
import { createUserSession, signup } from "~/data/auth/auth.server";

/**
 * @swagger
 * tags:
 *   - name: Auth Services
 *     description: API for managing Auth
 */

/**
 * @swagger
 * /api/signup:
 *   post:
 *     tags:
 *       - Auth Services
 *     summary: Create Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordRepeat:
 *                 type: string
 *     responses:
 *       201:
 *         description: Login created
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
 *                       example: "6705d007724aa25c72ff57f8"
 *                     name:
 *                       type: string
 *                       example: "Admin"
 *                     login:
 *                       type: string
 *                       example: "admin"
 *                     accountant_balance:
 *                       type: number
 *                       example: 0
 *                 message:
 *                   type: string
 *                   example: "Your user and default account were created successfully"
 *
 *       400:
 *         description: Bad Request
 */

export let action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    throw json({ message: "Invalid request method" }, { status: 400 });
  }

  const body = await request.formData();

  const data: SignupRequestInterface = {
    name: String(body.get("name")),
    login: String(body.get("login")),
    password: String(body.get("password")),
    passwordRepeat: String(body.get("passwordRepeat")),
  };

  const res = await signup(data);

  let status: number;
  let headers: HeadersInit = [];

  if (res.errors) {
    status = res.errors.errorCode;
  } else {
    status = 201;
    headers = [["Set-Cookie", await createUserSession(res.data.id)]];
  }

  return new Response(JSON.stringify(res), { status, headers });
};
