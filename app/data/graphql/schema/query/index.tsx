import typeDefs from "~/data/graphql/schema/query/query.graphql";
import { listParents } from "~/data/graphql/schema/resolvers/parent";
import { listTransactions } from "~/data/graphql/schema/resolvers/transaction";

export const Query = {
  parent: listParents,
  transactions: listTransactions,
};

const schemaDef = {
  typeDefs,
  resolvers: {
    Query,
  },
};

export default schemaDef;
