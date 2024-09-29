import { User } from "@prisma/client";
import { prisma } from "../database/database.server";
import { ExpenseCreateRequestInterface, ExpenseUpdateRequestInterface } from "./expense-request-interfaces";
import ValidatedDataInterface from "~/shared/validated-data-interface";

export async function expenseCreateValidator(
  data: ExpenseCreateRequestInterface,
  user: User
): Promise<ValidatedDataInterface> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  const expenseExists = await prisma.expense.findUnique({
    where: {
      user_id_name_is_personal_expense: {
        name: data.name,
        user_id: user.id,
        is_personal_expense: data.is_personal_expense,
      },
    },
  });

  if (expenseExists !== null) {
    return {
      isValid: false,
      errors: {
        name: "This expense already exists",
      },
    };
  }

  if (data.companies?.length) {
    const companiesFromSameUser = await prisma.company.findMany({
      where: {
        id: {
          in: data.companies,
        },
        user_id: user.id,
      },
    });
    if (companiesFromSameUser.length != data.companies.length) {
      return {
        isValid: false,
        errors: {
          company_ids: "There are some invalid companies",
        },
      };
    }
  }

  return {
    isValid: true,
  };
}

export async function expenseDeleteValidator(
  user: User,
  expenseId: string
): Promise<ValidatedDataInterface> {
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
): Promise<ValidatedDataInterface> {
  if (!data.name) {
    return {
      isValid: false,
      errors: {
        empty: "Name can not be empty",
      },
    };
  }

  const expense = await prisma.expense.findFirst({
    where: {
      id: expenseId,
      user_id: user.id,
    },
  });

  if (!expense) {
    return {
      isValid: false,
      errors: {
        id: "Expense not found",
      },
    };
  }

  if (data.companies?.length) {
    const companiesFromSameUser = await prisma.company.findMany({
      where: {
        id: {
          in: data.companies,
        },
        user_id: user.id,
      },
    });
    if (companiesFromSameUser.length != data.companies.length) {
      return {
        isValid: false,
        errors: {
          company_ids: "There are some invalid companies",
        },
      };
    }
  }

  const expenseExists = await prisma.expense.findFirst({
    where: {
      AND: [
        { id: { not: expenseId } },
        { name: data.name },
        { user_id: user.id },
        { is_personal_expense: data.is_personal_expense },
      ],
    },
  });

  if (expenseExists !== null) {
    return {
      isValid: false,
      errors: {
        name: "This expense already exists",
      },
    };
  }

  return {
    isValid: true,
  };
}