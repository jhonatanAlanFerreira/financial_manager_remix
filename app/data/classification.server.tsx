import { Prisma, TransactionClassification, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import ClassificationCreateRequest from "~/interfaces/bodyRequests/classification/ClassificationCreateRequest";
import classificationCreateValidator from "~/data/requestValidators/classification/classificationCreateValidator";
import { prisma } from "~/data/database.server";
import classificationDeleteValidator from "~/data/requestValidators/classification/classificationDeleteValidator";
import ClassificationUpdateRequest from "~/interfaces/bodyRequests/classification/ClassificationUpdateRequest";
import classificationUpdateValidator from "~/data/requestValidators/classification/classificationUpdateValidator";
import { ClassificationWithCompany } from "~/interfaces/prismaModelDetails/classification";
import ClassificationLoaderParams from "~/interfaces/queryParams/classification/ClassificationLoaderParams";

type TransactionClassificationWhereInput =
  Prisma.TransactionClassificationWhereInput;

export async function create(
  data: ClassificationCreateRequest,
  user: User
): Promise<ServerResponse> {
  const dataIsValid = await classificationCreateValidator(data, user);

  if (!dataIsValid.isValid) {
    return {
      error: true,
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
): Promise<ServerResponse> {
  const dataIsValid = await classificationDeleteValidator(
    user,
    classificationId
  );

  if (!dataIsValid.isValid) {
    return {
      error: true,
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
  data: ClassificationUpdateRequest
): Promise<ServerResponse> {
  const dataIsValid = await classificationUpdateValidator(
    data,
    user,
    classificationId
  );

  if (!dataIsValid.isValid) {
    return {
      error: true,
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
  params: ClassificationLoaderParams
): Promise<
  ServerResponse<TransactionClassification[] | ClassificationWithCompany[]>
> {
  const skip = (params.page - 1) * params.pageSize;

  const whereClause: TransactionClassificationWhereInput = {
    user_id: user.id,
  };

  if (params.is_income) {
    whereClause.is_income = true;
  }

  if (params.is_personal_transaction_classification) {
    whereClause.is_personal_transaction_classification = true;
  }

  if (params.name) {
    whereClause.name = { contains: params.name };
  }

  if (params.company) {
    whereClause.company_ids = {
      has: params.company,
    };
  }

  const classifications = await prisma.transactionClassification.findMany({
    where: whereClause,
    skip: skip,
    take: params.pageSize,
  });

  const totalData = await prisma.transactionClassification.count({
    where: whereClause,
  });

  const totalPages = Math.ceil(totalData / params.pageSize);

  return {
    data: classifications,
    pageInfo: {
      currentPage: params.page,
      pageSize: params.pageSize,
      totalData,
      totalPages,
    },
  };
}
