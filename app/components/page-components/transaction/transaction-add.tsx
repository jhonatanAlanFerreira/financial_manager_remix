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
import { TransactionAddPropsInterface } from "~/components/page-components/transaction/transaction-interfaces";
import { AccountLoaderParamsInterface } from "~/data/account/account-query-params-interfaces";
import {
  fetchAccounts,
  fetchCompanies,
} from "~/data/frontend-services/company-account-service";
import { PaginationParamsInterface } from "~/shared/pagination-params-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export function TransactionAdd({
  responseErrors,
  isSubmitting,
  formik,
  onSubmit,
  onModalCancel,
}: TransactionAddPropsInterface) {
  const hasRun = useRef(false);
  const [shouldFilter, setShouldFilter] = useState(false);

  const [accounts, setAccounts] = useState<ServerResponseInterface<Account[]>>(
    {}
  );
  const [companies, setCompanies] = useState<
    ServerResponseInterface<Company[]>
  >({});

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
    formik.setFieldValue("classifications", null);
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

  useEffect(() => {
    if (!hasRun.current) {
      loadAccounts();
      loadCompanies();
      hasRun.current = true;
    }
  }, []);

  useEffect(() => {
    if (shouldFilter) {
      formik.setFieldValue("account", null);
      loadAccounts();
      setShouldFilter(false);
    }
  }, [formik.values.company]);

  useEffect(() => {
    if (formik.values.income?.name && !formik.values.name) {
      formik.setFieldValue("name", formik.values.income.name);
    }

    if (formik.values.income?.amount && !formik.values.amount) {
      formik.setFieldValue("amount", formik.values.income.amount);
    }
  }, [formik.values.income]);

  useEffect(() => {
    if (formik.values.expense?.name && !formik.values.name) {
      formik.setFieldValue("name", formik.values.expense.name);
    }

    if (formik.values.expense?.amount && !formik.values.amount) {
      formik.setFieldValue("amount", formik.values.expense.amount);
    }
  }, [formik.values.expense]);

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
    };

    return new URLSearchParams(accountLoaderParamsInterface).toString();
  };

  const loadAccounts = async () => {
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
        onFinally: () => {},
      }
    );
  };

  const loadCompanies = async () => {
    const res = await fetchCompanies();
    if (res) {
      setCompanies(res);
    }
  };

  return (
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
                  onChange={formik.handleChange}
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
              {/* <InputSelect
                isClearable
                className="mb-8"
                placeholder="Expense"
                options={filteredExpenses}
                getOptionLabel={getSelectExpenseOptionLabel as any}
                getOptionValue={getSelectExpenseOptionValue as any}
                name="expense"
                onChange={(event) => onExpenseChange(event as Expense)}
                value={formik.values.expense}
              ></InputSelect> */}
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
              {/* <InputSelect
                isClearable
                className="mb-8"
                placeholder="Classification"
                options={filteredClassifications}
                getOptionLabel={getSelectClassificationOptionLabel as any}
                getOptionValue={getSelectClassificationOptionValue as any}
                isMulti
                name="classifications"
                onChange={(event) =>
                  onClassificationsChange(event as TransactionClassification[])
                }
                value={formik.values.transaction_classifications}
              ></InputSelect> */}
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
                  onChange={formik.handleChange}
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
              {/* <InputSelect
                isClearable
                className="mb-8"
                placeholder="Income"
                options={filteredIncomes}
                getOptionLabel={getSelectIncomeOptionLabel as any}
                getOptionValue={getSelectIncomeOptionValue as any}
                name="income"
                onChange={(event) => onIncomeChange(event as Income)}
                value={formik.values.income}
              ></InputSelect> */}
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
              {/* <InputSelect
                isClearable
                isMulti
                className="mb-8"
                placeholder="Classification"
                name="classifications"
                options={filteredClassifications}
                getOptionLabel={getSelectClassificationOptionLabel as any}
                getOptionValue={getSelectClassificationOptionValue as any}
                onChange={(event) =>
                  onClassificationsChange(event as TransactionClassification[])
                }
                value={formik.values.transaction_classifications}
              ></InputSelect> */}
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
  );
}
