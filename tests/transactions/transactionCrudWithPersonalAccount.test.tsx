import { update, create, remove } from "~/data/transaction.server";
import { prisma } from "~/data/database.server";
import TransactionCreateRequest from "~/interfaces/bodyRequests/transaction/TransactionCreateRequest";
import { User } from "@prisma/client";

describe("Transaction CRUD Operations - Multiple Incomes and Expenses using Personal Account", () => {
  let transactionIdsIncome: string[] = [];
  let transactionIdsExpense: string[] = [];
  let accountId: string;

  const getUser = async () => prisma.user.findFirstOrThrow();

  const createTransaction = async (
    transactionData: TransactionCreateRequest,
    user: User
  ) => {
    const transaction = await create(transactionData, user);
    return transaction.data.id;
  };

  const checkAccountBalance = async (expectedBalance: number) => {
    const updatedAccount = await prisma.account.findUnique({
      where: { id: accountId },
    });
    expect(updatedAccount?.balance).toBe(expectedBalance);
  };

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.account.deleteMany();
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

    const account = await prisma.account.create({
      data: {
        balance: 500,
        name: "Account Test",
        is_personal_account: true,
        user_id: user.id,
      },
    });
    accountId = account.id;

    transactionIdsIncome.push(
      await createTransaction(
        {
          amount: 100,
          is_income: true,
          account: accountId,
          name: "Income 1",
          transaction_date: new Date().toISOString(),
          company: null,
          expense: null,
          income: null,
          is_personal_transaction: true,
          classifications: [],
        },
        user
      )
    );
    await checkAccountBalance(600);

    transactionIdsIncome.push(
      await createTransaction(
        {
          amount: 150,
          is_income: true,
          account: accountId,
          name: "Income 2",
          transaction_date: new Date().toISOString(),
          company: null,
          expense: null,
          income: null,
          is_personal_transaction: true,
          classifications: [],
        },
        user
      )
    );
    await checkAccountBalance(750);

    transactionIdsIncome.push(
      await createTransaction(
        {
          amount: 200,
          is_income: true,
          account: accountId,
          name: "Income 3",
          transaction_date: new Date().toISOString(),
          company: null,
          expense: null,
          income: null,
          is_personal_transaction: true,
          classifications: [],
        },
        user
      )
    );
    await checkAccountBalance(950);

    transactionIdsExpense.push(
      await createTransaction(
        {
          amount: 50,
          is_income: false,
          account: accountId,
          name: "Expense 1",
          transaction_date: new Date().toISOString(),
          company: null,
          expense: null,
          income: null,
          is_personal_transaction: true,
          classifications: [],
        },
        user
      )
    );
    await checkAccountBalance(900);

    transactionIdsExpense.push(
      await createTransaction(
        {
          amount: 100,
          is_income: false,
          account: accountId,
          name: "Expense 2",
          transaction_date: new Date().toISOString(),
          company: null,
          expense: null,
          income: null,
          is_personal_transaction: true,
          classifications: [],
        },
        user
      )
    );
    await checkAccountBalance(800);

    transactionIdsExpense.push(
      await createTransaction(
        {
          amount: 150,
          is_income: false,
          account: accountId,
          name: "Expense 3",
          transaction_date: new Date().toISOString(),
          company: null,
          expense: null,
          income: null,
          is_personal_transaction: true,
          classifications: [],
        },
        user
      )
    );
    await checkAccountBalance(650);
  });

  it("should update all income transactions and check the balance", async () => {
    const user = await getUser();

    await update(transactionIdsIncome[0], user, {
      name: "Updated Income 1",
      amount: 50,
      transaction_date: new Date().toISOString(),
      is_income: true,
      account: accountId,
      company: null,
      expense: null,
      income: null,
      classifications: [],
      is_personal_transaction: true,
    });
    await checkAccountBalance(600);

    await update(transactionIdsIncome[1], user, {
      name: "Updated Income 2",
      amount: 100,
      transaction_date: new Date().toISOString(),
      is_income: true,
      account: accountId,
      company: null,
      expense: null,
      income: null,
      classifications: [],
      is_personal_transaction: true,
    });
    await checkAccountBalance(550);

    await update(transactionIdsIncome[2], user, {
      name: "Updated Income 3",
      amount: 250,
      transaction_date: new Date().toISOString(),
      is_income: true,
      account: accountId,
      company: null,
      expense: null,
      income: null,
      classifications: [],
      is_personal_transaction: true,
    });
    await checkAccountBalance(600);
  });

  it("should update all expense transactions and check the balance", async () => {
    const user = await getUser();

    await update(transactionIdsExpense[0], user, {
      name: "Updated Expense 1",
      amount: 25,
      transaction_date: new Date().toISOString(),
      is_income: false,
      account: accountId,
      company: null,
      expense: null,
      income: null,
      classifications: [],
      is_personal_transaction: true,
    });
    await checkAccountBalance(625);

    await update(transactionIdsExpense[1], user, {
      name: "Updated Expense 2",
      amount: 75,
      transaction_date: new Date().toISOString(),
      is_income: false,
      account: accountId,
      company: null,
      expense: null,
      income: null,
      classifications: [],
      is_personal_transaction: true,
    });
    await checkAccountBalance(650);

    await update(transactionIdsExpense[2], user, {
      name: "Updated Expense 3",
      amount: 200,
      transaction_date: new Date().toISOString(),
      is_income: false,
      account: accountId,
      company: null,
      expense: null,
      income: null,
      classifications: [],
      is_personal_transaction: true,
    });
    await checkAccountBalance(600);
  });

  it("should remove each income transaction one by one and update the balance", async () => {
    const user = await getUser();

    await remove(transactionIdsIncome[0], user);
    await checkAccountBalance(550);

    await remove(transactionIdsIncome[1], user);
    await checkAccountBalance(450);

    await remove(transactionIdsIncome[2], user);
    await checkAccountBalance(200);
  });

  it("should remove each expense transaction one by one and update the balance", async () => {
    const user = await getUser();

    await remove(transactionIdsExpense[0], user);
    await checkAccountBalance(225);

    await remove(transactionIdsExpense[1], user);
    await checkAccountBalance(300);

    await remove(transactionIdsExpense[2], user);
    await checkAccountBalance(500);
  });
});
