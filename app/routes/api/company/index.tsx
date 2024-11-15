import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { CompanyLoaderParamsInterface } from "~/data/company/company-query-params-interfaces";
import {
  CompanyCreateRequestInterface,
  CompanyUpdateRequestInterface,
} from "~/data/company/company-request-interfaces";
import { create, list, remove, update } from "~/data/company/company.server";
import { parseIncludes } from "~/utils/utilities";
import { companyIncludeOptions } from "~/data/company/company-types";
import { createResponse } from "~/data/services/responses";

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
    name: url.searchParams.get("name") || undefined,
    extends: parseIncludes(url, companyIncludeOptions),
  };

  return list(user, params);
};

let createCompany = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: CompanyCreateRequestInterface = {
    name: String(body.get("name") || ""),
  };

  return createResponse(await create(data, user));
};

let removeCompany = async (request: Request) => {
  const user = await requireUserSession(request);
  const companyId = String(new URL(request.url).searchParams.get("companyId"));

  return remove(companyId, user);
};

let updateCompany = async (request: Request) => {
  const user = await requireUserSession(request);
  const companyId = String(new URL(request.url).searchParams.get("companyId"));
  const body = await request.formData();

  const data: CompanyUpdateRequestInterface = {
    name: String(body.get("name") || ""),
  };

  return update(data, user, companyId);
};
