import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth.server";
import { create, list, remove, update } from "~/data/classification.server";
import ClassificationCreateRequest from "~/interfaces/bodyRequests/ClassificationCreateRequest";
import ClassificationUpdateRequest from "~/interfaces/bodyRequests/ClassificationUpdateRequest";

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

  const data: ClassificationCreateRequest = {
    name: String(body.get("name") || ""),
    is_income: !!body.get("is_income"),
    is_personal_transaction_classification: !!body.get(
      "is_personal_transaction_classification"
    ),
    company_ids: body.get("companies")
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

  const data: ClassificationUpdateRequest = {
    name: String(body.get("name") || ""),
    is_income: !!body.get("is_income"),
    is_personal_transaction_classification: !!body.get(
      "is_personal_transaction_classification"
    ),
    company_ids: body.get("companies")
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

export let loader = async (
  { request }: LoaderFunctionArgs,
  includeCompany = false
) => {
  const user = await requireUserSession(request);
  if (request.url.includes("includeCompany=true")) {
    includeCompany = true;
  }

  return list(user, includeCompany);
};
