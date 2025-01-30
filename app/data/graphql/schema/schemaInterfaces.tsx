import { IResolvers } from "@graphql-tools/utils";

export interface SchemaDefInterface {
  typeDefs: string;
  resolvers: IResolvers<any, any>;
}
