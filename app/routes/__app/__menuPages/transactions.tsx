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

export default function Transactions() {
  const [loading, setLoading] = useState<boolean>(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [incomes, setIncomes] = useState<ServerResponse<Income[]>>({});
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [isPersonalTransaction, setIsPersonalTransaction] = useState(false);
  const [companySelectedId, setCompanySelectedId] = useState<string | null>();
  const [isIncome, setIsIncome] = useState<boolean>(false);
  const [expenseSelected, setExpenseSelected] = useState<Expense | null>();
  const [incomeSelected, setIncomeSelected] = useState<Income | null>();
  const [transactionName, setTransactionName] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
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
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>();
  const [transactionToUpdate, setTransactionToUpdate] =
    useState<Transaction | null>();

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
    filterExpenses();
    filterIncomes();
    filterClassifications();
  }, [isPersonalTransaction, expenses, companySelectedId, isIncome]);

  useEffect(() => {
    setCompanySelectedId(transactionToUpdate?.company_id);
    setExpenseSelected(
      expenses.data?.find(
        (expense) => expense.id == transactionToUpdate?.expense_id
      )
    );
    setIncomeSelected(
      incomes.data?.find(
        (income) => income.id == transactionToUpdate?.income_id
      )
    );
    setAmount(transactionToUpdate?.amount || 0);
    setTransactionName(transactionToUpdate?.name || "");
  }, [transactionToUpdate]);

  const onExpenseChange = (expense: Expense) => {
    setTransactionName(expense?.name || "");
    setAmount(expense?.amount || 0);
    setExpenseSelected(expense);
  };

  const onIncomeChange = (income: Income) => {
    setTransactionName(income?.name || "");
    setAmount(income?.amount || 0);
    setIncomeSelected(income);
  };

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    let axiosRequest;
    let loadingMessage;

    if (formData.get("id")) {
      axiosRequest = axios.patch(
        `/api/transaction?transactionId=${transactionToUpdate?.id}`,
        formData
      );
      loadingMessage = "Updating transaction";
    } else {
      axiosRequest = axios.post("/api/transaction", formData);
      loadingMessage = "Creating transaction";
    }

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
        setTransactionToUpdate(null);
        setTimeout(() => setIsSubmitting(false), 500);
      });
  };

  const onClickAdd = () => {
    setExpenseSelected(null);
    setTransactionToUpdate(null);
    setIsPersonalTransaction(false);
    setAmount(0);
    setTransactionName("");
    setOpenAddModal(true);
  };

  const onClickUpdate = (transaction: Transaction) => {
    setTransactionToUpdate(transaction);
    setIsPersonalTransaction(transaction.is_personal_transaction);
    setOpenAddModal(true);
  };

  const onTabSelect = (tabSelected: number) => {
    setIsIncome(!!tabSelected);
    setIsPersonalTransaction(!!transactionToUpdate?.is_personal_transaction);
    setCompanySelectedId(null);
  };

  const onIsPersonalTransactionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsPersonalTransaction(event.target.checked);
    setCompanySelectedId(
      event.target.checked ? null : transactionToUpdate?.company_id
    );
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
    if (transactionToDelete) {
      setOpenRemoveModal(false);
      setLoading(true);

      toast.promise(
        axios.delete(
          `/api/transaction?transactionId=${transactionToDelete.id}`
        ),
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
    }
  };

  const filterExpenses = () => {
    if (expenses.data) {
      setFilteredExpenses(
        expenses.data.filter((expense) => {
          const expenseTypeFilter = isPersonalTransaction
            ? expense.is_personal_expense
            : true;

          const companyFilter =
            !companySelectedId ||
            expense.company_ids.includes(companySelectedId);

          return expenseTypeFilter && companyFilter;
        })
      );
    }
  };

  const filterClassifications = () => {
    if (classifications.data) {
      setFilteredClassifications(
        classifications.data.filter((classification) => {
          const expenseTypeFilter = isPersonalTransaction
            ? classification.is_personal_transaction_classification
            : true;

          const companyFilter =
            !companySelectedId ||
            classification.company_ids.includes(companySelectedId);

          const isIncomeFilter = isIncome
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
          const incomeTypeFilter = isPersonalTransaction
            ? income.is_personal_income
            : true;

          const companyFilter =
            !companySelectedId ||
            income.company_ids.includes(companySelectedId);

          return incomeTypeFilter && companyFilter;
        })
      );
    }
  };

  const onModalCancel = () => {
    setOpenAddModal(false);
    setTransactionToUpdate(null);
  };

  const onCompanyChange = (company: Company) => {
    setCompanySelectedId(company.id);
    setExpenseSelected(null);
    setIncomeSelected(null);
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
                  onClick={() => {
                    setTransactionToDelete(transaction);
                    setOpenRemoveModal(true);
                  }}
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
          {transactionToUpdate ? "Update transaction" : "Add new transaction"}
        </h2>
        <div>
          <Tabs
            onSelect={(event: number) => onTabSelect(event)}
            defaultIndex={!!transactionToUpdate?.is_income ? 1 : 0}
          >
            <TabList className="mb-2">
              <div className="flex justify-around">
                <Tab
                  disabled={
                    !!transactionToUpdate && !!transactionToUpdate?.is_income
                  }
                  selectedClassName="bg-violet-900 text-white"
                  disabledClassName="opacity-50 pointer-events-none"
                  className="w-full text-center cursor-pointer p-2 text-violet-950"
                >
                  Expense Transaction
                </Tab>
                <div className="border-r-2"></div>
                <Tab
                  disabled={
                    !!transactionToUpdate && !transactionToUpdate?.is_income
                  }
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
                  <input
                    type="text"
                    name="id"
                    hidden
                    defaultValue={transactionToUpdate?.id}
                  />
                  <input
                    type="checkbox"
                    name="is_income"
                    hidden
                    defaultChecked={false}
                  />
                  <div className="mb-6">
                    <Checkbox
                      onChange={(event) => onIsPersonalTransactionChange(event)}
                      name="is_personal_transaction"
                      id="is_personal_transaction"
                      defaultChecked={
                        transactionToUpdate?.is_personal_transaction
                      }
                    ></Checkbox>
                    <label
                      className="pl-3 text-violet-950 cursor-pointer"
                      htmlFor="is_personal_transaction"
                    >
                      Personal transaction
                    </label>
                  </div>
                  {!isPersonalTransaction && (
                    <InputSelect
                      onChange={(event) => onCompanyChange(event as Company)}
                      isClearable
                      className="mb-8"
                      placeholder="Company"
                      options={companies?.data}
                      getOptionLabel={getSelectCompanyOptionLabel as any}
                      getOptionValue={getSelectCompanyOptionValue as any}
                      name="company"
                      defaultValue={companies.data?.find(
                        (company) =>
                          company.id == transactionToUpdate?.company_id
                      )}
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
                    value={expenseSelected}
                    onChange={(event) => onExpenseChange(event as Expense)}
                  ></InputSelect>
                  <InputText
                    label="Name *"
                    name="name"
                    required
                    value={transactionName}
                    onChange={(event) => setTransactionName(event.target.value)}
                  ></InputText>
                  <InputText
                    label="Date *"
                    name="transaction_date"
                    type="date"
                    required
                    defaultValue={
                      transactionToUpdate?.transaction_date ||
                      todayFormatedDate()
                    }
                  ></InputText>
                  <InputText
                    label="Amount *"
                    name="amount"
                    type="number"
                    step={0.01}
                    min={0.01}
                    required
                    value={amount}
                    onChange={(event) => setAmount(+event.target.value)}
                    errorMessage={responseErrors?.data?.errors?.["amount"]}
                  ></InputText>
                  <InputSelect
                    isClearable
                    className="mb-8"
                    placeholder="Classification"
                    options={filteredClassifications}
                    getOptionLabel={getSelectClassificationOptionLabel as any}
                    getOptionValue={getSelectClassificationOptionValue as any}
                    isMulti
                    name="classification_ids"
                    defaultValue={classificationData?.data?.filter(
                      (classification) =>
                        transactionToUpdate?.transaction_classification_ids.includes(
                          classification.id
                        )
                    )}
                  ></InputSelect>
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
                  <input
                    type="text"
                    name="id"
                    hidden
                    defaultValue={transactionToUpdate?.id}
                  />
                  <input
                    type="checkbox"
                    name="is_income"
                    hidden
                    defaultChecked={true}
                  />
                  <div className="mb-6">
                    <Checkbox
                      onChange={(event) => onIsPersonalTransactionChange(event)}
                      name="is_personal_transaction"
                      id="is_personal_transaction"
                      defaultChecked={
                        transactionToUpdate?.is_personal_transaction
                      }
                    ></Checkbox>
                    <label
                      className="pl-3 text-violet-950 cursor-pointer"
                      htmlFor="is_personal_transaction"
                    >
                      Personal transaction
                    </label>
                  </div>
                  {!isPersonalTransaction && (
                    <InputSelect
                      onChange={(event) => onCompanyChange(event as Company)}
                      isClearable
                      className="mb-8"
                      placeholder="Company"
                      options={companies?.data}
                      getOptionLabel={getSelectCompanyOptionLabel as any}
                      getOptionValue={getSelectCompanyOptionValue as any}
                      name="company"
                      defaultValue={companies.data?.find(
                        (company) =>
                          company.id == transactionToUpdate?.company_id
                      )}
                    ></InputSelect>
                  )}
                  <InputSelect
                    isClearable
                    className="mb-8"
                    placeholder="Income"
                    options={filteredIncomes}
                    getOptionLabel={getSelectIncomeOptionLabel as any}
                    getOptionValue={getSelectIncomeOptionValue as any}
                    name="income_id"
                    value={incomeSelected}
                    onChange={(event) => onIncomeChange(event as Income)}
                  ></InputSelect>
                  <InputText
                    label="Name *"
                    name="name"
                    required
                    value={transactionName}
                    onChange={(event) => setTransactionName(event.target.value)}
                  ></InputText>
                  <InputText
                    label="Date *"
                    name="transaction_date"
                    type="date"
                    required
                    defaultValue={
                      transactionToUpdate?.transaction_date ||
                      todayFormatedDate()
                    }
                  ></InputText>
                  <InputText
                    label="Amount *"
                    name="amount"
                    type="number"
                    step={0.01}
                    min={0.01}
                    required
                    value={amount}
                    onChange={(event) => setAmount(+event.target.value)}
                    errorMessage={responseErrors?.data?.errors?.["amount"]}
                  ></InputText>
                  <InputSelect
                    isClearable
                    isMulti
                    className="mb-8"
                    placeholder="Classification"
                    options={filteredClassifications}
                    getOptionLabel={getSelectClassificationOptionLabel as any}
                    getOptionValue={getSelectClassificationOptionValue as any}
                    defaultValue={classificationData?.data?.filter(
                      (classification) =>
                        transactionToUpdate?.transaction_classification_ids.includes(
                          classification.id
                        )
                    )}
                  ></InputSelect>
                </Form>
              </div>
            </TabPanel>
          </Tabs>
          <div className="flex justify-between p-2">
            <DangerButton
              text="Cancel"
              onClick={() => onModalCancel()}
            ></DangerButton>
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
