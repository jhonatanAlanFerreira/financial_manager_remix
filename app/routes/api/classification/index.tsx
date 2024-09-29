import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import ClassificationLoaderParamsInterface from "~/data/classification/classification-query-params-interfaces";
import { ClassificationCreateRequestInterface, ClassificationUpdateRequestInterface } from "~/data/classification/Classification-request-interfaces";
import { create, list, remove, update } from "~/data/classification/classification.server";

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
    is_income: !!body.get("is_income"),
    is_personal_transaction_classification: !!body.get(
      "is_personal_transaction_classification"
    ),
    companies: body.get("companies")
      ? (body.getAll("companies") as string[])
      : [],
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

let removeClassification = async (request: Request) => {
  const user = await requireUserSession(request);
  const classificationId = String(
    new URL(request.url).searchParams.get("classificationId")
  );

  const res = await remove(classificationId, user);

  let status: number;

  if (res.error) {
    status = 404;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};

let updateClassification = async (request: Request) => {
  const user = await requireUserSession(request);
  const classificationId = String(
    new URL(request.url).searchParams.get("classificationId")
  );
  const body = await request.formData();

  const data: ClassificationUpdateRequestInterface = {
    name: String(body.get("name") || ""),
    is_income: !!body.get("is_income"),
    is_personal_transaction_classification: !!body.get(
      "is_personal_transaction_classification"
    ),
    companies: body.get("companies")
      ? (body.getAll("companies") as string[])
      : [],
  };

  const res = await update(classificationId, user, data);

  let status: number;

  if (res.error) {
    status = 400;
  } else {
    status = 200;
  }

  return new Response(JSON.stringify(res), { status });
};

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);
  const params: ClassificationLoaderParamsInterface = {
    page: Number(url.searchParams.get("page")) || 1,
    pageSize: Number(url.searchParams.get("pageSize")) || "all",
    company: url.searchParams.get("company"),
    name: url.searchParams.get("name"),
    is_income_or_expense:
      (url.searchParams.get("is_income_or_expense") as
        | "expense"
        | "income"
        | "all") || "all",
    is_personal_or_company:
      (url.searchParams.get("is_personal_or_company") as
        | "all"
        | "personal"
        | "company") || "all",
  };
  return list(user, params);
};
