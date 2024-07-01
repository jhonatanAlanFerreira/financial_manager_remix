import { Company, Expense, Income } from "@prisma/client";
import { useEffect, useState } from "react";
import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import Checkbox from "~/components/inputs/checkbox/Checkbox";
import InputSelect from "~/components/inputs/inputSelect/InputSelect";
import InputText from "~/components/inputs/inputText/InputText";
import { TransactionFiltersProps } from "~/interfaces/pageComponents/transactions/TransactionFiltersProps";

export default function TransactionsFilters({
  companies,
  expenses,
  incomes,
  formik,
  onSubmit,
}: TransactionFiltersProps) {
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [skipEffect, setSkipEffect] = useState(true);

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;
  const getSelectExpenseOptionValue = (option: Expense) => option.id;
  const getSelectExpenseOptionLabel = (option: Expense) => option.name;
  const getSelectIncomeOptionValue = (option: Income) => option.id;
  const getSelectIncomeOptionLabel = (option: Income) => option.name;

  useEffect(() => {
    runFilters();
    setSkipEffect(false);
  }, []);

  useEffect(() => {
    if (skipEffect) {
      return;
    }

    formik.setFieldValue("company", null);
    formik.setFieldValue("expense", null);
    formik.setFieldValue("income", null);

    runFilters();
  }, [formik.values.is_personal_or_company]);

  useEffect(() => {
    if (skipEffect) {
      return;
    }

    formik.setFieldValue("expense", null);
    formik.setFieldValue("income", null);

    runFilters();
  }, [formik.values.is_income_or_expense]);

  useEffect(() => {
    if (skipEffect) {
      return;
    }

    formik.setFieldValue("expense", null);
    formik.setFieldValue("income", null);

    runFilters();
  }, [formik.values.company]);

  const runFilters = () => {
    filterExpenses();
    filterIncomes();
  };

  const onCompanyFilterChange = (company: Company) => {
    formik.setFieldValue("company", company);
  };

  const onExpenseFilterChange = (expense: Expense) => {
    formik.setFieldValue("expense", expense);
  };

  const onIncomeFilterChange = (income: Income) => {
    formik.setFieldValue("income", income);
  };

  const resetForm = () => {
    formik.resetForm();
    formik.setFieldValue("company", null);
    formik.setFieldValue("expense", null);
    formik.setFieldValue("income", null);
    formik.setFieldValue("date_after", "");
    formik.setFieldValue("date_before", "");
  };

  const filterExpenses = () => {
    if (expenses) {
      setFilteredExpenses(
        expenses.filter((expense) => {
          const expenseTypeFilter =
            formik.values.is_personal_or_company == "personal"
              ? expense.is_personal_expense
              : true;

          const companyFilter =
            !formik.values.company ||
            expense.company_ids.includes(formik.values.company.id);

          return expenseTypeFilter && companyFilter;
        })
      );
    }
  };

  const filterIncomes = () => {
    if (incomes) {
      setFilteredIncomes(
        incomes.filter((income) => {
          const incomeTypeFilter =
            formik.values.is_personal_or_company == "personal"
              ? income.is_personal_income
              : true;

          const companyFilter =
            !formik.values.company ||
            income.company_ids.includes(formik.values.company.id);

          return incomeTypeFilter && companyFilter;
        })
      );
    }
  };

  const isIncomeOrExpenseChange = (e: any) => {
    formik.setFieldValue("is_income_or_expense", e.currentTarget.value);
  };

  const isPersonalOrCompanyChange = (e: any) => {
    formik.setFieldValue("is_personal_or_company", e.currentTarget.value);
  };

  return (
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
              checked={formik.values.is_income_or_expense == "all"}
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
              checked={formik.values.is_income_or_expense == "expense"}
            ></input>
            <label className="cursor-pointer ml-2" htmlFor="is_expense_filter">
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
              checked={formik.values.is_income_or_expense == "income"}
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
              checked={formik.values.is_personal_or_company == "all"}
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
              checked={formik.values.is_personal_or_company == "personal"}
            ></input>
            <label className="cursor-pointer ml-2" htmlFor="is_personal_filter">
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
              checked={formik.values.is_personal_or_company == "company"}
            ></input>
            <label className="cursor-pointer ml-2" htmlFor="is_company_filter">
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
      {formik.values.is_personal_or_company == "company" && (
        <InputSelect
          isClearable
          className="mb-8"
          placeholder="Company"
          options={companies}
          getOptionLabel={getSelectCompanyOptionLabel as any}
          getOptionValue={getSelectCompanyOptionValue as any}
          name="company"
          onChange={(event) => onCompanyFilterChange(event as Company)}
          value={formik.values.company}
        ></InputSelect>
      )}
      {formik.values.is_income_or_expense != "income" && (
        <InputSelect
          isClearable
          className="mb-8"
          placeholder="Expense"
          options={filteredExpenses}
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
          options={filteredIncomes}
          getOptionLabel={getSelectIncomeOptionLabel as any}
          getOptionValue={getSelectIncomeOptionValue as any}
          name="income"
          onChange={(event) => onIncomeFilterChange(event as Income)}
          value={formik.values.income}
        ></InputSelect>
      )}

      <div className="flex justify-end p-2 mt-10">
        <PrimaryButton
          onClick={onSubmit}
          text="Done"
          type="button"
        ></PrimaryButton>
      </div>
    </form>
  );
}
