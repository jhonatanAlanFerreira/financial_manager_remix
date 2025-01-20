import typeDefs from "~/data/graphql/schema/query/query.graphql";
import { listTransactions } from "~/data/graphql/schema/resolvers/transaction";

export const Query = {
  transactions: listTransactions,
};

const schemaDef = {
  typeDefs,
  resolvers: {
    Query,
  },
};

export default schemaDef;
