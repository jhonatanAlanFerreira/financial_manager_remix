import Query from "~/data/graphql/schema/query";
import Dashboard from "~/data/graphql/schema/type-defs/dashboard";
import Transaction from "~/data/graphql/schema/type-defs/transaction";
import { SchemaDefInterface } from "~/data/graphql/schema/schemaInterfaces";

const models: SchemaDefInterface[] = [Query, Dashboard, Transaction];

export default models;
