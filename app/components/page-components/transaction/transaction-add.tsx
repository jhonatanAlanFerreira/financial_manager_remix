import {
  Account,
  Company,
  Expense,
  Income,
  TransactionClassification,
} from "@prisma/client";
import { Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Tabs, TabList, Tab, TabPanel } from "react-tabs";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { Checkbox } from "~/components/inputs/checkbox/checkbox";
import { InputSelect } from "~/components/inputs/input-select/input-select";
import { InputText } from "~/components/inputs/input-text/input-text";
import { TransactionAddPropsInterface } from "~/components/page-components/transaction/transaction-interfaces";

export function TransactionAdd({
  companies,
  expenses,
  incomes,
  classifications,
  accounts,
  responseErrors,
  isSubmitting,
  skipEffect,
  formik,
  onSubmit,
  setSkipEffect,
  onModalCancel,
}: TransactionAddPropsInterface) {
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [filteredClassifications, setFilteredClassifications] = useState<
    TransactionClassification[]
  >([]);

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
    formik.setFieldValue("classifications", classifications);
  };

  const runFilters = () => {
    filterClassifications();
    filterExpenses();
    filterIncomes();
    filterAccounts();
  };

  useEffect(() => {
    runFilters();
  }, []);

  useEffect(() => {
    if (skipEffect) {
      return setSkipEffect(false);
    }

    formik.setFieldValue("company", null);
    formik.setFieldValue("expense", null);
    formik.setFieldValue("income", null);
    formik.setFieldValue("account", null);
    formik.setFieldValue("classifications", null);

    runFilters();
  }, [formik.values.is_personal_transaction]);

  useEffect(() => {
    if (skipEffect) {
      return setSkipEffect(false);
    }

    runFilters();
  }, [formik.values.is_income]);

  useEffect(() => {
    if (skipEffect) {
      return setSkipEffect(false);
    }

    if (formik.values.income?.name && !formik.values.name) {
      formik.setFieldValue("name", formik.values.income.name);
    }

    if (formik.values.income?.amount && !formik.values.amount) {
      formik.setFieldValue("amount", formik.values.income.amount);
    }
  }, [formik.values.income]);

  useEffect(() => {
    if (skipEffect) {
      return setSkipEffect(false);
    }

    if (formik.values.expense?.name && !formik.values.name) {
      formik.setFieldValue("name", formik.values.expense.name);
    }

    if (formik.values.expense?.amount && !formik.values.amount) {
      formik.setFieldValue("amount", formik.values.expense.amount);
    }
  }, [formik.values.expense]);

  useEffect(() => {
    if (skipEffect) {
      return setSkipEffect(false);
    }

    formik.setFieldValue("expense", null);
    formik.setFieldValue("income", null);
    formik.setFieldValue("classifications", null);
    formik.setFieldValue("account", null);

    runFilters();
  }, [formik.values.company]);

  const filterExpenses = () => {
    if (expenses) {
      setFilteredExpenses(
        expenses.filter((expense) => {
          const transactionTypeFilter = formik.values.is_personal_transaction
            ? expense.is_personal
            : true;

          const companyFilter =
            !formik.values.company ||
            expense.company_ids.includes(formik.values.company.id);

          return transactionTypeFilter && companyFilter;
        })
      );
    }
  };

  const filterClassifications = () => {
    if (classifications) {
      setFilteredClassifications(
        classifications.filter((classification) => {
          const transactionTypeFilter = formik.values.is_personal_transaction
            ? classification.is_personal
            : true;

          const companyFilter =
            !formik.values.company ||
            classification.company_ids.includes(formik.values.company.id);

          const isIncomeFilter = formik.values.is_income
            ? classification.is_income
            : !classification.is_income;
          return transactionTypeFilter && companyFilter && isIncomeFilter;
        })
      );
    }
  };

  const filterIncomes = () => {
    if (incomes) {
      setFilteredIncomes(
        incomes.filter((income) => {
          const incomeTypeFilter = formik.values.is_personal_transaction
            ? income.is_personal
            : true;

          const companyFilter =
            !formik.values.company ||
            income.company_ids.includes(formik.values.company.id);

          return incomeTypeFilter && companyFilter;
        })
      );
    }
  };

  const filterAccounts = () => {
    if (accounts) {
      setFilteredAccounts(
        accounts.filter((account) => {
          const transactionTypeFilter = formik.values.is_personal_transaction
            ? account.is_personal
            : true;

          const companyFilter =
            !formik.values.company ||
            account.company_id === formik.values.company.id;

          return transactionTypeFilter && companyFilter;
        })
      );
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
                  name="is_personal_transaction"
                  id="is_personal_transaction"
                  onChange={formik.handleChange}
                  checked={formik.values.is_personal_transaction}
                ></Checkbox>
                <label
                  className="pl-3 text-violet-950 cursor-pointer"
                  htmlFor="is_personal_transaction"
                >
                  Personal transaction
                </label>
              </div>
              {!formik.values.is_personal_transaction && (
                <InputSelect
                  isClearable
                  className="mb-8"
                  placeholder="Company"
                  options={companies}
                  getOptionLabel={getSelectCompanyOptionLabel as any}
                  getOptionValue={getSelectCompanyOptionValue as any}
                  name="company"
                  onChange={(event) => onCompanyChange(event as Company)}
                  value={formik.values.company}
                ></InputSelect>
              )}
              <InputSelect
                isClearable
                className="mb-8"
                placeholder="Account"
                options={filteredAccounts}
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
                options={filteredExpenses}
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
                name="transaction_date"
                type="date"
                required
                onChange={formik.handleChange}
                value={formik.values.transaction_date}
              ></InputText>
              <InputText
                label="Amount *"
                name="amount"
                type="number"
                step={0.01}
                min={0.01}
                required
                errorMessage={responseErrors?.data?.errors?.["amount"]}
                onChange={formik.handleChange}
                value={formik.values.amount}
              ></InputText>
              <InputSelect
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
                value={formik.values.classifications}
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
                  name="is_personal_transaction"
                  id="is_personal_transaction"
                  onChange={formik.handleChange}
                  checked={formik.values.is_personal_transaction}
                ></Checkbox>
                <label
                  className="pl-3 text-violet-950 cursor-pointer"
                  htmlFor="is_personal_transaction"
                >
                  Personal transaction
                </label>
              </div>
              {!formik.values.is_personal_transaction && (
                <InputSelect
                  isClearable
                  className="mb-8"
                  placeholder="Company"
                  options={companies}
                  getOptionLabel={getSelectCompanyOptionLabel as any}
                  getOptionValue={getSelectCompanyOptionValue as any}
                  name="company"
                  onChange={(event) => onCompanyChange(event as Company)}
                  value={formik.values.company}
                ></InputSelect>
              )}
              <InputSelect
                isClearable
                className="mb-8"
                placeholder="Account"
                options={filteredAccounts}
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
                options={filteredIncomes}
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
                name="transaction_date"
                type="date"
                required
                onChange={formik.handleChange}
                value={formik.values.transaction_date}
              ></InputText>
              <InputText
                label="Amount *"
                name="amount"
                type="number"
                step={0.01}
                min={0.01}
                required
                errorMessage={responseErrors?.data?.errors?.["amount"]}
                onChange={formik.handleChange}
                value={formik.values.amount}
              ></InputText>
              <InputSelect
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
                value={formik.values.classifications}
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
  );
}
