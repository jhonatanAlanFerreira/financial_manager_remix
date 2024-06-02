import { Company, Expense, Income } from "@prisma/client";
import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import Checkbox from "~/components/inputs/checkbox/Checkbox";
import InputSelect from "~/components/inputs/inputSelect/InputSelect";
import InputText from "~/components/inputs/inputText/InputText";
import { FiltersProps } from "~/interfaces/pageComponents/transactions/FiltersProps";

export default function TransactionsFilters({
  companies,
  expenses,
  incomes,
  formik,
  onSubmit,
}: FiltersProps) {
  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;
  const getSelectExpenseOptionValue = (option: Expense) => option.id;
  const getSelectExpenseOptionLabel = (option: Expense) => option.name;
  const getSelectIncomeOptionValue = (option: Income) => option.id;
  const getSelectIncomeOptionLabel = (option: Income) => option.name;

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
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="flex justify-end mb-5 underline decoration-red-700 text-red-700 cursor-pointer">
        <span onClick={resetForm}>Clear all filters</span>
      </div>
      <div className="border-2 border-violet-950 border-opacity-50 p-4">
        <Checkbox
          className="relative top-1"
          name="is_personal_transaction"
          id="is_personal_transaction_filter"
          onChange={formik.handleChange}
          checked={formik.values.is_personal_transaction}
        ></Checkbox>
        <label
          className="pl-3 text-violet-950 cursor-pointer"
          htmlFor="is_personal_transaction_filter"
        >
          Personal transaction
        </label>
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
      <InputSelect
        isClearable
        className="mb-8"
        placeholder="Expense"
        options={expenses}
        getOptionLabel={getSelectExpenseOptionLabel as any}
        getOptionValue={getSelectExpenseOptionValue as any}
        name="expense"
        onChange={(event) => onExpenseFilterChange(event as Expense)}
        value={formik.values.expense}
      ></InputSelect>
      <InputSelect
        isClearable
        className="mb-8"
        placeholder="Income"
        options={incomes}
        getOptionLabel={getSelectIncomeOptionLabel as any}
        getOptionValue={getSelectIncomeOptionValue as any}
        name="income"
        onChange={(event) => onIncomeFilterChange(event as Income)}
        value={formik.values.income}
      ></InputSelect>

      <div className="flex justify-end p-2 mt-10">
        <PrimaryButton text="Done" type="submit"></PrimaryButton>
      </div>
    </form>
  );
}
