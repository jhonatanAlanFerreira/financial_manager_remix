import { requireUserSession } from "~/data/auth/auth.server";
import { create, list, remove, update } from "~/data/account/account.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  AccountCreateRequestInterface,
  AccountUpdateRequestInterface,
} from "~/data/account/account-request-interfaces";

/**
 * @swagger
 * tags:
 *   - name: Accounting Services
 *     description: API for managing accounts
 */

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createAccount(request);
    case "DELETE":
      return removeAccount(request);
    case "PATCH":
      return updateAccount(request);
  }
};

/**
 * @swagger
 * /api/account:
 *   get:
 *     tags:
 *       - Accounting Services
 *     summary: Retrieve a list of accounts
 *     parameters:
 *       - in: query
 *         name: personalOnly
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
export let loader = async (
  { request }: LoaderFunctionArgs,
  personalOnly: boolean | null = null
) => {
  const user = await requireUserSession(request);
  if (personalOnly === null) {
    personalOnly =
      new URL(request.url).searchParams.get("personalOnly") === "true";
  }
  return list(user, personalOnly);
};

/**
 * @swagger
 * /api/account:
 *   post:
 *     tags:
 *       - Accounting Services
 *     summary: Create a new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               balance:
 *                 type: number
 *               company:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Bad Request
 */
let createAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: AccountCreateRequestInterface = {
    name: String(body.get("name") || ""),
    balance: +(body.get("balance") || 0),
    company: String(body.get("company") || ""),
  };

  const res = await create(data, user);
  const status: number = res.errors ? res.errors.errorCode : 201;
  return new Response(JSON.stringify(res), { status });
};

/**
 * @swagger
 * /api/account:
 *   delete:
 *     tags:
 *       - Accounting Services
 *     summary: Delete an account
 *     parameters:
 *       - in: query
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Account deleted
 *       404:
 *         description: Account not found
 */
let removeAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const accountId = String(new URL(request.url).searchParams.get("accountId"));

  const res = await remove(accountId, user);
  const status: number = res.errors ? res.errors.errorCode : 200;
  return new Response(JSON.stringify(res), { status });
};

/**
 * @swagger
 * /api/account:
 *   patch:
 *     tags:
 *       - Accounting Services
 *     summary: Update an account
 *     parameters:
 *       - in: query
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Account updated
 *       400:
 *         description: Bad Request
 */
let updateAccount = async (request: Request) => {
  const user = await requireUserSession(request);
  const accountId = String(new URL(request.url).searchParams.get("accountId"));
  const body = await request.formData();

  const data: AccountUpdateRequestInterface = {
    name: String(body.get("name") || ""),
    balance: +(body.get("balance") || 0),
  };

  const res = await update(accountId, user, data);
  const status: number = res.errors ? res.errors.errorCode : 200;
  return new Response(JSON.stringify(res), { status });
};
