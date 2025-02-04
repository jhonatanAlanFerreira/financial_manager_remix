import typeDefs from "~/data/graphql/schema/query/query.graphql";
import { listChartTransactionData } from "~/data/graphql/schema/resolvers/dashboard/list-chart-transaction-data-resolver";
import { SchemaDefInterface } from "~/data/graphql/schema/graphql-globals";
import { listTransactions } from "~/data/graphql/schema/resolvers/transaction/list-transactions-resolver";
import { listClassifications } from "~/data/graphql/schema/resolvers/classification/list-classification-resolver";

export const Query = {
  chartTransactionData: listChartTransactionData,
  transactions: listTransactions,
  classifications: listClassifications,
};

const schemaDef: SchemaDefInterface = {
  typeDefs,
  resolvers: {
    Query,
  },
};

export default schemaDef;
