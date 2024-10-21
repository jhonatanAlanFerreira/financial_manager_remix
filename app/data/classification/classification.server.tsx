import { Prisma, TransactionClassification, User } from "@prisma/client";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  ClassificationCreateRequestInterface,
  ClassificationUpdateRequestInterface,
} from "~/data/classification/classification-request-interfaces";
import {
  classificationCreateValidator,
  classificationDeleteValidator,
  classificationUpdateValidator,
} from "~/data/classification/classification-validator";
import { prisma } from "~/data/database/database.server";
import { ClassificationLoaderParamsInterface } from "~/data/classification/classification-query-params-interfaces";
import { ClassificationWithCompanyType } from "~/data/classification/classification-types";

type TransactionClassificationWhereInput =
  Prisma.TransactionClassificationWhereInput;

export async function create(
  data: ClassificationCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface> {
  const dataIsValid = await classificationCreateValidator(data, user);

  if (!dataIsValid.isValid) {
    return {
     // error: true, WIP
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const classification = await prisma.transactionClassification.create({
    data: {
      name: data.name,
      user_id: user.id,
      is_income: data.is_income,
      is_personal_transaction_classification:
        data.is_personal_transaction_classification,
      company_ids: data.companies,
    },
  });

  return {
    data: classification,
    message: "Classification was created successfully",
  };
}

export async function remove(
  classificationId: string,
  user: User
): Promise<ServerResponseInterface> {
  const dataIsValid = await classificationDeleteValidator(
    user,
    classificationId
  );

  if (!dataIsValid.isValid) {
    return {
     // error: true, WIP
      message: "Classification not found",
      data: dataIsValid,
    };
  }

  await prisma.transactionClassification.delete({
    where: {
      id: classificationId,
    },
  });

  return {
    message: "Classification removed successfully",
  };
}

export async function update(
  classificationId: string,
  user: User,
  data: ClassificationUpdateRequestInterface
): Promise<ServerResponseInterface> {
  const dataIsValid = await classificationUpdateValidator(
    data,
    user,
    classificationId
  );

  if (!dataIsValid.isValid) {
    return {
     // error: true, WIP
      message: "There are some errors in your form",
      data: dataIsValid,
    };
  }

  const res = await prisma.transactionClassification.update({
    data: {
      name: data.name,
      user_id: user.id,
      is_income: data.is_income,
      is_personal_transaction_classification:
        data.is_personal_transaction_classification,
      company_ids: data.companies,
    },
    where: {
      id: classificationId,
    },
  });

  return {
    data: res,
    message: "Classification was updated successfully",
  };
}

export async function list(
  user: User,
  params: ClassificationLoaderParamsInterface
): Promise<
  ServerResponseInterface<
    TransactionClassification[] | ClassificationWithCompanyType[]
  >
> {
  const take = params.pageSize != "all" ? params.pageSize : undefined;
  const skip =
    params.pageSize != "all" ? (params.page - 1) * params.pageSize : undefined;

  const whereClause: TransactionClassificationWhereInput = {
    user_id: user.id,
  };

  whereClause.is_personal_transaction_classification =
    params.is_personal_or_company !== "all"
      ? params.is_personal_or_company === "personal"
      : undefined;

  whereClause.is_income =
    params.is_income_or_expense !== "all"
      ? params.is_income_or_expense === "income"
      : undefined;

  if (params.name) {
    whereClause.name = { contains: params.name, mode: "insensitive" };
  }

  if (params.company) {
    whereClause.company_ids = {
      has: params.company,
    };
  }

  const classifications = await prisma.transactionClassification.findMany({
    where: whereClause,
    skip,
    take,
  });

  const totalData = await prisma.transactionClassification.count({
    where: whereClause,
  });

  const totalPages =
    params.pageSize != "all" ? Math.ceil(totalData / params.pageSize) : 1;
  const pageSize = params.pageSize != "all" ? params.pageSize : totalData;

  return {
    data: classifications,
    pageInfo: {
      currentPage: params.page,
      pageSize,
      totalData,
      totalPages,
    },
  };
}
