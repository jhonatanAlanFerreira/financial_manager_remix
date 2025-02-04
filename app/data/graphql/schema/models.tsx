import Query from "~/data/graphql/schema/query";
import Dashboard from "~/data/graphql/schema/type-defs/dashboard";
import Transaction from "~/data/graphql/schema/type-defs/transaction";
import Classification from "~/data/graphql/schema/type-defs/classification";
import Enum from "~/data/graphql/schema/type-defs/enum";
import { SchemaDefInterface } from "~/data/graphql/schema/graphql-globals";

const models: SchemaDefInterface[] = [
  Query,
  Dashboard,
  Transaction,
  Classification,
  Enum,
];

export default models;
