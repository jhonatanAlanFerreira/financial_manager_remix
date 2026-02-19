import typeDefs from "~/data/graphql/schema/type-defs/classification/classification.graphql";
import { SchemaDefInterface } from "~/data/graphql/schema/graphql-globals";
import { listTransactionsByClassification } from "~/data/graphql/schema/resolvers/transaction/list-transactions-resolver";

const Classification = { transactions: listTransactionsByClassification };

const schemaDef: SchemaDefInterface = {
  typeDefs,
  resolvers: {
    Classification,
  },
};

export default schemaDef;
