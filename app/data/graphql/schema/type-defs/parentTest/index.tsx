import typeDefs from "~/data/graphql/schema/type-defs/parentTest/parent-test.graphql";

export const ParentTest = {
  test: (parent: any, args: any) => "Works!",
};

const schemaDef = {
  typeDefs,
  resolvers: {
    ParentTest,
  },
};

export default schemaDef;
