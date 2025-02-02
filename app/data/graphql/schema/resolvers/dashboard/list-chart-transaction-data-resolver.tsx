import { TransactionsChartType } from "~/components/page-components/dashboard/dashboard-interfaces";
import { requireUserSession } from "~/data/auth/auth.server";
import { prisma } from "~/data/database/database.server";
import { MONTH_NAMES } from "~/utils/utilities";

export const listChartTransactionData = async (
  parent: any,
  args: { companyId?: string; type: TransactionsChartType },
  context: { request: Request }
) => {
  const user = await requireUserSession(context.request);

  const matchCondition: any = { user_id: { $oid: user.id } };

  if (args.type === "PERSONAL_ONLY") {
    matchCondition.is_personal = true;
  } else if (args.type === "COMPANY_ONLY") {
    matchCondition.is_personal = false;
    if (args.companyId) {
      matchCondition.company_id = { $oid: args.companyId };
    }
  } else if (args.type === "ALL" && args.companyId) {
    matchCondition.$or = [
      { is_personal: true },
      { is_personal: false, company_id: { $oid: args.companyId } },
    ];
  }

  const transactions = (await prisma.transaction.aggregateRaw({
    pipeline: [
      { $match: matchCondition },
      {
        $addFields: {
          year: { $year: { $dateFromString: { dateString: "$date" } } },
          month: { $month: { $dateFromString: { dateString: "$date" } } },
        },
      },
      {
        $group: {
          _id: {
            year: "$year",
            month: "$month",
            is_income: "$is_income",
          },
          total_amount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ],
  })) as unknown as Array<{
    _id: { year: number; month: number; is_income: boolean };
    total_amount: number;
  }>;

  const yearData = new Map<
    number,
    {
      months: Map<number, { income: number; expense: number; net: number }>;
      income: number;
      expense: number;
      net: number;
    }
  >();

  for (const transaction of transactions) {
    const { _id, total_amount } = transaction;
    const { year, month, is_income } = _id;

    if (!yearData.has(year)) {
      yearData.set(year, { months: new Map(), income: 0, expense: 0, net: 0 });
    }

    const yearEntry = yearData.get(year)!;
    if (!yearEntry.months.has(month)) {
      yearEntry.months.set(month, { income: 0, expense: 0, net: 0 });
    }

    const monthEntry = yearEntry.months.get(month)!;
    if (is_income) {
      monthEntry.income += total_amount;
      yearEntry.income += total_amount;
    } else {
      monthEntry.expense += total_amount;
      yearEntry.expense += total_amount;
    }
    monthEntry.net = monthEntry.income - monthEntry.expense;
    yearEntry.net = yearEntry.income - yearEntry.expense;
  }

  const availableYears = Array.from(yearData.keys());
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
        };
        return {
          month: MONTH_NAMES[monthIndex - 1],
          income: monthData.income,
          expense: monthData.expense,
          net: monthData.net,
        };
      }),
    })
  );

  return {
    availableYears,
    data: chartData,
  };
};
