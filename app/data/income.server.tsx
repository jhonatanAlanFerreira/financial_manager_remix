import { Income, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import IncomeCreateRequest from "~/interfaces/bodyRequests/IncomeCreateRequest";
import { prisma } from "~/data/database.server";
import { incomeCreateValidator } from "./requestValidators/incomeCreateValidator";
import { IncomeWithCompanies } from "~/interfaces/prismaModelDetails/income";

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
  const expenses = await prisma.income.findMany({
    where: {
      user_id: user.id,
    },
    include: includeCompanies ? { companies: true } : undefined,
  });

  return {
    data: expenses,
  };
}
