export const CHART_TRANSACTION_DATA_QUERY = `
query($type: TransactionType = ALL, $companyId: String = null, $classificationId: String = null, $classificationType: PersonalOrCompanyEnum) {
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
  classifications(company_id: $companyId, is_personal_or_company: $classificationType){
    id,
    name,
    is_income
  }
}
`;
