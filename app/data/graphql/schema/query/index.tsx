import typeDefs from "~/data/graphql/schema/query/query.graphql";

export const Query = {
  parent: (parent: any, args: any) => [],
};

const schemaDef = {
  typeDefs,
  resolvers: {
    Query,
  },
};

export default schemaDef;
