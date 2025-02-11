import typeDefs from "~/data/graphql/schema/type-defs/classification/classification.graphql";
import { SchemaDefInterface } from "~/data/graphql/schema/graphql-globals";
import { Transaction, TransactionClassification } from "@prisma/client";
import { prisma } from "~/data/database/database.server";
import DataLoader from "dataloader";

const transactionByClassificationBatch = async (
  classifications: readonly TransactionClassification[]
): Promise<Transaction[][]> => {
  console.log("TRANSACTION LOADER");

  const classificationIds = classifications.map((c) => c.id);

  const transactions = await prisma.transaction.findMany({
    where: {
      transaction_classification_ids: {
        hasSome: classificationIds,
      },
    },
  });

  const transactionMap: Record<string, Transaction[]> = {};
  classificationIds.forEach((id) => {
    transactionMap[id] = [];
  });

  transactions.forEach((tx) => {
    tx.transaction_classification_ids.forEach((cid) => {
      if (transactionMap[cid]) {
        transactionMap[cid].push(tx);
      }
    });
  });

  return classificationIds.map((id) => transactionMap[id]);
};

const transactionLoader = new DataLoader(
  (classifications: readonly TransactionClassification[]) =>
    transactionByClassificationBatch(classifications)
);

const Classification = {
  transactions: (classification: TransactionClassification) =>
    transactionLoader.load(classification),
};

const schemaDef: SchemaDefInterface = {
  typeDefs,
  resolvers: {
    Classification,
  },
};

export default schemaDef;
