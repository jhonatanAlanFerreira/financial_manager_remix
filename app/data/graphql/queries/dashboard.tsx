export const CHART_TRANSACTION_DATA_QUERY = `
query($type: TransactionType = ALL, $companyId: String = null, $classificationId: String = null) {
  chartTransactionData(type: $type, companyId: $companyId, classificationId: $classificationId) {
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
  },
  classifications{
    id,
    name
  }
}
`;
