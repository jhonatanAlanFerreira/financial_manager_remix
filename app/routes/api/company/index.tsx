import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { CompanyLoaderParamsInterface } from "~/data/company/company-query-params-interfaces";
import {
  CompanyCreateRequestInterface,
  CompanyUpdateRequestInterface,
} from "~/data/company/company-request-interfaces";
import { create, list, remove, update } from "~/data/company/company.server";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createCompany(request);
    case "DELETE":
      return removeCompany(request);
    case "PATCH":
      return updateCompany(request);
  }
};

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: CompanyLoaderParamsInterface = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
    with_accounts: !!url.searchParams.get("with_accounts"),
    working_capital_greater: Number(
      url.searchParams.get("working_capital_greater")
    ),
    working_capital_less: Number(url.searchParams.get("working_capital_less")),
    name: url.searchParams.get("name"),
  };

  return list(user, params);
};

let createCompany = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: CompanyCreateRequestInterface = {
    name: String(body.get("name") || ""),
  };

  const res = await create(data, user);

  let status: number;

  if (res.error) {
    status = 400;
  } else {
    status = 201;
  }

  return new Response(JSON.stringify(res), { status });
};

let removeCompany = async (request: Request) => {
  const user = await requireUserSession(request);
  const companyId = String(new URL(request.url).searchParams.get("companyId"));

  const res = await remove(companyId, user);

  let status: number;

  if (res.error) {
    status = 404;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};

let updateCompany = async (request: Request) => {
  const user = await requireUserSession(request);
  const companyId = String(new URL(request.url).searchParams.get("companyId"));
  const body = await request.formData();

  const data: CompanyUpdateRequestInterface = {
    name: String(body.get("name") || ""),
  };

  const res = await update(data, user, companyId);
  let status: number;

  if (res.error) {
    status = 400;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};
