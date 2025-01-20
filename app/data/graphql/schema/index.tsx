import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import models from "~/data/graphql/schema/models";

const generateSchema = (schemaParts: any) => {
  return makeExecutableSchema({
    typeDefs: schemaParts.map((part: any) => part.typeDefs),
    resolvers: [...schemaParts.map((part: any) => part.resolvers)],
  });
};

const yoga = createYoga({
  schema: generateSchema(models),
  context: ({ request }) => ({
    request,
  }),
  graphiql: {
    disableTabs: true,
    defaultQuery: `
{
  transactions{
    name,
    date
  }
}
    `,
  },
  graphqlEndpoint: "/api/graphql",
});

export const graphqlHandler = yoga.handle;
