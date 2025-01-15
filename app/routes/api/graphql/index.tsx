import { graphqlHandler } from "~/data/graphql/server";

export const loader = async ({ request }: { request: Request }) => {
  return graphqlHandler(request);
};

export const action = async ({ request }: { request: Request }) => {
  return graphqlHandler(request);
};
