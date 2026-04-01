import { listTransactionsByClassificationsLoader } from "~/data/graphql/loaders/transaction-loaders";

export interface LoadersInterface {
  transaction: {
    listTransactionsByClassificationsLoader: ReturnType<
      typeof listTransactionsByClassificationsLoader
    >;
  };
}
