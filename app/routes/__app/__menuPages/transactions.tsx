import {
  Company,
  Expense,
  Income,
  Transaction,
  TransactionClassification,
} from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "react-responsive-modal";
import DangerButton from "~/components/buttons/danger-button/DangerButton";
import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import InputSelect from "~/components/inputs/inputSelect/InputSelect";
import InputText from "~/components/inputs/inputText/InputText";
import Loader from "~/components/loader/Loader";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as classificationLoader } from "~/routes/api/classification/index";
import { loader as expenseLoader } from "~/routes/api/expense/index";
import { loader as transactionLoader } from "~/routes/api/transaction/index";
import { loader as incomeLoader } from "~/routes/api/income/index";
import Icon from "~/components/icon/Icon";
import { formatDate, todayFormatedDate } from "~/utilities";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import Checkbox from "~/components/inputs/checkbox/Checkbox";
import { useFormik } from "formik";
import { TransactionForm } from "~/interfaces/forms/TransactionForm";

export default function Transactions() {
  const [loading, setLoading] = useState<boolean>(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [skipEffect, setSkipEffect] = useState(false);
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [incomes, setIncomes] = useState<ServerResponse<Income[]>>({});
  const [classifications, setClassifications] = useState<
    ServerResponse<TransactionClassification[]>
  >({});
  const [expenses, setExpenses] = useState<ServerResponse<Expense[]>>({});
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [filteredClassifications, setFilteredClassifications] = useState<
    TransactionClassification[]
  >([]);
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [transactions, setTransactions] = useState<
    ServerResponse<Transaction[]>
  >({});

  const {
    companyData,
    transactionData,
    expenseData,
    classificationData,
    incomeData,
  } = useLoaderData<{
    companyData: ServerResponse<Company[]>;
    transactionData: ServerResponse<Transaction[]>;
    expenseData: ServerResponse<Expense[]>;
    classificationData: ServerResponse<TransactionClassification[]>;
    incomeData: ServerResponse<Income[]>;
  }>();

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;
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

  const formik = useFormik<TransactionForm>({
    initialValues: {
      id: "",
      is_income: false,
      company: null,
      expense: null,
      transaction_date: todayFormatedDate(),
      amount: 0,
      classifications: [],
      is_personal_transaction: false,
      income: null,
      name: "",
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData);
    }
    if (classificationData) {
      setClassifications(classificationData);
    }
    if (expenseData) {
      setExpenses(expenseData);
    }
    if (transactionData) {
      setTransactions(transactionData);
    }
    if (incomeData) {
      setIncomes(incomeData);
    }

    setLoading(false);
  }, [companyData, transactionData, expenseData, classificationData]);

  useEffect(() => {
    if (skipEffect) return setSkipEffect(false);
    formik.setFieldValue("expense", null);
    formik.setFieldValue("income", null);
    formik.setFieldValue("classifications", null);
    runFilters();
  }, [formik.values.company]);

  useEffect(() => {
    if (skipEffect) return setSkipEffect(false);
    formik.setFieldValue("company", null);
    formik.setFieldValue("expense", null);
    formik.setFieldValue("income", null);
    formik.setFieldValue("classifications", null);
    runFilters();
  }, [formik.values.is_personal_transaction]);

  useEffect(() => {
    if (skipEffect) return setSkipEffect(false);
    runFilters();
  }, [formik.values.is_income]);

  useEffect(() => {
    if (skipEffect) return setSkipEffect(false);
    if (formik.values.income?.name)
      formik.setFieldValue("name", formik.values.income.name);
    if (formik.values.income?.amount)
      formik.setFieldValue("amount", formik.values.income.amount);
  }, [formik.values.income]);

  useEffect(() => {
    if (skipEffect) return setSkipEffect(false);
    if (formik.values.expense?.name)
      formik.setFieldValue("name", formik.values.expense.name);
    if (formik.values.expense?.amount)
      formik.setFieldValue("amount", formik.values.expense.amount);
  }, [formik.values.expense]);

  useEffect(() => {
    if (openAddModal) runFilters();
  }, [openAddModal]);

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    if (formik.values.is_income) formData.set("is_income", "on");

    let axiosRequest;
    let loadingMessage;

    if (formik.values.id) {
      axiosRequest = axios.patch(
        `/api/transaction?transactionId=${formik.values.id}`,
        formData
      );
      loadingMessage = "Updating transaction";
    } else {
      axiosRequest = axios.post("/api/transaction", formData);
      loadingMessage = "Creating transaction";
    }

    formik.resetForm();
    setIsSubmitting(true);

    toast
      .promise(axiosRequest, {
        loading: loadingMessage,
        success: (res: AxiosResponse<ServerResponse>) => {
          setOpenAddModal(false);
          loadTransactions();
          setResponseErrors({});
          return res.data.message as string;
        },
        error: (error) => {
          if (isAxiosError(error)) {
            setResponseErrors(error.response?.data);
            return (
              error.response?.data.message ||
              "Sorry, unexpected error. Be back soon"
            );
          }
          return "Sorry, unexpected error. Be back soon";
        },
      })
      .finally(() => {
        setTimeout(() => setIsSubmitting(false), 500);
      });
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/transaction");
      setTransactions(res.data);
      setLoading(false);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(
          error.response?.data.message ||
            "Sorry, unexpected error. Be back soon"
        );
      } else {
        toast.error("Sorry, unexpected error. Be back soon");
      }
      setLoading(false);
    }
  };

  const getCompanyNameFromTransaction = (transaction: Transaction) => {
    return companies?.data?.find((c) => c.id == transaction.company_id)?.name;
  };
  const getExpenseNameFromTransaction = (transaction: Transaction) => {
    return expenses?.data?.find((e) => e.id == transaction.expense_id)?.name;
  };
  const getIncomeNameFromTransaction = (transaction: Transaction) => {
    return incomes?.data?.find((e) => e.id == transaction.income_id)?.name;
  };

  const getTransactionType = (transaction: Transaction) => {
    return transaction.is_personal_transaction
      ? "Personal Transaction"
      : "Company Transaction";
  };

  const removeTransaction = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    toast.promise(
      axios.delete(`/api/transaction?transactionId=${formik.values.id}`),
      {
        loading: "Deleting transaction",
        success: (res: AxiosResponse<ServerResponse>) => {
          loadTransactions();
          return res.data.message as string;
        },
        error: (error) => {
          if (isAxiosError(error)) {
            setLoading(false);
            return (
              error.response?.data.message ||
              "Sorry, unexpected error. Be back soon"
            );
          }
          return "Sorry, unexpected error. Be back soon";
        },
      }
    );
  };

  const filterExpenses = () => {
    if (expenses.data) {
      setFilteredExpenses(
        expenses.data.filter((expense) => {
          const expenseTypeFilter = formik.values.is_personal_transaction
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

  const filterClassifications = () => {
    if (classifications.data) {
      setFilteredClassifications(
        classifications.data.filter((classification) => {
          const expenseTypeFilter = formik.values.is_personal_transaction
            ? classification.is_personal_transaction_classification
            : true;

          const companyFilter =
            !formik.values.company ||
            classification.company_ids.includes(formik.values.company.id);

          const isIncomeFilter = formik.values.is_income
            ? classification.is_income
            : !classification.is_income;
          return expenseTypeFilter && companyFilter && isIncomeFilter;
        })
      );
    }
  };

  const filterIncomes = () => {
    if (incomes.data) {
      setFilteredIncomes(
        incomes.data.filter((income) => {
          const incomeTypeFilter = formik.values.is_personal_transaction
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

  const runFilters = () => {
    filterClassifications();
    filterExpenses();
    filterIncomes();
  };

  const onClickAdd = () => {
    formik.resetForm();
    setOpenAddModal(true);
  };

  const onClickUpdate = (transaction: Transaction) => {
    setFormValues(transaction);
    setOpenAddModal(true);
  };

  const onClickDelete = (transaction: Transaction) => {
    formik.setFieldValue("id", transaction.id);
    setOpenRemoveModal(true);
  };

  const setFormValues = (transaction: Transaction) => {
    setSkipEffect(true);
    formik.setValues({
      id: transaction.id,
      amount: transaction.amount,
      is_income: transaction.is_income,
      is_personal_transaction: transaction.is_personal_transaction,
      name: transaction.name,
      transaction_date: transaction.transaction_date,
      classifications:
        classifications.data?.filter((classification) =>
          transaction.transaction_classification_ids.includes(classification.id)
        ) || [],
      company:
        companies.data?.find(
          (company) => company.id == transaction.company_id
        ) || null,
      expense:
        expenses.data?.find(
          (expense) => expense.id == transaction.expense_id
        ) || null,
      income:
        incomes.data?.find((income) => income.id == transaction.income_id) ||
        null,
    });
  };

  const onTabSelect = (tabSelected: number) => {
    formik.setFieldValue("classifications", null);
    formik.setFieldValue("is_income", !!tabSelected);
  };

  const onModalCancel = () => {
    formik.resetForm();
    setOpenAddModal(false);
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

  return (
    <Loader loading={loading}>
      <div className="flex justify-end mb-2">
        <PrimaryButton
          onClick={onClickAdd}
          text="Add"
          iconName="PlusCircle"
        ></PrimaryButton>
      </div>
      <table className="min-w-full bg-white border border-gray-300 text-violet-900">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b border-r">Name</th>
            <th className="py-2 px-4 border-b border-r">Type</th>
            <th className="py-2 px-4 border-b border-r">Company</th>
            <th className="py-2 px-4 border-b border-r">Expense</th>
            <th className="py-2 px-4 border-b border-r">Income</th>
            <th className="py-2 px-4 border-b border-r">Date</th>
            <th className="py-2 px-4 border-b border-r">Amount</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {!transactions.data?.length && (
            <tr>
              <td className="py-2 px-4" colSpan={4}>
                There are no data yet
              </td>
            </tr>
          )}
          {transactions.data?.map((transaction, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b border-r">
                {transaction.name}
              </td>
              <td className="py-2 px-4 border-b border-r">
                {getTransactionType(transaction)}
              </td>
              <td
                className={`py-2 px-4 border-b border-r ${
                  getCompanyNameFromTransaction(transaction) ? "" : "opacity-50"
                }`}
              >
                {getCompanyNameFromTransaction(transaction) || "Not set"}
              </td>
              <td
                className={`py-2 px-4 border-b border-r ${
                  getExpenseNameFromTransaction(transaction) ? "" : "opacity-50"
                }`}
              >
                {getExpenseNameFromTransaction(transaction) || "Not set"}
              </td>
              <td
                className={`py-2 px-4 border-b border-r ${
                  getIncomeNameFromTransaction(transaction) ? "" : "opacity-50"
                }`}
              >
                {getIncomeNameFromTransaction(transaction) || "Not set"}
              </td>

              <td className="py-2 px-4 border-b border-r">
                {formatDate(transaction.transaction_date)}
              </td>
              <td className="py-2 px-4 border-b border-r">
                {transaction.amount}
              </td>
              <td className="flex justify-center gap-5 py-2 px-4 border-b">
                <Icon
                  onClick={() => onClickUpdate(transaction)}
                  name="Edit"
                  className="cursor-pointer"
                ></Icon>{" "}
                <Icon
                  onClick={() => onClickDelete(transaction)}
                  name="Trash"
                  className="cursor-pointer"
                  color="red"
                ></Icon>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-1/3",
        }}
        center
        showCloseIcon={false}
        open={openRemoveModal}
        onClose={() => setOpenAddModal(false)}
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Atention
        </h2>
        <p className="text-center text-violet-950 text-xl pt-2">
          Do you really want to remove this transaction?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setOpenRemoveModal(false)}
          ></PrimaryButton>
          <DangerButton
            disabled={loading}
            text="Remove"
            onClick={() => removeTransaction()}
          ></DangerButton>
        </div>
      </Modal>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-3/4 overflow-visible",
        }}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          {formik.values.id ? "Update transaction" : "Add new transaction"}
        </h2>
        <div>
          <Tabs
            onSelect={(event: number) => onTabSelect(event)}
            defaultIndex={!!formik.values.is_income ? 1 : 0}
          >
            <TabList className="mb-2">
              <div className="flex justify-around">
                <Tab
                  disabled={!!formik.values.id && !!formik.values.is_income}
                  selectedClassName="bg-violet-900 text-white"
                  disabledClassName="opacity-50 pointer-events-none"
                  className="w-full text-center cursor-pointer p-2 text-violet-950"
                >
                  Expense Transaction
                </Tab>
                <div className="border-r-2"></div>
                <Tab
                  disabled={!!formik.values.id && !formik.values.is_income}
                  selectedClassName="bg-violet-900 text-white"
                  disabledClassName="opacity-50 pointer-events-none"
                  className="w-full text-center cursor-pointer p-2 text-violet-950"
                >
                  Income Transaction
                </Tab>
              </div>
            </TabList>
            <TabPanel>
              <div className="p-4">
                <Form
                  method="post"
                  id="classification-form"
                  onSubmit={formSubmit}
                >
                  {!formik.values.is_personal_transaction && (
                    <InputSelect
                      isClearable
                      className="mb-8"
                      placeholder="Company"
                      options={companies?.data}
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
                      onClassificationsChange(
                        event as TransactionClassification[]
                      )
                    }
                    value={formik.values.classifications}
                  ></InputSelect>
                  <div className="mb-6">
                    <Checkbox
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
                </Form>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="p-4">
                <Form
                  method="post"
                  id="classification-form"
                  onSubmit={formSubmit}
                >
                  {!formik.values.is_personal_transaction && (
                    <InputSelect
                      isClearable
                      className="mb-8"
                      placeholder="Company"
                      options={companies?.data}
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
                      onClassificationsChange(
                        event as TransactionClassification[]
                      )
                    }
                    value={formik.values.classifications}
                  ></InputSelect>
                  <div className="mb-6">
                    <Checkbox
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
      </Modal>
    </Loader>
  );
}

export async function loader(request: LoaderFunctionArgs) {
  const res = await Promise.all([
    companyLoader(request),
    expenseLoader(request),
    classificationLoader(request),
    transactionLoader(request),
    incomeLoader(request),
  ]);

  return {
    companyData: res[0],
    expenseData: res[1],
    classificationData: res[2],
    transactionData: res[3],
    incomeData: res[4],
  };
}
