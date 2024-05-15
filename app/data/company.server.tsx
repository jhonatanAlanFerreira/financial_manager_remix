import { Company, User } from "@prisma/client";
import { prisma } from "~/data/database.server";
import ServerResponse from "~/interfaces/ServerResponse";
import CompanyCreateRequest from "~/interfaces/bodyRequests/CompanyCreateRequest";
import companyCreateValidator from "~/data/requestValidators/companyCreateValidator";
import ValidatedData from "~/interfaces/ValidatedData";
import companyUpdateValidator from "~/data/requestValidators/companyUpdateValidator";
import companyDeleteValidator from "~/data/requestValidators/companyDeleteValidator";
import CompanyUpdateRequest from "~/interfaces/bodyRequests/CompanyUpdateRequest";

export async function list(user: User): Promise<ServerResponse<Company[]>> {
  const companies = await prisma.company.findMany({
    where: {
      user_id: user.id,
    },
  });

  return {
    data: companies,
  };
}

export async function create(
  data: CompanyCreateRequest,
  user: User
): Promise<ServerResponse<Company | ValidatedData>> {
  const dataIsValid = await companyCreateValidator(data, user);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const company = await prisma.company.create({
    data: {
      name: data.name,
      working_capital: data.working_capital,
      user_id: user.id,
    },
  });

  return {
    data: company,
    message: "Company was created successfully",
  };
}

export async function update(
  data: CompanyUpdateRequest,
  user: User,
  companyId: string
): Promise<ServerResponse<Company | ValidatedData>> {
  const dataIsValid = await companyUpdateValidator(data, user, companyId);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const res = await prisma.company.update({
    data,
    where: {
      id: companyId,
    },
  });

  return {
    data: res,
    message: "Company was updated successfully",
  };
}

export async function remove(
  companyId: string,
  user: User
): Promise<ServerResponse> {
  const dataIsValid = await companyDeleteValidator(user, companyId);

  if (!dataIsValid.isValid) {
    return {
      error: true,
      message: "Company not found",
      data: dataIsValid,
    };
  }

  await prisma.company.delete({
    where: {
      id: companyId,
    },
  });

  return {
    message: "Company removed successfully",
  };
}
