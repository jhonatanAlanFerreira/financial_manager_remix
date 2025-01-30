import Query from "~/data/graphql/schema/query";
import Transaction from "~/data/graphql/schema/type-defs/dashboard";
import { SchemaDefInterface } from "~/data/graphql/schema/schemaInterfaces";

const models: SchemaDefInterface[] = [Query, Transaction];

export default models;
