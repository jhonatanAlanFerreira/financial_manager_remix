import typeDefs from "~/data/graphql/schema/query/query.graphql";
import { listChartTransactionData } from "~/data/graphql/schema/resolvers/dashboard/list-chart-transaction-data-esolvers";

export const Query = {
  chartTransactionData: listChartTransactionData,
};

const schemaDef = {
  typeDefs,
  resolvers: {
    Query,
  },
};

export default schemaDef;
