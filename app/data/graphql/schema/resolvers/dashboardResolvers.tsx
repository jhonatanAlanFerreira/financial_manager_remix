import { requireUserSession } from "~/data/auth/auth.server";
import { prisma } from "~/data/database/database.server";

export const listChartTransactionData = async (
  parent: any,
  args: any,
  context: { request: Request }
) => {
  const user = await requireUserSession(context.request);

  const transactions = (await prisma.transaction.aggregateRaw({
    pipeline: [
      {
        $match: {
          user_id: { $oid: user.id },
          is_personal: true,
        },
      },
      {
        $addFields: {
          year: { $year: { $dateFromString: { dateString: "$date" } } },
        },
      },
      {
        $group: {
          _id: { year: "$year", is_income: "$is_income" },
          total_amount: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.year": 1 },
      },
    ],
  })) as unknown as Array<{
    _id: { year: number; is_income: boolean };
    total_amount: number;
  }>;

  const yearData = new Map<
    number,
    { income: number; expense: number; net: number }
  >();

  for (const transaction of transactions) {
    const { _id, total_amount } = transaction;
    const { year, is_income } = _id;

    if (!yearData.has(year)) {
      yearData.set(year, { income: 0, expense: 0, net: 0 });
    }

    const yearEntry = yearData.get(year)!;
    if (is_income) {
      yearEntry.income += total_amount;
    } else {
      yearEntry.expense += total_amount;
    }
    yearEntry.net = yearEntry.income - yearEntry.expense;
  }

  const chartData = Array.from(yearData.entries()).map(
    ([year, { income, expense, net }]) => ({
      year,
      income,
      expense,
      net,
    })
  );

  return chartData;
};
