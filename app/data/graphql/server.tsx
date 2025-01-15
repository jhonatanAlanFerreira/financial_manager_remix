import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLSchema } from "graphql";

const typeDefs = `
  type Query {
    test: String
  }
`;

const resolvers = {
  Query: {
    test: () => "Working!",
  },
};

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const yoga = createYoga({
  schema,
  context: ({ request }) => ({
    request,
  }),
  graphiql: {
    disableTabs: true,
    defaultQuery: `
      query {
        test
      }
    `,
  },
  graphqlEndpoint: "/api/graphql",
});

export const graphqlHandler = yoga.handle;
