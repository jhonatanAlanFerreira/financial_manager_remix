import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { IncomeLoaderParamsInterface } from "~/data/income/income-query-params-interfaces";
import {
  IncomeCreateRequestInterface,
  IncomeUpdateRequestInterface,
} from "~/data/income/income-request-interfaces";
import { incomeIncludeOptions } from "~/data/income/income-types";
import { create, list, remove, update } from "~/data/income/income.server";
import { sendResponse } from "~/data/services/responses";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";
import { getArrayFromFormData, parseIncludes } from "~/utils/utilities";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createIncome(request);
    case "DELETE":
      return removeIncome(request);
    case "PATCH":
      return updateIncome(request);
  }
};

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: IncomeLoaderParamsInterface = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
    amount_greater: Number(url.searchParams.get("amount_greater")),
    amount_less: Number(url.searchParams.get("amount_less")),
    has_company: url.searchParams.get("company") || undefined,
    name: url.searchParams.get("name") || undefined,
    is_personal_or_company:
      (url.searchParams.get(
        "is_personal_or_company"
      ) as IsPersonalOrCompanyType) || "all",
    extends: parseIncludes(url, incomeIncludeOptions),
  };
  return sendResponse(await list(user, params));
};

let createIncome = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: IncomeCreateRequestInterface = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal: body.get("is_personal") == "true",
    companies: getArrayFromFormData(body, "companies"),
  };

  return sendResponse(await create(data, user));
};

let removeIncome = async (request: Request) => {
  const user = await requireUserSession(request);
  const incomeId = String(new URL(request.url).searchParams.get("incomeId"));

  return sendResponse(await remove(incomeId, user));
};

let updateIncome = async (request: Request) => {
  const user = await requireUserSession(request);
  const incomeId = String(new URL(request.url).searchParams.get("incomeId"));
  const body = await request.formData();

  const data: IncomeUpdateRequestInterface = {
    name: String(body.get("name") || ""),
    amount: +(body.get("amount") || 0),
    is_personal: body.get("is_personal") == "true",
    companies: getArrayFromFormData(body, "companies"),
  };

  return sendResponse(await update(incomeId, user, data));
};
