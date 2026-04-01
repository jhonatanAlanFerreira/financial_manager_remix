import { Income, Prisma, User } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  IncomeCreateRequestInterface,
  IncomeUpdateRequestInterface,
} from "~/data/income/income-request-interfaces";
import {
  incomeCreateValidator,
  incomeDeleteValidator,
  incomeListValidator,
  incomeUpdateValidator,
} from "~/data/income/income-validator";
import { prisma } from "~/data/database/database.server";
import { IncomeLoaderParamsInterface } from "~/data/income/income-query-params-interfaces";
import { paginate } from "~/data/services/list.service";

export async function create(
  data: IncomeCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface> {
  const serverError = await incomeCreateValidator(data, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }

  const income = await prisma.income.create({
    data: {
      name: data.name,
      user_id: user.id,
      company_ids: data.companies,
      amount: data.amount,
      is_personal: data.is_personal,
    },
  });

  return {
    data: income,
    message: "Income was created successfully",
  };
}

export async function list(
  user: User,
  params: IncomeLoaderParamsInterface
): Promise<ServerResponseInterface<Income[]>> {
  const serverError = await incomeListValidator(params, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
    };
  }

  const { page, pageSize, extends: incomeIncludes, ...restParams } = params;

  return paginate<Income, Prisma.IncomeFindManyArgs, Prisma.IncomeCountArgs>(
    prisma.income.findMany,
    prisma.income.count,
    { page, pageSize },
    restParams,
    { user_id: user.id },
    incomeIncludes,
    { column: restParams.sort_key, order: restParams.sort_order }
  );
}

export async function remove(
  incomeId: string,
  user: User
): Promise<ServerResponseInterface> {
  const serverError = await incomeDeleteValidator(user, incomeId);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
    };
  }

  await prisma.income.delete({
    where: {
      id: incomeId,
    },
  });

  return {
    message: "Income removed successfully",
  };
}

export async function update(
  incomeId: string,
  user: User,
  data: IncomeUpdateRequestInterface
): Promise<ServerResponseInterface> {
  const serverError = await incomeUpdateValidator(data, user, incomeId);

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }

  const res = await prisma.income.update({
    data: {
      name: data.name,
      user_id: user.id,
      company_ids: data.companies,
      amount: data.amount,
      is_personal: data.is_personal,
    },
    where: {
      id: incomeId,
    },
  });

  return {
    data: res,
    message: "Income was updated successfully",
  };
}
