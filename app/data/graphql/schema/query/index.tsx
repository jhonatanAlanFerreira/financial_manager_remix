import typeDefs from "~/data/graphql/schema/query/query.graphql";
import { listChartTransactionData } from "~/data/graphql/schema/resolvers/dashboard/list-chart-transaction-data-esolvers";
import { SchemaDefInterface } from "~/data/graphql/schema/schemaInterfaces";

export const Query = {
  chartTransactionData: listChartTransactionData,
};

const schemaDef: SchemaDefInterface = {
  typeDefs,
  resolvers: {
    Query,
  },
};

export default schemaDef;
