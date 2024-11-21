import { User } from "@prisma/client";
import {
  ExpenseCreateRequestInterface,
  ExpenseUpdateRequestInterface,
} from "~/data/expense/expense-request-interfaces";
import { prisma } from "~/data/database/database.server";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import {
  validateCompanies,
  validateIdFormat,
} from "~/data/services/validators";

export async function expenseCreateValidator(
  data: ExpenseCreateRequestInterface,
  user: User
): Promise<ServerResponseErrorInterface | null> {
  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  if (data.companies?.length && data.is_personal) {
    return {
      errorCode: 400,
      errors: {
        empty: "Personal expense can not have companies",
      },
    };
  }

  const companyErrors = await validateCompanies(data.companies, user);
  if (companyErrors) {
    return companyErrors;
  }

  const expenseExists = await prisma.expense.findFirst({
    where: {
      name: data.name,
      user_id: user.id,
      is_personal: data.is_personal,
    },
  });

  if (expenseExists !== null) {
    return {
      errorCode: 400,
      errors: {
        name: "This expense already exists",
      },
    };
  }

  return null;
}

export async function expenseDeleteValidator(
  user: User,
  expenseId: string
): Promise<any> {
  //WIP
  const expenseExistis = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      user_id: user.id,
    },
  });

  if (!expenseExistis) {
    return {
      isValid: false,
      errors: {
        id: "Expense not found",
      },
    };
  }

  return {
    isValid: true,
  };
}

export async function expenseUpdateValidator(
  expenseId: string,
  user: User,
  data: ExpenseUpdateRequestInterface
): Promise<ServerResponseErrorInterface | null> {
  if (!validateIdFormat(expenseId)) {
    return {
      errorCode: 400,
      errors: {
        balance: "Invalid expense ID format",
      },
    };
  }

  if (!data.name) {
    return {
      errorCode: 400,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  if (data.companies?.length && data.is_personal) {
    return {
      errorCode: 400,
      errors: {
        empty: "Personal expense can not have companies",
      },
    };
  }

  const companyErrors = await validateCompanies(data.companies, user);
  if (companyErrors) {
    return companyErrors;
  }

  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      user_id: user.id,
    },
  });

  if (!expense) {
    return {
      errorCode: 404,
      errors: {
        id: "Expense not found",
      },
    };
  }

  const expenseExists = await prisma.expense.findFirst({
    where: {
      AND: [
        { id: { not: expenseId } },
        { name: data.name },
        { user_id: user.id },
        { is_personal: data.is_personal },
      ],
    },
  });

  if (expenseExists !== null) {
    return {
      errorCode: 400,
      errors: {
        name: "This expense already exists",
      },
    };
  }

  return null;
}
