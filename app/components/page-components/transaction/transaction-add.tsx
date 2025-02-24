import {
  Account,
  Company,
  Expense,
  Income,
  Merchant,
  TransactionClassification,
} from "@prisma/client";
import { Form } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { Checkbox } from "~/components/inputs/checkbox/checkbox";
import { InputSelect } from "~/components/inputs/input-select/input-select";
import { InputText } from "~/components/inputs/input-text/input-text";
import { TextArea } from "~/components/inputs/text-area/text-area";
import { Loader } from "~/components/loader/loader";
import { TransactionAddPropsInterface } from "~/components/page-components/transaction/transaction-interfaces";
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
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";
import { useDebouncedCallback } from "~/utils/utilities";
import { transactionMainStore } from "~/components/page-components/transaction/transaction-store";
import { Controller } from "react-hook-form";

export function TransactionAdd({
  responseErrors,
  isSubmitting,
  onSubmit,
  onModalCancel,
  form,
}: TransactionAddPropsInterface) {
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
  } = transactionMainStore();

  const {
    register: registerMain,
    setValue: setMainValue,
    watch: watchMain,
    getValues: getMainValues,
    control: mainControl,
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
        onFinally: () => {
          setLoading("isAccountLoading", false);
        },
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
        onFinally: () => {
          setLoading("isExpenseLoading", false);
        },
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
        onFinally: () => {
          setLoading("isClassificationLoading", false);
        },
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
        onFinally: () => {
          setLoading("isIncomeLoading", false);
        },
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
        onFinally: () => {
          setLoading("isMerchantLoading", false);
        },
      }
    );
  });

  const loadCompanies = useDebouncedCallback(async () => {
    const res = await fetchCompanies();
    if (res) {
      setCompanies(res);
      setLoading("isCompanyLoading", false);
    }
  });

  const filterAccountsParams = () => {
    const isPersonalOrCompanyType: IsPersonalOrCompanyType = getMainValues()
      .is_personal
      ? "personal"
      : "company";

    const accountLoaderParamsInterface: Partial<
      Record<keyof AccountLoaderParamsInterface, string>
    > = {
      company: getMainValues().company?.id || "",
      is_personal_or_company: isPersonalOrCompanyType,
    };

    return new URLSearchParams(accountLoaderParamsInterface).toString();
  };

  const filterExpensesParams = () => {
    const isPersonalOrCompanyType: IsPersonalOrCompanyType = getMainValues()
      .is_personal
      ? "personal"
      : "company";

    const expenseLoaderParamsInterface: Partial<
      Record<keyof ExpenseLoaderParamsInterface, string>
    > = {
      has_company: getMainValues().company?.id || "",
      is_personal_or_company: isPersonalOrCompanyType,
    };

    return new URLSearchParams(expenseLoaderParamsInterface).toString();
  };

  const filterClassificationsParams = () => {
    const isIncomeOrExpenseType: IsIncomeOrExpenseType = getMainValues()
      .is_income
      ? "income"
      : "expense";
    const isPersonalOrCompanyType: IsPersonalOrCompanyType = getMainValues()
      .is_personal
      ? "personal"
      : getMainValues().company
      ? "company"
      : "all";

    const classificationLoaderParamsInterface: Partial<
      Record<keyof ClassificationLoaderParamsInterface, string>
    > = {
      has_company: getMainValues().company?.id || "",
      is_income_or_expense: isIncomeOrExpenseType,
      is_personal_or_company: isPersonalOrCompanyType,
    };

    return new URLSearchParams(classificationLoaderParamsInterface).toString();
  };

  const filterIncomesParams = () => {
    const isPersonalOrCompanyType: IsPersonalOrCompanyType = getMainValues()
      .is_personal
      ? "personal"
      : "company";

    const incomeLoaderParamsInterface: Partial<
      Record<keyof IncomeLoaderParamsInterface, string>
    > = {
      has_company: getMainValues().company?.id || "",
      is_personal_or_company: isPersonalOrCompanyType,
    };

    return new URLSearchParams(incomeLoaderParamsInterface).toString();
  };

  const onTabSelect = (tabSelected: number) => {
    setMainValue("transaction_classifications", []);
    setMainValue("is_income", !!tabSelected);
    setMainValue("expense", null);
    setMainValue("income", null);
    setMainValue("transaction_classifications", []);

    loadData();
  };

  const onCompanyChange = (company: Company) => {
    setMainValue("company", company);

    setMainValue("account", null);
    setMainValue("expense", null);
    setMainValue("income", null);
    setMainValue("transaction_classifications", []);
    loadData();
  };

  const onIsPersonalChange = (value: boolean) => {
    setMainValue("is_personal", value);

    if (value) {
      setMainValue("company", null);
    }

    setMainValue("account", null);
    setMainValue("expense", null);
    setMainValue("income", null);
    setMainValue("transaction_classifications", []);
    loadData();
  };

  const onExpenseChange = (expense: Expense) => {
    setMainValue("expense", expense);
    const { name, amount } = getMainValues();
    if (!name) {
      setMainValue("name", expense.name);
    }
    if (!amount) {
      setMainValue("amount", expense.amount || 0);
    }
  };

  const onIncomeChange = (income: Income) => {
    setMainValue("income", income);
    const { name, amount } = getMainValues();
    if (!name) {
      setMainValue("name", income.name);
    }
    if (!amount) {
      setMainValue("amount", income.amount || 0);
    }
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
      <div className="p-2">
        <Tabs
          onSelect={onTabSelect}
          defaultIndex={!!watchMain("is_income") ? 1 : 0}
        >
          <TabList className="mb-2">
            <div className="flex justify-around gap-2">
              <Tab
                disabled={!!watchMain("id") && !!watchMain("is_income")}
                selectedClassName="bg-violet-900 text-white"
                disabledClassName="opacity-50 pointer-events-none"
                className={`w-full text-center p-2 text-violet-950 border overflow-hidden ${
                  !watchMain("is_income")
                    ? "pointer-events-none"
                    : "cursor-pointer"
                }`}
              >
                <div className="w-full transform transition-transform duration-300 hover:scale-110">
                  Expense Transaction
                </div>
              </Tab>
              <div className="border-r-2"></div>
              <Tab
                disabled={!!watchMain("id") && !watchMain("is_income")}
                selectedClassName="bg-violet-900 text-white"
                disabledClassName="opacity-50 pointer-events-none"
                className={`w-full text-center p-2 text-violet-950 border overflow-hidden ${
                  !!watchMain("is_income")
                    ? "pointer-events-none"
                    : "cursor-pointer"
                }`}
              >
                <div className="w-full transform transition-transform duration-300 hover:scale-110">
                  Income Transaction
                </div>
              </Tab>
            </div>
          </TabList>
          <TabPanel>
            <div className="p-4 overflow-auto max-h-[calc(100vh_-_15rem)]">
              <Form method="post" id="classification-form" onSubmit={onSubmit}>
                <div className="border-2 border-violet-950 border-opacity-50 p-4">
                  <Checkbox
                    className="relative top-1"
                    id="is_personal"
                    {...registerMain("is_personal")}
                    onChange={(event) =>
                      onIsPersonalChange(event.target.checked)
                    }
                  ></Checkbox>
                  <label
                    className="pl-3 text-violet-950 cursor-pointer"
                    htmlFor="is_personal"
                  >
                    Personal transaction
                  </label>
                </div>
                {!watchMain("is_personal") && (
                  <Controller
                    name="company"
                    control={mainControl}
                    render={({ field }) => (
                      <InputSelect
                        isClearable
                        className="mb-8"
                        placeholder="Company"
                        options={companies.data}
                        getOptionLabel={(company) => (company as Company).name}
                        getOptionValue={(company) => (company as Company).id}
                        {...field}
                        onChange={(company) =>
                          onCompanyChange(company as Company)
                        }
                      />
                    )}
                  />
                )}
                <Controller
                  name="account"
                  control={mainControl}
                  render={({ field }) => (
                    <InputSelect
                      required
                      isClearable
                      className="mb-8"
                      placeholder="Account *"
                      options={accounts.data}
                      getOptionLabel={(account) => (account as Account).name}
                      getOptionValue={(account) => (account as Account).id}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="expense"
                  control={mainControl}
                  render={({ field }) => (
                    <InputSelect
                      isClearable
                      className="mb-8"
                      placeholder="Expense"
                      options={expenses.data}
                      getOptionLabel={(expense) => (expense as Expense).name}
                      getOptionValue={(expense) => (expense as Expense).id}
                      {...field}
                      onChange={(expense) =>
                        onExpenseChange(expense as Expense)
                      }
                    />
                  )}
                />
                <InputText
                  label="Name *"
                  required
                  {...registerMain("name")}
                ></InputText>
                <TextArea
                  label="Description"
                  {...registerMain("description")}
                ></TextArea>
                <Controller
                  name="merchant"
                  control={mainControl}
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
                <InputText
                  label="Date *"
                  type="date"
                  required
                  {...registerMain("date")}
                ></InputText>
                <InputText
                  label="Amount *"
                  type="number"
                  step={0.01}
                  min={0.01}
                  required
                  errorMessage={responseErrors?.errors?.["amount"]}
                  {...registerMain("amount")}
                ></InputText>
                <Controller
                  name="transaction_classifications"
                  control={mainControl}
                  render={({ field }) => (
                    <InputSelect
                      isMulti
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
              </Form>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="p-4 overflow-auto max-h-[calc(100vh_-_15rem)]">
              <Form method="post" id="classification-form" onSubmit={onSubmit}>
                <div className="border-2 border-violet-950 border-opacity-50 p-4">
                  <Checkbox
                    className="relative top-1"
                    id="is_personal"
                    {...registerMain("is_personal")}
                    onChange={(event) =>
                      onIsPersonalChange(event.target.checked)
                    }
                  ></Checkbox>
                  <label
                    className="pl-3 text-violet-950 cursor-pointer"
                    htmlFor="is_personal"
                  >
                    Personal transaction
                  </label>
                </div>
                {!watchMain("is_personal") && (
                  <Controller
                    name="company"
                    control={mainControl}
                    render={({ field }) => (
                      <InputSelect
                        isClearable
                        className="mb-8"
                        placeholder="Company"
                        options={companies.data}
                        getOptionLabel={(company) => (company as Company).name}
                        getOptionValue={(company) => (company as Company).id}
                        {...field}
                        onChange={(company) =>
                          onCompanyChange(company as Company)
                        }
                      />
                    )}
                  />
                )}
                <Controller
                  name="account"
                  control={mainControl}
                  render={({ field }) => (
                    <InputSelect
                      required
                      isClearable
                      className="mb-8"
                      placeholder="Account *"
                      options={accounts.data}
                      getOptionLabel={(account) => (account as Account).name}
                      getOptionValue={(account) => (account as Account).id}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name="income"
                  control={mainControl}
                  render={({ field }) => (
                    <InputSelect
                      isClearable
                      className="mb-8"
                      placeholder="Income"
                      options={incomes.data}
                      getOptionLabel={(income) => (income as Income).name}
                      getOptionValue={(income) => (income as Income).id}
                      {...field}
                      onChange={(income) => onIncomeChange(income as Income)}
                    />
                  )}
                />
                <InputText
                  label="Name *"
                  required
                  {...registerMain("name")}
                ></InputText>
                <TextArea
                  label="Description"
                  {...registerMain("description")}
                ></TextArea>
                <Controller
                  name="merchant"
                  control={mainControl}
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
                <InputText
                  label="Date *"
                  type="date"
                  required
                  {...registerMain("date")}
                ></InputText>
                <InputText
                  label="Amount *"
                  type="number"
                  step={0.01}
                  min={0.01}
                  required
                  errorMessage={responseErrors?.errors?.["amount"]}
                  {...registerMain("amount")}
                ></InputText>
                <Controller
                  name="transaction_classifications"
                  control={mainControl}
                  render={({ field }) => (
                    <InputSelect
                      isMulti
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
              </Form>
            </div>
          </TabPanel>
        </Tabs>
        <div className="flex justify-between p-2">
          <DangerButton text="Cancel" onClick={onModalCancel}></DangerButton>
          <PrimaryButton
            text="Save"
            disabled={isSubmitting}
            form="classification-form"
            type="submit"
            className={`${isSubmitting ? "bg-violet-950/50" : ""}`}
          ></PrimaryButton>
        </div>
      </div>
    </Loader>
  );
}
