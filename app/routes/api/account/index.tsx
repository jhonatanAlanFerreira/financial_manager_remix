import { requireUserSession } from "~/data/auth/auth.server";
import { create, list, remove, update } from "~/data/account/account.server";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  AccountCreateRequestInterface,
  AccountUpdateRequestInterface,
} from "~/data/account/account-request-interfaces";
import { AccountLoaderParamsInterface } from "~/data/account/account-query-params-interfaces";

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
 *         name: company
 *         schema:
 *           type: string
 *         description: Filter by company ID
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by account name
 *       - in: query
 *         name: is_personal_or_company
 *         schema:
 *           type: string
 *           enum: [all, personal, company]
 *           default: all
 *         description: Filter for personal or company accounts
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of accounts to return per page
 *     responses:
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       is_personal_account:
 *                         type: boolean
 *                       company_id:
 *                         type: string
 *                         nullable: true
 *                       balance:
 *                         type: number
 *               example:
 *                 data:
 *                   - id: "670705250198a726d9fdc6dd"
 *                     name: "Admin"
 *                     user_id: "6706fd5c0198a726d9fdc6d4"
 *                     is_personal_account: false
 *                     company_id: "670704278b4ab4826a250f34"
 *                     balance: 0
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: AccountLoaderParamsInterface = {
    company: url.searchParams.get("company"),
    name: url.searchParams.get("name"),
    is_personal_or_company:
      (url.searchParams.get("is_personal_or_company") as
        | "all"
        | "personal"
        | "company") || "all",
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
  };
  new URL(request.url).searchParams.get("personalOnly") === "true";
  return list(user, params);
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
 *                     name:
 *                       type: string
 *                     balance:
 *                       type: number
 *                     company:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "Account created successfully"
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
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
