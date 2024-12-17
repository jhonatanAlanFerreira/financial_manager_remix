import { update, create, remove } from "~/data/transaction/transaction.server";
import { User } from "@prisma/client";
import { prisma } from "~/data/database/database.server";
import { TransactionCreateRequestInterface } from "~/data/transaction/transaction-request-interfaces";

describe("Transaction CRUD Operations - Multiple Incomes and Expenses using Company Accounts", () => {
  let transactionIdsIncome: string[] = [];
  let transactionIdsExpense: string[] = [];
  let accountFromCompany1Id: string;
  let accountFromCompany2Id: string;
  let company1Id: string;
  let company2Id: string;
  let transactionCreatedId: string | undefined;

  const getUser = async () => prisma.user.findFirstOrThrow();

  const createTransaction = async (
    transactionData: TransactionCreateRequestInterface,
    user: User
  ) => {
    const transaction = await create(transactionData, user);
    return transaction.data?.id;
  };

  const checkAccountBalance = async (
    accountId: string,
    expectedBalance: number
  ) => {
    const updatedAccount = await prisma.account.findUnique({
      where: { id: accountId },
    });
    expect(updatedAccount?.balance).toBe(expectedBalance);
  };

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
    await prisma.company.deleteMany();
    await prisma.user.deleteMany();
  });

  it("should create incomes and expenses transactions and check the balance", async () => {
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
        balance: 0,
        name: "Account Test Company 2",
        is_personal: false,
        user_id: user.id,
        company_id: company1.id,
      },
    });

    accountFromCompany1Id = accountFromCompany1.id;
    accountFromCompany2Id = accountFromCompany2.id;
    company1Id = company1.id;
    company2Id = company2.id;

    transactionCreatedId = await createTransaction(
      {
        amount: 100,
        is_income: true,
        account: accountFromCompany1Id,
        name: "Income 1",
        date: new Date().toISOString(),
        company: company1.id,
        expense: undefined,
        income: undefined,
        is_personal: false,
        classifications: [],
        description: "",
      },
      user
    );

    if (transactionCreatedId) {
      transactionIdsIncome.push(transactionCreatedId);
    }

    await checkAccountBalance(accountFromCompany1Id, 300);

    transactionCreatedId = await createTransaction(
      {
        amount: 150,
        is_income: true,
        account: accountFromCompany2Id,
        name: "Income 2",
        date: new Date().toISOString(),
        company: company2Id,
        expense: undefined,
        income: undefined,
        is_personal: false,
        classifications: [],
        description: "",
      },
      user
    );

    if (transactionCreatedId) {
      transactionIdsIncome.push(transactionCreatedId);
    }

    await checkAccountBalance(accountFromCompany2Id, 150);

    transactionCreatedId = await createTransaction(
      {
        amount: 50,
        is_income: false,
        account: accountFromCompany1Id,
        name: "Expense 1",
        date: new Date().toISOString(),
        company: company1Id,
        expense: undefined,
        income: undefined,
        is_personal: false,
        classifications: [],
        description: "",
      },
      user
    );

    if (transactionCreatedId) {
      transactionIdsExpense.push(transactionCreatedId);
    }

    await checkAccountBalance(accountFromCompany1Id, 250);

    transactionCreatedId = await createTransaction(
      {
        amount: 600,
        is_income: false,
        account: accountFromCompany2Id,
        name: "Expense 2",
        date: new Date().toISOString(),
        company: company2Id,
        expense: undefined,
        income: undefined,
        is_personal: false,
        classifications: [],
        description: "",
      },
      user
    );

    if (transactionCreatedId) {
      transactionIdsExpense.push(transactionCreatedId);
    }

    await checkAccountBalance(accountFromCompany2Id, -450);
  });

  it("should update all income transactions and check the balance", async () => {
    const user = await getUser();

    await update(transactionIdsIncome[0], user, {
      name: "Updated Income 1",
      amount: 50,
      date: new Date().toISOString(),
      is_income: true,
      account: accountFromCompany1Id,
      company: company1Id,
      expense: undefined,
      income: undefined,
      classifications: [],
      description: "",
      is_personal: false,
    });
    await checkAccountBalance(accountFromCompany1Id, 200);

    await update(transactionIdsIncome[1], user, {
      name: "Updated Income 2",
      amount: 100,
      date: new Date().toISOString(),
      is_income: true,
      account: accountFromCompany2Id,
      company: company2Id,
      expense: undefined,
      income: undefined,
      classifications: [],
      description: "",
      is_personal: false,
    });
    await checkAccountBalance(accountFromCompany2Id, -500);
  });

  it("should update all expense transactions and check the balance", async () => {
    const user = await getUser();

    await update(transactionIdsExpense[0], user, {
      name: "Updated Expense 1",
      amount: 25,
      date: new Date().toISOString(),
      is_income: false,
      account: accountFromCompany1Id,
      company: company1Id,
      expense: undefined,
      income: undefined,
      classifications: [],
      description: "",
      is_personal: false,
    });
    await checkAccountBalance(accountFromCompany1Id, 225);

    await update(transactionIdsExpense[1], user, {
      name: "Updated Expense 2",
      amount: 100,
      date: new Date().toISOString(),
      is_income: false,
      account: accountFromCompany2Id,
      company: company2Id,
      expense: undefined,
      income: undefined,
      classifications: [],
      description: "",
      is_personal: false,
    });
    await checkAccountBalance(accountFromCompany2Id, 0);
  });

  it("should remove each income transaction one by one and update the balance", async () => {
    const user = await getUser();

    await remove(transactionIdsIncome[0], user);
    await checkAccountBalance(accountFromCompany1Id, 175);

    await remove(transactionIdsIncome[1], user);
    await checkAccountBalance(accountFromCompany2Id, -100);
  });

  it("should remove each expense transaction one by one and update the balance", async () => {
    const user = await getUser();

    await remove(transactionIdsExpense[0], user);
    await checkAccountBalance(accountFromCompany1Id, 200);

    await remove(transactionIdsExpense[1], user);
    await checkAccountBalance(accountFromCompany2Id, 0);
  });
});
