import {
  Company,
  Expense,
  Income,
  Transaction,
  TransactionClassification,
} from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "react-responsive-modal";
import DangerButton from "~/components/buttons/danger-button/DangerButton";
import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import Loader from "~/components/loader/Loader";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as classificationLoader } from "~/routes/api/classification/index";
import { loader as expenseLoader } from "~/routes/api/expense/index";
import { loader as transactionLoader } from "~/routes/api/transaction/index";
import { loader as incomeLoader } from "~/routes/api/income/index";
import Icon from "~/components/icon/Icon";
import {
  firstDayOfCurrentMonth,
  formatDate,
  lastDayOfCurrentMonth,
  queryParamsFromObject,
  todayFormatedDate,
} from "~/utilities";
import { useFormik } from "formik";
import { TransactionForm } from "~/interfaces/forms/transaction/TransactionForm";
import { TransactionFiltersForm } from "~/interfaces/forms/transaction/TransactionFiltersForm";
import TransactionsFilters from "~/components/pageComponents/transactions/TransactionsFilters";
import TransactionAdd from "~/components/pageComponents/transactions/TransactionAdd";
import FilterTag from "~/components/filterTag/FilterTag";
import { FilterTagsConfig } from "~/interfaces/pageComponents/transactions/FilterTagsConfig";
import Pagination from "~/components/pagination/Pagination";

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skipEffect, setSkipEffect] = useState(false);
  const [searchParams, setSearchParams] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadTransactions, setReloadTransactions] = useState(false);

  const [transactions, setTransactions] = useState<
    ServerResponse<Transaction[]>
  >({});
  const [classifications, setClassifications] = useState<
    ServerResponse<TransactionClassification[]>
  >({});
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [incomes, setIncomes] = useState<ServerResponse<Income[]>>({});
  const [expenses, setExpenses] = useState<ServerResponse<Expense[]>>({});

  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
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

  const mainForm = useFormik<TransactionForm>({
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

  const filterForm = useFormik<TransactionFiltersForm>({
    initialValues: {
      name: "",
      is_personal_transaction: false,
      is_income_transaction: false,
      company: null,
      expense: null,
      income: null,
      date_after: firstDayOfCurrentMonth(),
      date_before: lastDayOfCurrentMonth(),
      amount_greater: 0,
      amount_less: 0,
    },
    onSubmit: () => {
      loadTransactions();
      setOpenFilterModal(false);
    },
  });

  useEffect(() => {
    buildSearchParamsUrl();
  }, []);

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
      setCurrentPage(transactionData.pageInfo?.currentPage || 0);
      setTotalPages(transactionData.pageInfo?.totalData || 0);
      setTransactions(transactionData);
    }
    if (incomeData) {
      setIncomes(incomeData);
    }

    setLoading(false);
  }, [companyData, transactionData, expenseData, classificationData]);

  useEffect(() => {
    if (currentPage) {
      loadTransactions();
    }
  }, [currentPage]);

  useEffect(() => {
    buildSearchParamsUrl();
  }, [filterForm.values]);

  useEffect(() => {
    if (reloadTransactions) {
      setReloadTransactions(false);
      if (currentPage != 1) {
        setCurrentPage(1);
      } else {
        loadTransactions();
      }
    }
  }, [searchParams]);

  const buildSearchParamsUrl = () => {
    setSearchParams(
      queryParamsFromObject(filterForm.values, {
        company: "id",
        expense: "id",
        income: "id",
      })
    );
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

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ServerResponse<Transaction[]>>(
        `/api/transaction?${searchParams}${
          searchParams ? "&" : ""
        }${paginationParams()}`
      );
      setTransactions(res.data);
      setTotalPages(res.data.pageInfo?.totalPages || 0);
      setCurrentPage(res.data.pageInfo?.currentPage || 1);
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

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    if (mainForm.values.is_income) {
      formData.set("is_income", "on");
    }

    let axiosRequest;
    let loadingMessage;

    if (mainForm.values.id) {
      axiosRequest = axios.patch(
        `/api/transaction?transactionId=${mainForm.values.id}`,
        formData
      );
      loadingMessage = "Updating transaction";
    } else {
      axiosRequest = axios.post("/api/transaction", formData);
      loadingMessage = "Creating transaction";
    }

    mainForm.resetForm();
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

  const onFilterFormSubmit = async () => {
    setOpenFilterModal(false);
    if (currentPage != 1) {
      setCurrentPage(1);
    } else {
      loadTransactions();
    }
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: currentPage,
    } as any).toString();
  };

  const removeTransaction = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    toast.promise(
      axios.delete(`/api/transaction?transactionId=${mainForm.values.id}`),
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

  const onClickAdd = () => {
    mainForm.resetForm();
    setOpenAddModal(true);
  };

  const onClickUpdate = (transaction: Transaction) => {
    setFormValues(transaction);
    setOpenAddModal(true);
  };

  const onClickDelete = (transaction: Transaction) => {
    mainForm.setFieldValue("id", transaction.id);
    setOpenRemoveModal(true);
  };

  const setFormValues = (transaction: Transaction) => {
    setSkipEffect(true);
    mainForm.setValues({
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

  return (
    <Loader loading={loading}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap justify-center">
          <div
            onClick={() => setOpenFilterModal(true)}
            className="flex cursor-pointer text-violet-950 transform transition-transform duration-300 hover:scale-110"
          >
            <Icon size={30} name="Filter"></Icon>
            Filters
          </div>
          {FilterTagsConfig.map(
            (filter, index) =>
              !!filterForm.values[filter.fieldName] && (
                <FilterTag
                  fieldName={filter.fieldName}
                  onClose={(fieldName) => {
                    filterForm.setFieldValue(fieldName, "");
                    setReloadTransactions(true);
                  }}
                  className="ml-2 mb-2"
                  label={filter.label}
                  value={filter.getValue(filterForm.values[filter.fieldName])}
                  key={index}
                ></FilterTag>
              )
          )}
        </div>
        <PrimaryButton
          onClick={onClickAdd}
          text="Add"
          iconName="PlusCircle"
        ></PrimaryButton>
      </div>
      <div className="overflow-x-auto px-10">
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
                    getCompanyNameFromTransaction(transaction)
                      ? ""
                      : "opacity-50"
                  }`}
                >
                  {getCompanyNameFromTransaction(transaction) || "Not set"}
                </td>
                <td
                  className={`py-2 px-4 border-b border-r ${
                    getExpenseNameFromTransaction(transaction)
                      ? ""
                      : "opacity-50"
                  }`}
                >
                  {getExpenseNameFromTransaction(transaction) || "Not set"}
                </td>
                <td
                  className={`py-2 px-4 border-b border-r ${
                    getIncomeNameFromTransaction(transaction)
                      ? ""
                      : "opacity-50"
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
                    className="cursor-pointer transition-transform  transform hover:scale-110"
                  ></Icon>{" "}
                  <Icon
                    onClick={() => onClickDelete(transaction)}
                    name="Trash"
                    className="cursor-pointer transition-transform  transform hover:scale-110"
                    color="red"
                  ></Icon>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        className="justify-center"
        currentPage={currentPage}
        totalPages={totalPages}
        optionsAmount={10}
        onPageChange={(page) => setCurrentPage(page)}
      ></Pagination>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-1/3",
        }}
        center
        showCloseIcon={false}
        open={openRemoveModal}
        onClose={() => setOpenRemoveModal(false)}
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
          modal: "p-0 m-0 w-full sm:w-3/4 max-h-95vh",
        }}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          {mainForm.values.id ? "Update transaction" : "Add new transaction"}
        </h2>
        <TransactionAdd
          skipEffect={skipEffect}
          setSkipEffect={(value) => setSkipEffect(value)}
          formik={mainForm}
          onModalCancel={() => setOpenAddModal(false)}
          classifications={classifications.data || []}
          companies={companies.data || []}
          expenses={expenses.data || []}
          incomes={incomes.data || []}
          isSubmitting={isSubmitting}
          onSubmit={formSubmit}
          responseErrors={responseErrors}
        ></TransactionAdd>
      </Modal>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-1/3",
        }}
        center
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
        open={openFilterModal}
        onClose={() => setOpenFilterModal(false)}
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Filters
        </h2>
        <div className="p-4">
          <TransactionsFilters
            companies={companies.data || []}
            expenses={expenses.data || []}
            incomes={incomes.data || []}
            formik={filterForm}
            onSubmit={onFilterFormSubmit}
          ></TransactionsFilters>
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
