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
  listClassificationsValidator,
} from "~/data/classification/classification-validator";
import { prisma } from "~/data/database/database.server";
import { ClassificationLoaderParamsInterface } from "~/data/classification/classification-query-params-interfaces";
import { paginate } from "~/data/services/list.service";
import { ClassificationIncludeOptions } from "~/data/classification/classification-types";

export async function create(
  data: ClassificationCreateRequestInterface,
  user: User
): Promise<ServerResponseInterface> {
  const serverError = await classificationCreateValidator(data, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }

  const classification = await prisma.transactionClassification.create({
    data: {
      name: data.name,
      user_id: user.id,
      is_income: data.is_income,
      is_personal: data.is_personal,
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
  const serverError = await classificationDeleteValidator(
    user,
    classificationId
  );

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
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
  const serverError = await classificationUpdateValidator(
    data,
    user,
    classificationId
  );

  if (serverError) {
    return {
      serverError,
      message: "There are some errors in your form",
    };
  }
  const res = await prisma.transactionClassification.update({
    data: {
      name: data.name,
      user_id: user.id,
      is_income: data.is_income,
      is_personal: data.is_personal,
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
): Promise<ServerResponseInterface<TransactionClassification[]>> {
  const serverError = await listClassificationsValidator(params, user);

  if (serverError) {
    return {
      serverError,
      message: "There are some invalid params",
    };
  }

  const {
    page,
    pageSize,
    extends: classificationIncludes,
    ...restParams
  } = params;

  return paginate<
    TransactionClassification,
    Prisma.TransactionClassificationFindManyArgs,
    Prisma.TransactionClassificationCountArgs,
    ClassificationIncludeOptions,
    Prisma.TransactionClassificationWhereInput
  >(
    prisma.transactionClassification.findMany,
    prisma.transactionClassification.count,
    { page, pageSize },
    restParams,
    { user_id: user.id },
    classificationIncludes
  );
}
