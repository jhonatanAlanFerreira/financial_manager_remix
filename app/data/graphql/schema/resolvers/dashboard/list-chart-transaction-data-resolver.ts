import { TransactionsChartType } from "~/components/page-components/dashboard/dashboard-interfaces";
import { requireUserSession } from "~/data/auth/auth.server";
import { prisma } from "~/data/database/database.server";
import { MONTH_NAMES } from "~/utils/utilities";

interface MongoTransactionResult {
  _id: {
    year: number;
    month: number;
    is_income: boolean;
    classification_id?: { $oid: string };
  };
  total_amount: number;
}

interface ClassificationBreakdown {
  name: string;
  amount: number;
}

interface YearAccumulator {
  months: Map<
    number,
    {
      income: number;
      expense: number;
      net: number;
      expenses: ClassificationBreakdown[];
      incomes: ClassificationBreakdown[];
    }
  >;
  income: number;
  expense: number;
  net: number;
}

async function getClassificationMap(
  userId: string,
): Promise<Map<string, string>> {
  const classifications = await prisma.transactionClassification.findMany({
    where: { user_id: userId },
  });

  const classificationMap = new Map<string, string>();
  classifications.forEach((c) => classificationMap.set(c.id, c.name));
  return classificationMap;
}

function buildMatchCondition(
  userId: string,
  args: {
    type: TransactionsChartType;
    companyId?: string;
    classificationId?: string;
  },
) {
  const matchCondition: any = { user_id: { $oid: userId } };

  if (args.type === "PERSONAL_ONLY") {
    matchCondition.is_personal = true;
  } else if (args.type === "COMPANY_ONLY") {
    matchCondition.is_personal = false;
    if (args.companyId) matchCondition.company_id = { $oid: args.companyId };
  } else if (args.type === "ALL" && args.companyId) {
    matchCondition.$or = [
      { is_personal: true },
      { is_personal: false, company_id: { $oid: args.companyId } },
    ];
  }

  if (args.classificationId) {
    matchCondition.transaction_classification_ids = {
      $in: [{ $oid: args.classificationId }],
    };
  }

  return matchCondition;
}

async function fetchAggregatedTransactions(
  matchCondition: any,
): Promise<MongoTransactionResult[]> {
  return (await prisma.transaction.aggregateRaw({
    pipeline: [
      { $match: matchCondition },
      {
        $addFields: {
          year: { $year: { $dateFromString: { dateString: "$date" } } },
          month: { $month: { $dateFromString: { dateString: "$date" } } },
        },
      },
      {
        $unwind: {
          path: "$transaction_classification_ids",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            is_income: "$is_income",
            classification_id: "$transaction_classification_ids",
          },
          total_amount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ],
  })) as unknown as MongoTransactionResult[];
}

function processTransactionsByYear(
  transactions: MongoTransactionResult[],
  classificationMap: Map<string, string>,
): Map<number, YearAccumulator> {
  const yearData = new Map<number, YearAccumulator>();

  for (const transaction of transactions) {
    const { _id, total_amount } = transaction;
    const { year, month, is_income, classification_id } = _id;

    const classIdStr = classification_id?.$oid;
    const className = classIdStr
      ? classificationMap.get(classIdStr) || "Unclassified"
      : "Unclassified";

    if (!yearData.has(year)) {
      yearData.set(year, { months: new Map(), income: 0, expense: 0, net: 0 });
    }

    const yearEntry = yearData.get(year)!;
    if (!yearEntry.months.has(month)) {
      yearEntry.months.set(month, {
        income: 0,
        expense: 0,
        net: 0,
        expenses: [],
        incomes: [],
      });
    }

    const monthEntry = yearEntry.months.get(month)!;

    const breakdownItem: ClassificationBreakdown = {
      name: className,
      amount: total_amount,
    };

    if (is_income) {
      monthEntry.income += total_amount;
      yearEntry.income += total_amount;
      monthEntry.incomes.push(breakdownItem);
    } else {
      monthEntry.expense += total_amount;
      yearEntry.expense += total_amount;
      monthEntry.expenses.push(breakdownItem);
    }

    monthEntry.net = monthEntry.income - monthEntry.expense;
    yearEntry.net = yearEntry.income - yearEntry.expense;
  }

  return yearData;
}

function formatChartPayload(yearData: Map<number, YearAccumulator>) {
  const chartData = Array.from(yearData.entries()).map(
    ([year, { months, income, expense, net }]) => ({
      year,
      income,
      expense,
      net,
      months: Array.from({ length: 12 }, (_, i) => {
        const monthIndex = i + 1;
        const monthData = months.get(monthIndex) || {
          income: 0,
          expense: 0,
          net: 0,
          expenses: [],
          incomes: [],
        };

        return {
          month: MONTH_NAMES[monthIndex - 1],
          income: monthData.income,
          expense: monthData.expense,
          net: monthData.net,
          monthlyExpenses: monthData.expenses,
          monthlyIncomes: monthData.incomes,
        };
      }),
    }),
  );

  return {
    availableYears: Array.from(yearData.keys()),
    data: chartData,
  };
}

export const listChartTransactionData = async (
  parent: any,
  args: {
    companyId?: string;
    classificationId?: string;
    type: TransactionsChartType;
  },
  context: { request: Request },
) => {
  const user = await requireUserSession(context.request);

  const classificationMap = await getClassificationMap(user.id);
  const matchCondition = buildMatchCondition(user.id, args);
  const transactions = await fetchAggregatedTransactions(matchCondition);

  const yearData = processTransactionsByYear(transactions, classificationMap);

  return formatChartPayload(yearData);
};
