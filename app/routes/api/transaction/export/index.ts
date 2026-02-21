import { LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/data/auth/auth.server";
import { TransactionCSVExportLoaderParamsInterface } from "~/data/transaction/transaction-query-params-interfaces";
import { exportCSV } from "~/data/transaction/transaction.server";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";

export let loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);

  const url = new URL(request.url);

  const params: TransactionCSVExportLoaderParamsInterface = {
    amount_greater: Number(url.searchParams.get("amount_greater")),
    amount_less: Number(url.searchParams.get("amount_less")),
    date_after: url.searchParams.get("date_after") || undefined,
    date_before: url.searchParams.get("date_before") || undefined,
    expense: url.searchParams.get("expense") || undefined,
    merchant: url.searchParams.get("merchant") || undefined,
    income: url.searchParams.get("income") || undefined,
    account: url.searchParams.get("account") || undefined,
    has_classification: url.searchParams.get("has_classification") || undefined,
    company: url.searchParams.get("company") || undefined,
    name: url.searchParams.get("name") || undefined,
    is_income_or_expense:
      (url.searchParams.get("is_income_or_expense") as IsIncomeOrExpenseType) ||
      "all",
    is_personal_or_company:
      (url.searchParams.get(
        "is_personal_or_company"
      ) as IsPersonalOrCompanyType) || "all",
  };

  return await exportCSV(user, params);
};
