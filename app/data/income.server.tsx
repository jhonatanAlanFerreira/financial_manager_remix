import { Income, Prisma, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import IncomeCreateRequest from "~/interfaces/bodyRequests/income/IncomeCreateRequest";
import { prisma } from "~/data/database.server";
import { incomeCreateValidator } from "~/data/requestValidators/income/incomeCreateValidator";
import { IncomeWithCompanies } from "~/interfaces/prismaModelDetails/income";
import incomeDeleteValidator from "~/data/requestValidators/income/incomeDeleteValidator";
import IncomeUpdateRequest from "~/interfaces/bodyRequests/income/IncomeUpdateRequest";
import incomeUpdateValidator from "~/data/requestValidators/income/incomeUpdateValidator";
import IncomeLoaderParams from "~/interfaces/queryParams/income/IncomeLoaderParams";

type IncomeWhereInput = Prisma.IncomeWhereInput;

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
      company_ids: data.companies,
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
  params: IncomeLoaderParams
): Promise<ServerResponse<Income[] | IncomeWithCompanies[]>> {
  const take = params.pageSize != "all" ? params.pageSize : undefined;
  const skip =
    params.pageSize != "all" ? (params.page - 1) * params.pageSize : undefined;

  const whereClause: IncomeWhereInput = {
    user_id: user.id,
  };

  whereClause.is_personal_income =
    params.is_personal_or_company !== "all"
      ? params.is_personal_or_company === "personal"
      : undefined;

  if (params.name) {
    whereClause.name = { contains: params.name, mode: "insensitive" };
  }

  if (params.amount_greater || params.amount_less) {
    whereClause.amount = {};
    if (params.amount_greater) {
      whereClause.amount.gte = params.amount_greater;
    }
    if (params.amount_less) {
      whereClause.amount.lte = params.amount_less;
    }
  }

  if (params.company) {
    whereClause.company_ids = {
      has: params.company,
    };
  }

  const incomes = await prisma.income.findMany({
    where: whereClause,
    skip,
    take,
  });

  const totalData = await prisma.income.count({
    where: whereClause,
  });

  const totalPages =
    params.pageSize != "all" ? Math.ceil(totalData / params.pageSize) : 1;
  const pageSize = params.pageSize != "all" ? params.pageSize : totalData;

  return {
    data: incomes,
    pageInfo: {
      currentPage: params.page,
      pageSize,
      totalData,
      totalPages,
    },
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
    data: {
      name: data.name,
      user_id: user.id,
      company_ids: data.companies,
      amount: data.amount,
      is_personal_income: data.is_personal_income,
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
