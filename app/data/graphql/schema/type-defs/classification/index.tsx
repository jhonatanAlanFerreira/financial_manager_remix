import typeDefs from "~/data/graphql/schema/type-defs/classification/classification.graphql";
import { SchemaDefInterface } from "~/data/graphql/schema/graphql-globals";
import { listTransactions } from "~/data/graphql/schema/resolvers/transaction/list-transactions-resolver";

const Classification = { transactions: listTransactions };

const schemaDef: SchemaDefInterface = {
  typeDefs,
  resolvers: {
    Classification,
  },
};

export default schemaDef;
