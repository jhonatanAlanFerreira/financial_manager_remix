import {
  Account,
  Company,
  Expense,
  Income,
  Merchant,
  TransactionClassification,
} from "@prisma/client";
import { useEffect, useRef } from "react";
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
import { fetchMerchants } from "~/data/frontend-services/merchant-service";
import { IncomeLoaderParamsInterface } from "~/data/income/income-query-params-interfaces";
import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { useDebouncedCallback } from "~/utils/utilities";
import {
  TRANSACTION_FILTER_FORM_DEFAULTS_VALUES,
  transactionFilterStore,
} from "~/components/page-components/transaction/transaction-store";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";
import { Controller } from "react-hook-form";

export function TransactionFilters({
  onSubmit,
  form,
}: TransactionFiltersPropsInterface) {
  const hasRun = useRef(false);

  const {
    setAllLoadingState,
    setLoading,
    isLoading,
    accounts,
    setAccounts,
    classifications,
    setClassifications,
    companies,
    setCompanies,
    expenses,
    setExpenses,
    incomes,
    setIncomes,
    merchants,
    setMerchants,
  } = transactionFilterStore();

  const {
    register: registerFilter,
    reset: resetFilter,
    setValue: setFilterValue,
    getValues: getFilterValues,
    watch: watchFilter,
    control: filterControl,
  } = form;

  useEffect(() => {
    if (!hasRun.current) {
      loadData();
      hasRun.current = true;
    }
  }, []);

  const loadData = () => {
    setAllLoadingState(true);

    loadAccounts();
    loadCompanies();
    loadExpenses();
    loadClassifications();
    loadIncomes();
    loadMerchants();
  };

  const loadAccounts = useDebouncedCallback(async () => {
    setLoading("isAccountLoading", true);

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
        onFinally: () => setLoading("isAccountLoading", false),
      }
    );
  });

  const loadExpenses = useDebouncedCallback(async () => {
    setLoading("isExpenseLoading", true);

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
        onFinally: () => setLoading("isExpenseLoading", false),
      }
    );
  });

  const loadClassifications = useDebouncedCallback(async () => {
    setLoading("isClassificationLoading", true);

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
        onFinally: () => setLoading("isClassificationLoading", false),
      }
    );
  });

  const loadIncomes = useDebouncedCallback(async () => {
    setLoading("isIncomeLoading", true);

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
        onFinally: () => setLoading("isIncomeLoading", false),
      }
    );
  });

  const loadMerchants = useDebouncedCallback(async () => {
    setLoading("isMerchantLoading", true);

    await fetchMerchants(
      {
        paginationParams: defaultPaginationQuery(),
        searchParams: "",
      },
      {
        onSuccess: (res) => {
          setMerchants(res);
        },
        onError: () => {},
        onFinally: () => setLoading("isMerchantLoading", false),
      }
    );
  });

  const loadCompanies = useDebouncedCallback(async () => {
    setLoading("isCompanyLoading", true);

    const res = await fetchCompanies();
    if (res) {
      setCompanies(res);
      setLoading("isCompanyLoading", false);
    }
  });

  const filterAccountsParams = () => {
    const accountLoaderParamsInterface: Partial<
      Record<keyof AccountLoaderParamsInterface, string>
    > = {
      company: getFilterValues().company?.id || "",
      is_personal_or_company: getFilterValues().is_personal_or_company,
    };

    return new URLSearchParams(accountLoaderParamsInterface).toString();
  };

  const filterExpensesParams = () => {
    const expenseLoaderParamsInterface: Partial<
      Record<keyof ExpenseLoaderParamsInterface, string>
    > = {
      has_company: getFilterValues().company?.id || "",
      is_personal_or_company: getFilterValues().is_personal_or_company,
    };

    return new URLSearchParams(expenseLoaderParamsInterface).toString();
  };

  const filterClassificationsParams = () => {
    const classificationLoaderParamsInterface: Partial<
      Record<keyof ClassificationLoaderParamsInterface, string>
    > = {
      has_company: getFilterValues().company?.id || "",
      is_income_or_expense: getFilterValues().is_income_or_expense,
      is_personal_or_company: getFilterValues().is_personal_or_company,
    };

    return new URLSearchParams(classificationLoaderParamsInterface).toString();
  };

  const filterIncomesParams = () => {
    const incomeLoaderParamsInterface: Partial<
      Record<keyof IncomeLoaderParamsInterface, string>
    > = {
      has_company: getFilterValues().company?.id || "",
      is_personal_or_company: getFilterValues().is_personal_or_company,
    };

    return new URLSearchParams(incomeLoaderParamsInterface).toString();
  };

  const isIncomeOrExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(
      "is_income_or_expense",
      e.currentTarget.value as IsIncomeOrExpenseType
    );

    if (getFilterValues().is_income_or_expense == "expense") {
      setFilterValue("income", null);
    }

    if (getFilterValues().is_income_or_expense == "income") {
      setFilterValue("expense", null);
    }

    loadClassifications();
  };

  const isPersonalOrCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterValue(
      "is_personal_or_company",
      e.currentTarget.value as IsPersonalOrCompanyType
    );

    if (getFilterValues().is_personal_or_company == "personal") {
      setFilterValue("company", null);
    }

    setFilterValue("has_classification", null);
    setFilterValue("income", null);
    setFilterValue("expense", null);

    loadClassifications();
    loadExpenses();
    loadIncomes();
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

  return (
    <Loader loading={isLoading()}>
      <form>
        <div className="flex justify-end mb-5 underline decoration-red-700 text-red-700 cursor-pointer">
          <span
            onClick={() => resetFilter(TRANSACTION_FILTER_FORM_DEFAULTS_VALUES)}
          >
            Clear all filters
          </span>
        </div>
        <div className="overflow-auto max-h-[calc(100vh_-_16rem)]">
          <div className="flex flex-col gap-2 mb-12">
            <span className="relative bg-white w-auto self-center top-6 text-violet-950 px-2">
              Income or Expense Transaction
            </span>
            <div className="p-4 text-violet-950 flex flex-col xl:flex-row justify-between border-2 border-violet-950 border-opacity-50">
              <div>
                <input
                  id="income_expense_all_filter"
                  type="radio"
                  value={"all"}
                  {...registerFilter("is_income_or_expense")}
                  onChange={(event) => isIncomeOrExpenseChange(event)}
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
                  value={"expense"}
                  {...registerFilter("is_income_or_expense")}
                  onChange={(event) => isIncomeOrExpenseChange(event)}
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
                  value={"income"}
                  {...registerFilter("is_income_or_expense")}
                  onChange={(event) => isIncomeOrExpenseChange(event)}
                ></input>
                <label
                  className="cursor-pointer ml-2"
                  htmlFor="is_income_filter"
                >
                  Income transaction
                </label>
              </div>
            </div>
            <span className="relative bg-white w-auto self-center top-6 text-violet-950 px-2">
              Personal or Company Transaction
            </span>
            <div className="p-4 text-violet-950 flex flex-col xl:flex-row justify-between border-2 border-violet-950 border-opacity-50">
              <div>
                <input
                  id="personal_company_all_filter"
                  type="radio"
                  value={"all"}
                  {...registerFilter("is_personal_or_company")}
                  onChange={(event) => isPersonalOrCompanyChange(event)}
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
                  value={"personal"}
                  {...registerFilter("is_personal_or_company")}
                  onChange={(event) => isPersonalOrCompanyChange(event)}
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
                  value={"company"}
                  {...registerFilter("is_personal_or_company")}
                  onChange={(event) => isPersonalOrCompanyChange(event)}
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
            {...registerFilter("date_after")}
          ></InputText>
          <InputText
            type="date"
            label="Before"
            {...registerFilter("date_before")}
          ></InputText>
          <InputText
            type="number"
            label="Amount greater than"
            {...registerFilter("amount_greater")}
          ></InputText>
          <InputText
            type="number"
            label="Amount less than"
            {...registerFilter("amount_less")}
          ></InputText>
          <InputText label="Name" {...registerFilter("name")}></InputText>
          {watchFilter("is_personal_or_company") != "personal" && (
            <Controller
              name="company"
              control={filterControl}
              render={({ field }) => (
                <InputSelect
                  isClearable
                  className="mb-8"
                  placeholder="Company"
                  options={companies.data}
                  getOptionLabel={(company) => (company as Company).name}
                  getOptionValue={(company) => (company as Company).id}
                  {...field}
                />
              )}
            />
          )}
          <Controller
            name="account"
            control={filterControl}
            render={({ field }) => (
              <InputSelect
                isClearable
                className="mb-8"
                placeholder="Account"
                options={accounts.data}
                getOptionLabel={(account) => (account as Account).name}
                getOptionValue={(account) => (account as Account).id}
                {...field}
              />
            )}
          />
          <Controller
            name="merchant"
            control={filterControl}
            render={({ field }) => (
              <InputSelect
                isClearable
                className="mb-8"
                placeholder="Merchant"
                options={merchants.data}
                getOptionLabel={(merchant) => (merchant as Merchant).name}
                getOptionValue={(merchant) => (merchant as Merchant).id}
                {...field}
              />
            )}
          />
          {watchFilter("is_income_or_expense") != "income" && (
            <Controller
              name="expense"
              control={filterControl}
              render={({ field }) => (
                <InputSelect
                  isClearable
                  className="mb-8"
                  placeholder="Expense"
                  options={expenses.data}
                  getOptionLabel={(expense) => (expense as Expense).name}
                  getOptionValue={(expense) => (expense as Expense).id}
                  {...field}
                />
              )}
            />
          )}
          {watchFilter("is_income_or_expense") != "expense" && (
            <Controller
              name="income"
              control={filterControl}
              render={({ field }) => (
                <InputSelect
                  isClearable
                  className="mb-8"
                  placeholder="Income"
                  options={incomes.data}
                  getOptionLabel={(income) => (income as Income).name}
                  getOptionValue={(income) => (income as Income).id}
                  {...field}
                />
              )}
            />
          )}
          <Controller
            name="has_classification"
            control={filterControl}
            render={({ field }) => (
              <InputSelect
                isClearable
                className="mb-8"
                placeholder="Classification"
                options={classifications.data}
                getOptionLabel={(classification) =>
                  (classification as TransactionClassification).name
                }
                getOptionValue={(classification) =>
                  (classification as TransactionClassification).id
                }
                {...field}
              />
            )}
          />
        </div>
        <div className="flex justify-end p-2 mt-7">
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
