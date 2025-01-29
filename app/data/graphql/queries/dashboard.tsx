export const CHART_TRANSACTION_DATA_QUERY = `
      query($type: TransactionType = ALL, $companyId: String = null) {
        chartTransactionData(type: $type, companyId: $companyId) {
          availableYears,
          data {
            year,
            income,
            expense,
            net,
            months {
              month,
              income,
              expense,
              net
            }
          }
        }
      }
`;
