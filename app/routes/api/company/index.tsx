import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth.server";
import { create, list, remove, update } from "~/data/company.server";
import CompanyCreateRequest from "~/interfaces/bodyRequests/CompanyCreateRequest";
import CompanyUpdateRequest from "~/interfaces/bodyRequests/CompanyUpdateRequest";

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

  return list(user);
};

let createCompany = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: CompanyCreateRequest = {
    name: String(body.get("name") || ""),
    working_capital: +(body.get("working_capital") || 0),
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

  const data: CompanyUpdateRequest = {
    name: String(body.get("name") || ""),
    working_capital: +(body.get("working_capital") || 0),
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
