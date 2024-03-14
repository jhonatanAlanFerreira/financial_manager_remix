import { Income, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import IncomeCreateRequest from "~/interfaces/bodyRequests/IncomeCreateRequest";
import { prisma } from "~/data/database.server";
import { incomeCreateValidator } from "./requestValidators/incomeCreateValidator";
import { IncomeWithCompanies } from "~/interfaces/prismaModelDetails/income";
import incomeDeleteValidator from "./requestValidators/incomeDeleteValidator";
import IncomeUpdateRequest from "~/interfaces/bodyRequests/IncomeUpdateRequest";
import incomeUpdateValidator from "./requestValidators/incomeUpdateValidator";

export async function create(
  data: IncomeCreateRequest,
  user: User
): Promise<ServerResponse> {
  const dataIsValid = await incomeCreateValidator(data, user);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const income = await prisma.income.create({
    data: {
      name: data.name,
      user_id: user.id,
      company_ids: data.company_ids,
      amount: data.amount,
      is_personal_income: data.is_personal_income,
    },
  });

  return {
    data: income,
    message: "Income was created successfully",
  };
}

export async function list(
  user: User,
  includeCompanies: boolean
): Promise<ServerResponse<Income[] | IncomeWithCompanies[]>> {
  const incomes = await prisma.income.findMany({
    where: {
      user_id: user.id,
    },
    include: includeCompanies ? { companies: true } : undefined,
  });

  return {
    data: incomes,
  };
}

export async function remove(
  incomeId: string,
  user: User
): Promise<ServerResponse> {
  const dataIsValid = await incomeDeleteValidator(user, incomeId);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "Income not found",
      data: dataIsValid,
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
  data: IncomeUpdateRequest
): Promise<ServerResponse> {
  const dataIsValid = await incomeUpdateValidator(data, user, incomeId);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const res = await prisma.income.update({
    data,
    where: {
      id: incomeId,
    },
  });

  return {
    data: res,
    message: "Income was updated successfully",
  };
}
