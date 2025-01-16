import typeDefs from "~/data/graphql/schema/type-defs/parentTest/parent-test.graphql";
import { test } from "~/data/graphql/schema/resolvers/parent";

export const ParentTest = {
  test,
};

const schemaDef = {
  typeDefs,
  resolvers: {
    ParentTest,
  },
};

export default schemaDef;
