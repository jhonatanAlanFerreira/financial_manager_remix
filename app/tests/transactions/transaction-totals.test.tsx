import { User } from "@prisma/client";
import { prisma } from "~/data/database/database.server";
import { TransactionLoaderParamsInterface } from "~/data/transaction/transaction-query-params-interfaces";
import { list } from "~/data/transaction/transaction.server";
import { todayFormatedDate } from "~/utils/utilities";

describe("Transaction Totals Logic", () => {
  const checkTransactionsTotal = async (
    user: User,
    filters: TransactionLoaderParamsInterface,
    expectedIncomeTotal: number,
    expectedExpenseTotal: number
  ) => {
    const res = await list(user, filters);

    expect(res.data?.totalIncomeValue).toBe(expectedIncomeTotal);
    expect(res.data?.totalExpenseValue).toBe(expectedExpenseTotal);
  };

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
  });

  it("should create incomes and expenses transactions and check the totals", async () => {
    const user = await prisma.user.create({
      data: {
        name: "User Test",
        login: "userTest",
        password: "passTest",
      },
    });

    const company1 = await prisma.company.create({
      data: {
        name: "Company 1",
        user_id: user.id,
      },
    });

    const company2 = await prisma.company.create({
      data: {
        name: "Company 2",
        user_id: user.id,
      },
    });

    const accountFromCompany1 = await prisma.account.create({
      data: {
        balance: 200,
        name: "Account Test Company 1",
        is_personal: false,
        user_id: user.id,
        company_id: company1.id,
      },
    });

    const accountFromCompany2 = await prisma.account.create({
      data: {
        balance: 200,
        name: "Account Test Company 2",
        is_personal: false,
        user_id: user.id,
        company_id: company2.id,
      },
    });

    for (let i = 1; i <= 15; i++) {
      await prisma.transaction.create({
        data: {
          name: "Transaction",
          user_id: user.id,
          amount: i * 10,
          account_id: accountFromCompany1.id,
          date: todayFormatedDate(),
          is_income: true,
          company_id: company1.id,
        },
      });
    }

    for (let i = 1; i <= 15; i++) {
      await prisma.transaction.create({
        data: {
          name: "Transaction",
          user_id: user.id,
          amount: i * 10,
          account_id: accountFromCompany1.id,
          date: todayFormatedDate(),
          is_income: false,
          company_id: company1.id,
        },
      });
    }

    for (let i = 1; i <= 15; i++) {
      await prisma.transaction.create({
        data: {
          name: "Transaction",
          user_id: user.id,
          amount: i * 10,
          account_id: accountFromCompany2.id,
          date: todayFormatedDate(),
          is_income: true,
          company_id: company2.id,
        },
      });
    }

    for (let i = 1; i <= 15; i++) {
      await prisma.transaction.create({
        data: {
          name: "Transaction",
          user_id: user.id,
          amount: i * 10,
          account_id: accountFromCompany2.id,
          date: todayFormatedDate(),
          is_income: false,
          company_id: company2.id,
        },
      });
    }

    await checkTransactionsTotal(
      user,
      {
        account: undefined,
        amount_greater: undefined,
        amount_less: undefined,
        classification: undefined,
        company: undefined,
        date_after: undefined,
        date_before: undefined,
        expense: undefined,
        income: undefined,
        name: undefined,
        is_income_or_expense: "all",
        is_personal_or_company: "all",
        page: 1,
        pageSize: 10,
      },
      2400,
      2400
    );

    await checkTransactionsTotal(
      user,
      {
        account: undefined,
        amount_greater: undefined,
        amount_less: undefined,
        classification: undefined,
        company: undefined,
        date_after: undefined,
        date_before: undefined,
        expense: undefined,
        income: undefined,
        name: undefined,
        is_income_or_expense: "income",
        is_personal_or_company: "all",
        page: 1,
        pageSize: 10,
      },
      2400,
      0
    );

    await checkTransactionsTotal(
      user,
      {
        account: undefined,
        amount_greater: undefined,
        amount_less: undefined,
        classification: undefined,
        company: undefined,
        date_after: undefined,
        date_before: undefined,
        expense: undefined,
        income: undefined,
        name: undefined,
        is_income_or_expense: "expense",
        is_personal_or_company: "all",
        page: 1,
        pageSize: 10,
      },
      0,
      2400
    );

    await checkTransactionsTotal(
      user,
      {
        account: undefined,
        amount_greater: undefined,
        amount_less: undefined,
        classification: undefined,
        company: company1.id,
        date_after: undefined,
        date_before: undefined,
        expense: undefined,
        income: undefined,
        name: undefined,
        is_income_or_expense: "all",
        is_personal_or_company: "all",
        page: 1,
        pageSize: 10,
      },
      1200,
      1200
    );

    await checkTransactionsTotal(
      user,
      {
        account: undefined,
        amount_greater: undefined,
        amount_less: undefined,
        classification: undefined,
        company: company1.id,
        date_after: undefined,
        date_before: undefined,
        expense: undefined,
        income: undefined,
        name: undefined,
        is_income_or_expense: "income",
        is_personal_or_company: "all",
        page: 1,
        pageSize: 10,
      },
      1200,
      0
    );

    await checkTransactionsTotal(
      user,
      {
        account: undefined,
        amount_greater: undefined,
        amount_less: undefined,
        classification: undefined,
        company: company1.id,
        date_after: undefined,
        date_before: undefined,
        expense: undefined,
        income: undefined,
        name: undefined,
        is_income_or_expense: "expense",
        is_personal_or_company: "all",
        page: 1,
        pageSize: 10,
      },
      0,
      1200
    );
  });
});
