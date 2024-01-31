import { TransactionClassification, User } from "@prisma/client";
import ServerResponse from "~/interfaces/ServerResponse";
import ClassificationCreateRequest from "~/interfaces/bodyRequests/ClassificationCreateRequest";
import classificationCreateValidator from "./requestValidators/classificationCreateValidator";
import { prisma } from "~/data/database.server";
import classificationDeleteValidator from "./requestValidators/classificationDeleteValidator";
import ClassificationUpdateRequest from "~/interfaces/bodyRequests/ClassificationUpdateRequest";
import classificationUpdateValidator from "./requestValidators/classificationUpdateValidator";
import { ClassificationWithCompany } from "~/interfaces/prismaModelDetails/classification";

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
      is_personal_transaction_classification:
        data.is_personal_transaction_classification,
      company_id: data.company_id,
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
      message: "Expense not found",
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
    data,
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
  includeCompany: boolean
): Promise<
  ServerResponse<TransactionClassification[] | ClassificationWithCompany[]>
> {
  const classifications = await prisma.transactionClassification.findMany({
    where: {
      user_id: user.id,
    },
    include: includeCompany ? { company: true } : undefined,
  });

  return {
    data: classifications,
  };
}
