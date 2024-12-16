import {
  Account,
  Company,
  Expense,
  Income,
  TransactionClassification,
} from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { InputSelect } from "~/components/inputs/input-select/input-select";
import { InputText } from "~/components/inputs/input-text/input-text";
import { Loader } from "~/components/loader/loader";
import { TransactionFiltersPropsInterface } from "~/components/page-components/transaction/transaction-interfaces";
import { AccountLoaderParamsInterface } from "~/data/account/account-query-params-interfaces";
import { ClassificationLoaderParamsInterface } from "~/data/classification/classification-query-params-interfaces";
import { ExpenseLoaderParamsInterface } from "~/data/expense/expense-query-params-interfaces";
import { fetchClassifications } from "~/data/frontend-services/classification-service";
import {
  fetchAccounts,
  fetchCompanies,
} from "~/data/frontend-services/company-account-service";
import { fetchExpenses } from "~/data/frontend-services/expense-service";
import { fetchIncomes } from "~/data/frontend-services/income-service";
import { IncomeLoaderParamsInterface } from "~/data/income/income-query-params-interfaces";
import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { useDebouncedCallback } from "~/utils/utilities";

export function TransactionFilters({
  formik,
  onSubmit,
}: TransactionFiltersPropsInterface) {
  const hasRun = useRef(false);
  const [shouldFilter, setShouldFilter] = useState(false);

  const [loadingStates, setLoadingStates] = useState({
    isAccountLoading: false,
    isCompanyLoading: false,
    isExpenseLoading: false,
    isClassificationLoading: false,
    isIncomeLoading: false,
  });

  const [accounts, setAccounts] = useState<ServerResponseInterface<Account[]>>(
    {}
  );
  const [companies, setCompanies] = useState<
    ServerResponseInterface<Company[]>
  >({});
  const [expenses, setExpenses] = useState<ServerResponseInterface<Expense[]>>(
    {}
  );
  const [classifications, setClassifications] = useState<
    ServerResponseInterface<TransactionClassification[]>
  >({});
  const [incomes, setIncomes] = useState<ServerResponseInterface<Income[]>>({});

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;
  const getSelectExpenseOptionValue = (option: Expense) => option.id;
  const getSelectExpenseOptionLabel = (option: Expense) => option.name;
  const getSelectIncomeOptionValue = (option: Income) => option.id;
  const getSelectIncomeOptionLabel = (option: Income) => option.name;
  const getSelectAccountOptionValue = (option: Account) => option.id;
  const getSelectAccountOptionLabel = (option: Account) => option.name;
  const getSelectClassificationOptionValue = (
    option: TransactionClassification
  ) => option.id;
  const getSelectClassificationOptionLabel = (
    option: TransactionClassification
  ) => option.name;

  const loadData = () => {
    setLoadingStates({
      isAccountLoading: true,
      isCompanyLoading: true,
      isExpenseLoading: true,
      isClassificationLoading: true,
      isIncomeLoading: true,
    });

    loadAccounts();
    loadCompanies();
    loadExpenses();
    loadClassifications();
    loadIncomes();
  };

  const loadingData = () => Object.values(loadingStates).some((state) => state);

  useEffect(() => {
    if (!hasRun.current) {
      loadData();
      hasRun.current = true;
    }
  }, []);

  useEffect(() => {
    if (shouldFilter) {
      setShouldFilter(false);
      formik.setFieldValue("company", null);
      formik.setFieldValue("expense", null);
      formik.setFieldValue("income", null);
      formik.setFieldValue("has_classification", null);
      formik.setFieldValue("account", null);
      loadData();
    }
  }, [formik.values.is_personal_or_company]);

  useEffect(() => {
    if (shouldFilter) {
      setShouldFilter(false);
      formik.setFieldValue("expense", null);
      formik.setFieldValue("income", null);
      formik.setFieldValue("has_classification", null);
      formik.setFieldValue("account", null);
      loadData();
    }
  }, [formik.values.company]);

  useEffect(() => {
    if (shouldFilter) {
      setShouldFilter(false);

      if (formik.values.is_income_or_expense == "income") {
        formik.setFieldValue("expense", null);
      }

      if (formik.values.is_income_or_expense == "expense") {
        formik.setFieldValue("income", null);
      }

      formik.setFieldValue("company", null);
      formik.setFieldValue("expense", null);
      formik.setFieldValue("income", null);
      loadData();
    }
  }, [formik.values.is_income_or_expense]);

  const onCompanyFilterChange = (company: Company) => {
    setShouldFilter(true);
    formik.setFieldValue("company", company);
  };

  const onExpenseFilterChange = (expense: Expense) => {
    formik.setFieldValue("expense", expense);
  };

  const onIncomeFilterChange = (income: Income) => {
    formik.setFieldValue("income", income);
  };

  const onClassificationChange = (
    classification: TransactionClassification
  ) => {
    formik.setFieldValue("has_classification", classification);
  };

  const resetForm = () => {
    formik.resetForm();
    formik.setFieldValue("company", null);
    formik.setFieldValue("expense", null);
    formik.setFieldValue("income", null);
    formik.setFieldValue("has_classification", null);
    formik.setFieldValue("account", null);
    formik.setFieldValue("date_after", "");
    formik.setFieldValue("date_before", "");
  };

  const isIncomeOrExpenseChange = (e: any) => {
    formik.setFieldValue("is_income_or_expense", e.currentTarget.value);
  };

  const isPersonalOrCompanyChange = (e: any) => {
    setShouldFilter(true);
    formik.setFieldValue("is_personal_or_company", e.currentTarget.value);
  };

  const defaultPaginationQuery = () => {
    let paginationParamsInterface: Record<
      keyof PaginationParamsInterface,
      string
    > = {
      page: "1",
      pageSize: "all",
    };

    return new URLSearchParams(paginationParamsInterface).toString();
  };

  const filterAccountsParams = () => {
    const accountLoaderParamsInterface: Partial<
      Record<keyof AccountLoaderParamsInterface, string>
    > = {
      company: formik.values.company?.id || "",
      is_personal_or_company: formik.values.is_personal_or_company,
    };

    return new URLSearchParams(accountLoaderParamsInterface).toString();
  };

  const filterExpensesParams = () => {
    const expenseLoaderParamsInterface: Partial<
      Record<keyof ExpenseLoaderParamsInterface, string>
    > = {
      has_company: formik.values.company?.id || "",
      is_personal_or_company: formik.values.is_personal_or_company,
    };

    return new URLSearchParams(expenseLoaderParamsInterface).toString();
  };

  const filterClassificationsParams = () => {
    const classificationLoaderParamsInterface: Partial<
      Record<keyof ClassificationLoaderParamsInterface, string>
    > = {
      has_company: formik.values.company?.id || "",
      is_income_or_expense: formik.values.is_income_or_expense,
      is_personal_or_company: formik.values.is_personal_or_company,
    };

    return new URLSearchParams(classificationLoaderParamsInterface).toString();
  };

  const filterIncomesParams = () => {
    const incomeLoaderParamsInterface: Partial<
      Record<keyof IncomeLoaderParamsInterface, string>
    > = {
      has_company: formik.values.company?.id || "",
      is_personal_or_company: formik.values.is_personal_or_company,
    };

    return new URLSearchParams(incomeLoaderParamsInterface).toString();
  };

  const loadAccounts = useDebouncedCallback(async () => {
    await fetchAccounts(
      {
        paginationParams: defaultPaginationQuery(),
        searchParams: filterAccountsParams(),
      },
      {
        onSuccess: (res) => {
          setAccounts(res);
        },
        onError: () => {},
        onFinally: () => {
          setLoadingStates((prev) => ({
            ...prev,
            isAccountLoading: false,
          }));
        },
      }
    );
  });

  const loadExpenses = useDebouncedCallback(async () => {
    await fetchExpenses(
      {
        paginationParams: defaultPaginationQuery(),
        searchParams: filterExpensesParams(),
      },
      {
        onSuccess: (res) => {
          setExpenses(res);
        },
        onError: () => {},
        onFinally: () => {
          setLoadingStates((prev) => ({
            ...prev,
            isExpenseLoading: false,
          }));
        },
      }
    );
  });

  const loadClassifications = useDebouncedCallback(async () => {
    await fetchClassifications(
      {
        paginationParams: defaultPaginationQuery(),
        searchParams: filterClassificationsParams(),
      },
      {
        onSuccess: (res) => {
          setClassifications(res);
        },
        onError: () => {},
        onFinally: () => {
          setLoadingStates((prev) => ({
            ...prev,
            isClassificationLoading: false,
          }));
        },
      }
    );
  });

  const loadIncomes = useDebouncedCallback(async () => {
    await fetchIncomes(
      {
        paginationParams: defaultPaginationQuery(),
        searchParams: filterIncomesParams(),
      },
      {
        onSuccess: (res) => {
          setIncomes(res);
        },
        onError: () => {},
        onFinally: () => {
          setLoadingStates((prev) => ({
            ...prev,
            isIncomeLoading: false,
          }));
        },
      }
    );
  });

  const loadCompanies = useDebouncedCallback(async () => {
    const res = await fetchCompanies();
    if (res) {
      setCompanies(res);
      setLoadingStates((prev) => ({
        ...prev,
        isCompanyLoading: false,
      }));
    }
  });

  return (
    <Loader loading={loadingData()}>
      <form>
        <div className="flex justify-end mb-5 underline decoration-red-700 text-red-700 cursor-pointer">
          <span onClick={resetForm}>Clear all filters</span>
        </div>
        <div className="flex flex-col gap-2 mb-12">
          <span className="relative bg-white w-auto self-center top-6 text-violet-950 px-2">
            Income or Expense Transaction
          </span>
          <div className="p-4 text-violet-950 flex justify-between border-2 border-violet-950 border-opacity-50">
            <div>
              <input
                id="income_expense_all_filter"
                type="radio"
                name="is_income_or_expense"
                value={"all"}
                onChange={isIncomeOrExpenseChange}
                checked={formik.values.is_income_or_expense === "all"}
              ></input>
              <label
                className="cursor-pointer ml-2"
                htmlFor="income_expense_all_filter"
              >
                All
              </label>
            </div>
            <div>
              <input
                id="is_expense_filter"
                type="radio"
                name="is_income_or_expense"
                value={"expense"}
                onChange={isIncomeOrExpenseChange}
                checked={formik.values.is_income_or_expense === "expense"}
              ></input>
              <label
                className="cursor-pointer ml-2"
                htmlFor="is_expense_filter"
              >
                Expense transaction
              </label>
            </div>
            <div>
              <input
                id="is_income_filter"
                type="radio"
                name="is_income_or_expense"
                value={"income"}
                onChange={isIncomeOrExpenseChange}
                checked={formik.values.is_income_or_expense === "income"}
              ></input>
              <label className="cursor-pointer ml-2" htmlFor="is_income_filter">
                Income transaction
              </label>
            </div>
          </div>
          <span className="relative bg-white w-auto self-center top-6 text-violet-950 px-2">
            Personal or Company Transaction
          </span>
          <div className="p-4 text-violet-950 flex justify-between border-2 border-violet-950 border-opacity-50">
            <div>
              <input
                id="personal_company_all_filter"
                type="radio"
                name="is_personal_or_company"
                value={"all"}
                onChange={isPersonalOrCompanyChange}
                checked={formik.values.is_personal_or_company === "all"}
              ></input>
              <label
                className="cursor-pointer ml-2"
                htmlFor="personal_company_all_filter"
              >
                All
              </label>
            </div>
            <div>
              <input
                id="is_personal_filter"
                type="radio"
                name="is_personal_or_company"
                value={"personal"}
                onChange={isPersonalOrCompanyChange}
                checked={formik.values.is_personal_or_company === "personal"}
              ></input>
              <label
                className="cursor-pointer ml-2"
                htmlFor="is_personal_filter"
              >
                Personal transaction
              </label>
            </div>
            <div>
              <input
                id="is_company_filter"
                type="radio"
                name="is_personal_or_company"
                value={"company"}
                onChange={isPersonalOrCompanyChange}
                checked={formik.values.is_personal_or_company === "company"}
              ></input>
              <label
                className="cursor-pointer ml-2"
                htmlFor="is_company_filter"
              >
                Company transaction
              </label>
            </div>
          </div>
        </div>
        <InputText
          type="date"
          label="After"
          name="date_after"
          value={formik.values.date_after}
          onChange={formik.handleChange}
        ></InputText>
        <InputText
          type="date"
          label="Before"
          name="date_before"
          value={formik.values.date_before}
          onChange={formik.handleChange}
        ></InputText>
        <InputText
          type="number"
          label="Amount greater than"
          name="amount_greater"
          value={formik.values.amount_greater}
          onChange={formik.handleChange}
        ></InputText>
        <InputText
          type="number"
          label="Amount less than"
          name="amount_less"
          value={formik.values.amount_less}
          onChange={formik.handleChange}
        ></InputText>
        <InputText
          label="Name"
          name="name"
          onChange={formik.handleChange}
          value={formik.values.name}
        ></InputText>
        {formik.values.is_personal_or_company != "personal" && (
          <InputSelect
            isClearable
            className="mb-8"
            placeholder="Company"
            options={companies.data}
            getOptionLabel={getSelectCompanyOptionLabel as any}
            getOptionValue={getSelectCompanyOptionValue as any}
            name="company"
            onChange={(event) => onCompanyFilterChange(event as Company)}
            value={formik.values.company}
          ></InputSelect>
        )}
        <InputSelect
          isClearable
          required
          className="mb-8"
          placeholder="Account"
          options={accounts.data}
          getOptionLabel={getSelectAccountOptionLabel as any}
          getOptionValue={getSelectAccountOptionValue as any}
          name="account"
          onChange={(event) =>
            formik.setFieldValue("account", event as Account)
          }
          value={formik.values.account}
        />
        {formik.values.is_income_or_expense != "income" && (
          <InputSelect
            isClearable
            className="mb-8"
            placeholder="Expense"
            options={expenses.data}
            getOptionLabel={getSelectExpenseOptionLabel as any}
            getOptionValue={getSelectExpenseOptionValue as any}
            name="expense"
            onChange={(event) => onExpenseFilterChange(event as Expense)}
            value={formik.values.expense}
          ></InputSelect>
        )}
        {formik.values.is_income_or_expense != "expense" && (
          <InputSelect
            isClearable
            className="mb-8"
            placeholder="Income"
            options={incomes.data}
            getOptionLabel={getSelectIncomeOptionLabel as any}
            getOptionValue={getSelectIncomeOptionValue as any}
            name="income"
            onChange={(event) => onIncomeFilterChange(event as Income)}
            value={formik.values.income}
          ></InputSelect>
        )}
        <InputSelect
          isClearable
          className="mb-8"
          placeholder="Classification"
          name="has_classification"
          options={classifications.data}
          getOptionLabel={getSelectClassificationOptionLabel as any}
          getOptionValue={getSelectClassificationOptionValue as any}
          onChange={(event) =>
            onClassificationChange(event as TransactionClassification)
          }
          value={formik.values.has_classification}
        ></InputSelect>

        <div className="flex justify-end p-2 mt-10">
          <PrimaryButton
            onClick={onSubmit}
            text="Done"
            type="button"
          ></PrimaryButton>
        </div>
      </form>
    </Loader>
  );
}
