export const CHART_TRANSACTION_DATA_QUERY = `
    query {
        chartTransactionData{
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
