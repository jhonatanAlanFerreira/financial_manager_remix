import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import models from "~/data/graphql/schema/models";
import { CHART_TRANSACTION_DATA_QUERY } from "~/data/graphql/queries/dashboard";
import { SchemaDefInterface } from "~/data/graphql/schema/graphql-globals";
import { requireUserSession } from "~/data/auth/auth.server";
import { createLoaders } from "~/data/graphql/loaders";
import { LoadersInterface } from "~/data/graphql/loaders/loaders-interface";

const generateSchema = (schemaParts: SchemaDefInterface[]) => {
  return makeExecutableSchema({
    typeDefs: schemaParts.map((part) => part.typeDefs),
    resolvers: [...schemaParts.map((part) => part.resolvers)],
  });
};

const yoga = createYoga({
  schema: generateSchema(models),
  context: async ({
    request,
  }): Promise<{ request: Request; loaders: LoadersInterface }> => {
    const user = await requireUserSession(request);

    return {
      request,
      loaders: createLoaders(user.id),
    };
  },
  graphiql: {
    disableTabs: true,
    defaultQuery: CHART_TRANSACTION_DATA_QUERY,
  },
  graphqlEndpoint: "/api/graphql",
});

export const graphqlHandler = yoga.handle;
