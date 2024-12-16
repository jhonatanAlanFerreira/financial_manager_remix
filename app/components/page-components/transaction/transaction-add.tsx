import {
  Account,
  Company,
  Expense,
  Income,
  TransactionClassification,
} from "@prisma/client";
import { Form } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { Checkbox } from "~/components/inputs/checkbox/checkbox";
import { InputSelect } from "~/components/inputs/input-select/input-select";
import { InputText } from "~/components/inputs/input-text/input-text";
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
import { IncomeLoaderParamsInterface } from "~/data/income/income-query-params-interfaces";
import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";
import { useDebouncedCallback } from "~/utils/utilities";

export function TransactionAdd({
  responseErrors,
  isSubmitting,
  formik,
  onSubmit,
  onModalCancel,
}: TransactionAddPropsInterface) {
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
  const getSelectAccountOptionValue = (option: Account) => option.id;
  const getSelectAccountOptionLabel = (option: Account) => option.name;
  const getSelectExpenseOptionValue = (option: Expense) => option.id;
  const getSelectExpenseOptionLabel = (option: Expense) => option.name;
  const getSelectIncomeOptionValue = (option: Income) => option.id;
  const getSelectIncomeOptionLabel = (option: Income) => option.name;
  const getSelectClassificationOptionValue = (
    option: TransactionClassification
  ) => option.id;
  const getSelectClassificationOptionLabel = (
    option: TransactionClassification
  ) => option.name;

  const onTabSelect = (tabSelected: number) => {
    formik.setFieldValue("transaction_classifications", null);
    formik.setFieldValue("is_income", !!tabSelected);
  };

  const onCompanyChange = (company: Company) => {
    setShouldFilter(true);
    formik.setFieldValue("company", company);
  };

  const onExpenseChange = (expense: Expense) => {
    formik.setFieldValue("expense", expense);
  };

  const onIncomeChange = (income: Income) => {
    formik.setFieldValue("income", income);
  };

  const onClassificationsChange = (
    classifications: TransactionClassification[]
  ) => {
    formik.setFieldValue("transaction_classifications", classifications);
  };

  const onIsPersonalChange = (value: boolean) => {
    setShouldFilter(true);
    formik.setFieldValue("is_personal", value);
  };

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
      formik.setFieldValue("account", null);
      formik.setFieldValue("transaction_classifications", null);
      loadData();
    }
  }, [formik.values.is_personal]);

  useEffect(() => {
    if (shouldFilter) {
      setShouldFilter(false);
      formik.setFieldValue("expense", null);
      formik.setFieldValue("income", null);
      formik.setFieldValue("transaction_classifications", null);
      formik.setFieldValue("account", null);
      loadData();
    }
  }, [formik.values.company]);

  useEffect(() => {
    if (formik.values.income?.name && !formik.values.name) {
      formik.setFieldValue("name", formik.values.income.name);
    }

    if (formik.values.income?.amount && !formik.values.amount) {
      formik.setFieldValue("amount", formik.values.income.amount);
    }

    if (shouldFilter) {
      setShouldFilter(false);

      formik.setFieldValue("transaction_classifications", null);

      setLoadingStates((prev) => ({
        ...prev,
        isClassificationLoading: true,
      }));

      loadClassifications();
    }
  }, [formik.values.income]);

  useEffect(() => {
    if (formik.values.expense?.name && !formik.values.name) {
      formik.setFieldValue("name", formik.values.expense.name);
    }

    if (formik.values.expense?.amount && !formik.values.amount) {
      formik.setFieldValue("amount", formik.values.expense.amount);
    }

    if (shouldFilter) {
      setShouldFilter(false);

      formik.setFieldValue("transaction_classifications", null);

      setLoadingStates((prev) => ({
        ...prev,
        isClassificationLoading: true,
      }));

      loadClassifications();
    }
  }, [formik.values.expense]);

  useEffect(() => {
    setLoadingStates((prev) => ({
      ...prev,
      isClassificationLoading: true,
    }));

    loadClassifications();
  }, [formik.values.is_income]);

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
    const isPersonalOrCompanyType: IsPersonalOrCompanyType = formik.values
      .is_personal
      ? "personal"
      : "company";

    const accountLoaderParamsInterface: Partial<
      Record<keyof AccountLoaderParamsInterface, string>
    > = {
      company: formik.values.company?.id || "",
      is_personal_or_company: isPersonalOrCompanyType,
    };

    return new URLSearchParams(accountLoaderParamsInterface).toString();
  };

  const filterExpensesParams = () => {
    const isPersonalOrCompanyType: IsPersonalOrCompanyType = formik.values
      .is_personal
      ? "personal"
      : "company";

    const expenseLoaderParamsInterface: Partial<
      Record<keyof ExpenseLoaderParamsInterface, string>
    > = {
      has_company: formik.values.company?.id || "",
      is_personal_or_company: isPersonalOrCompanyType,
    };

    return new URLSearchParams(expenseLoaderParamsInterface).toString();
  };

  const filterClassificationsParams = () => {
    const isIncomeOrExpenseType: IsIncomeOrExpenseType = formik.values.is_income
      ? "income"
      : "expense";
    const isPersonalOrCompanyType: IsPersonalOrCompanyType = formik.values
      .is_personal
      ? "personal"
      : "company";

    const classificationLoaderParamsInterface: Partial<
      Record<keyof ClassificationLoaderParamsInterface, string>
    > = {
      has_company: formik.values.company?.id || "",
      is_income_or_expense: isIncomeOrExpenseType,
      is_personal_or_company: isPersonalOrCompanyType,
    };

    return new URLSearchParams(classificationLoaderParamsInterface).toString();
  };

  const filterIncomesParams = () => {
    const isPersonalOrCompanyType: IsPersonalOrCompanyType = formik.values
      .is_personal
      ? "personal"
      : "company";

    const incomeLoaderParamsInterface: Partial<
      Record<keyof IncomeLoaderParamsInterface, string>
    > = {
      has_company: formik.values.company?.id || "",
      is_personal_or_company: isPersonalOrCompanyType,
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
      <div className="p-2">
        <Tabs
          onSelect={onTabSelect}
          defaultIndex={!!formik.values.is_income ? 1 : 0}
        >
          <TabList className="mb-2">
            <div className="flex justify-around gap-2">
              <Tab
                disabled={!!formik.values.id && !!formik.values.is_income}
                selectedClassName="bg-violet-900 text-white"
                disabledClassName="opacity-50 pointer-events-none"
                className={`w-full text-center p-2 text-violet-950 border overflow-hidden ${
                  !formik.values.is_income
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
                disabled={!!formik.values.id && !formik.values.is_income}
                selectedClassName="bg-violet-900 text-white"
                disabledClassName="opacity-50 pointer-events-none"
                className={`w-full text-center p-2 text-violet-950 border overflow-hidden ${
                  !!formik.values.is_income
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
            <div className="p-4">
              <Form method="post" id="classification-form" onSubmit={onSubmit}>
                <div className="border-2 border-violet-950 border-opacity-50 p-4">
                  <Checkbox
                    className="relative top-1"
                    name="is_personal"
                    id="is_personal"
                    onChange={(event) =>
                      onIsPersonalChange(event.target.checked)
                    }
                    checked={formik.values.is_personal}
                  ></Checkbox>
                  <label
                    className="pl-3 text-violet-950 cursor-pointer"
                    htmlFor="is_personal"
                  >
                    Personal transaction
                  </label>
                </div>
                {!formik.values.is_personal && (
                  <InputSelect
                    isClearable
                    className="mb-8"
                    placeholder="Company"
                    options={companies.data}
                    getOptionLabel={getSelectCompanyOptionLabel as any}
                    getOptionValue={getSelectCompanyOptionValue as any}
                    name="company"
                    onChange={(event) => onCompanyChange(event as Company)}
                    value={formik.values.company}
                  ></InputSelect>
                )}
                <InputSelect
                  isClearable
                  required
                  className="mb-8"
                  placeholder="Account *"
                  options={accounts.data}
                  getOptionLabel={getSelectAccountOptionLabel as any}
                  getOptionValue={getSelectAccountOptionValue as any}
                  name="account"
                  onChange={(event) =>
                    formik.setFieldValue("account", event as Account)
                  }
                  value={formik.values.account}
                />
                <InputSelect
                  isClearable
                  className="mb-8"
                  placeholder="Expense"
                  options={expenses.data}
                  getOptionLabel={getSelectExpenseOptionLabel as any}
                  getOptionValue={getSelectExpenseOptionValue as any}
                  name="expense"
                  onChange={(event) => onExpenseChange(event as Expense)}
                  value={formik.values.expense}
                ></InputSelect>
                <InputText
                  label="Name *"
                  name="name"
                  required
                  onChange={formik.handleChange}
                  value={formik.values.name}
                ></InputText>
                <InputText
                  label="Date *"
                  name="date"
                  type="date"
                  required
                  onChange={formik.handleChange}
                  value={formik.values.date}
                ></InputText>
                <InputText
                  label="Amount *"
                  name="amount"
                  type="number"
                  step={0.01}
                  min={0.01}
                  required
                  errorMessage={responseErrors?.errors?.["amount"]}
                  onChange={formik.handleChange}
                  value={formik.values.amount}
                ></InputText>
                <InputSelect
                  isClearable
                  className="mb-8"
                  placeholder="Classification"
                  options={classifications.data}
                  getOptionLabel={getSelectClassificationOptionLabel as any}
                  getOptionValue={getSelectClassificationOptionValue as any}
                  isMulti
                  name="classifications"
                  onChange={(event) =>
                    onClassificationsChange(
                      event as TransactionClassification[]
                    )
                  }
                  value={formik.values.transaction_classifications}
                ></InputSelect>
              </Form>
            </div>
          </TabPanel>
          <TabPanel>
            <div className="p-4">
              <Form method="post" id="classification-form" onSubmit={onSubmit}>
                <div className="border-2 border-violet-950 border-opacity-50 p-4">
                  <Checkbox
                    className="relative top-1"
                    name="is_personal"
                    id="is_personal"
                    onChange={(event) =>
                      onIsPersonalChange(event.target.checked)
                    }
                    checked={formik.values.is_personal}
                  ></Checkbox>
                  <label
                    className="pl-3 text-violet-950 cursor-pointer"
                    htmlFor="is_personal"
                  >
                    Personal transaction
                  </label>
                </div>
                {!formik.values.is_personal && (
                  <InputSelect
                    isClearable
                    className="mb-8"
                    placeholder="Company"
                    options={companies.data}
                    getOptionLabel={getSelectCompanyOptionLabel as any}
                    getOptionValue={getSelectCompanyOptionValue as any}
                    name="company"
                    onChange={(event) => onCompanyChange(event as Company)}
                    value={formik.values.company}
                  ></InputSelect>
                )}
                <InputSelect
                  isClearable
                  required
                  className="mb-8"
                  placeholder="Account *"
                  options={accounts.data}
                  getOptionLabel={getSelectAccountOptionLabel as any}
                  getOptionValue={getSelectAccountOptionValue as any}
                  name="account"
                  onChange={(event) =>
                    formik.setFieldValue("account", event as Account)
                  }
                  value={formik.values.account}
                />
                <InputSelect
                  isClearable
                  className="mb-8"
                  placeholder="Income"
                  options={incomes.data}
                  getOptionLabel={getSelectIncomeOptionLabel as any}
                  getOptionValue={getSelectIncomeOptionValue as any}
                  name="income"
                  onChange={(event) => onIncomeChange(event as Income)}
                  value={formik.values.income}
                ></InputSelect>
                <InputText
                  label="Name *"
                  name="name"
                  required
                  onChange={formik.handleChange}
                  value={formik.values.name}
                ></InputText>
                <InputText
                  label="Date *"
                  name="date"
                  type="date"
                  required
                  onChange={formik.handleChange}
                  value={formik.values.date}
                ></InputText>
                <InputText
                  label="Amount *"
                  name="amount"
                  type="number"
                  step={0.01}
                  min={0.01}
                  required
                  errorMessage={responseErrors?.errors?.["amount"]}
                  onChange={formik.handleChange}
                  value={formik.values.amount}
                ></InputText>
                <InputSelect
                  isClearable
                  isMulti
                  className="mb-8"
                  placeholder="Classification"
                  name="classifications"
                  options={classifications.data}
                  getOptionLabel={getSelectClassificationOptionLabel as any}
                  getOptionValue={getSelectClassificationOptionValue as any}
                  onChange={(event) =>
                    onClassificationsChange(
                      event as TransactionClassification[]
                    )
                  }
                  value={formik.values.transaction_classifications}
                ></InputSelect>
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
