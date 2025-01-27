import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { ClassificationLoaderParamsInterface } from "~/data/classification/classification-query-params-interfaces";
import {
  ClassificationCreateRequestInterface,
  ClassificationUpdateRequestInterface,
} from "~/data/classification/classification-request-interfaces";
import { classificationIncludeOptions } from "~/data/classification/classification-types";
import {
  create,
  list,
  remove,
  update,
} from "~/data/classification/classification.server";
import { sendResponse } from "~/data/services/responses";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";
import { getArrayFromFormData, parseIncludes } from "~/utils/utilities";

export let action = async ({ request }: ActionFunctionArgs) => {
  switch (request.method) {
    case "POST":
      return createClassification(request);
    case "DELETE":
      return removeClassification(request);
    case "PATCH":
      return updateClassification(request);
  }
};

let createClassification = async (request: Request) => {
  const user = await requireUserSession(request);
  const body = await request.formData();

  const data: ClassificationCreateRequestInterface = {
    name: String(body.get("name") || ""),
    is_income: body.get("is_income") == "true",
    is_personal: body.get("is_personal") == "true",
    companies: getArrayFromFormData(body, "companies"),
  };

  return sendResponse(await create(data, user));
};

let removeClassification = async (request: Request) => {
  const user = await requireUserSession(request);
  const classificationId = String(
    new URL(request.url).searchParams.get("classificationId")
  );

  return sendResponse(await remove(classificationId, user));
};

let updateClassification = async (request: Request) => {
  const user = await requireUserSession(request);
  const classificationId = String(
    new URL(request.url).searchParams.get("classificationId")
  );
  const body = await request.formData();

  const data: ClassificationUpdateRequestInterface = {
    name: String(body.get("name") || ""),
    is_income: body.get("is_income") == "true",
    is_personal: body.get("is_personal") == "true",
    companies: getArrayFromFormData(body, "companies"),
  };

  return sendResponse(await update(classificationId, user, data));
};

export let loader = async (
  { request }: LoaderFunctionArgs,
  overrideParams?: Partial<ClassificationLoaderParamsInterface>
) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: ClassificationLoaderParamsInterface = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
    has_company: url.searchParams.get("has_company") || undefined,
    name: url.searchParams.get("name") || undefined,
    extends: parseIncludes(url, classificationIncludeOptions),
    is_income_or_expense:
      (url.searchParams.get("is_income_or_expense") as IsIncomeOrExpenseType) ||
      "all",
    is_personal_or_company:
      (url.searchParams.get(
        "is_personal_or_company"
      ) as IsPersonalOrCompanyType) || "all",
    sort_key: url.searchParams.get("sort_key") || undefined,
    sort_order:
      (url.searchParams.get("sort_order") as "desc" | "asc") || "desc",
  };

  const finalParams = {
    ...params,
    ...overrideParams,
  };

  return sendResponse(await list(user, finalParams));
};
