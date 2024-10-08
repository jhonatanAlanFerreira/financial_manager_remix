import {
  Account,
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
import { Loader } from "~/components/loader/loader";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as classificationLoader } from "~/routes/api/classification/index";
import { loader as expenseLoader } from "~/routes/api/expense/index";
import { loader as incomeLoader } from "~/routes/api/income/index";
import { loader as userAccountLoader } from "~/routes/api/account/index";
import { Icon } from "~/components/icon/icon";
import {
  firstDayOfCurrentMonth,
  formatDate,
  lastDayOfCurrentMonth,
  queryParamsFromObject,
  todayFormatedDate,
} from "~/utils/utilities";
import { useFormik } from "formik";
import { Pagination } from "~/components/pagination/pagination";
import { useTitle } from "~/components/top-bar/title-context";
import { TransactionFilterTagsConfig } from "~/components/page-components/transaction/transaction-filter-tags-config";
import { FilterTag } from "~/components/filter-tag/filter-tag";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { TransactionAdd } from "~/components/page-components/transaction/transaction-add";
import { TransactionFilters } from "~/components/page-components/transaction/transaction-filters";
import {
  TransactionFiltersFormInterface,
  TransactionFormInterface,
  TransactionsWithTotalsInterface,
} from "~/components/page-components/transaction/transaction-interfaces";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { ValidatedDataInterface } from "~/shared/validated-data-interface";

export default function Transactions() {
  const { setTitle } = useTitle();

  const [loading, setLoading] = useState<boolean>(true);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [skipEffect, setSkipEffect] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [reloadTransactions, setReloadTransactions] = useState<boolean>(false);
  const [totalIncomeValue, setTotalIncomeValue] = useState<number>(0);
  const [totalExpenseValue, setTotalExpenseValue] = useState<number>(0);

  const [transactions, setTransactions] = useState<
    ServerResponseInterface<TransactionsWithTotalsInterface>
  >({});
  const [classifications, setClassifications] = useState<
    ServerResponseInterface<TransactionClassification[]>
  >({});
  const [companies, setCompanies] = useState<
    ServerResponseInterface<Company[]>
  >({});
  const [incomes, setIncomes] = useState<ServerResponseInterface<Income[]>>({});
  const [expenses, setExpenses] = useState<ServerResponseInterface<Expense[]>>(
    {}
  );
  const [accounts, setAccounts] = useState<ServerResponseInterface<Account[]>>(
    {}
  );

  const [responseErrors, setResponseErrors] = useState<
    ServerResponseInterface<ValidatedDataInterface>
  >({});

  const {
    companyData,
    transactionData,
    expenseData,
    classificationData,
    incomeData,
    userAccountData,
  } = useLoaderData<{
    companyData: ServerResponseInterface<Company[]>;
    transactionData: ServerResponseInterface<TransactionsWithTotalsInterface>;
    expenseData: ServerResponseInterface<Expense[]>;
    classificationData: ServerResponseInterface<TransactionClassification[]>;
    incomeData: ServerResponseInterface<Income[]>;
    userAccountData: ServerResponseInterface<Account[]>;
  }>();

  const mainForm = useFormik<TransactionFormInterface>({
    initialValues: {
      id: "",
      is_income: false,
      company: null,
      expense: null,
      account: null,
      transaction_date: todayFormatedDate(),
      amount: 0,
      classifications: [],
      is_personal_transaction: false,
      income: null,
      name: "",
    },
    onSubmit: () => {},
  });

  const filterForm = useFormik<TransactionFiltersFormInterface>({
    initialValues: {
      name: "",
      is_personal_or_company: "all",
      is_income_or_expense: "all",
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
    setCurrentPage(1);
    setTitle({
      pageTitle: "Transactions",
      pageTooltipMessage:
        "Record your transactions here. Select an income or expense type and apply the appropriate classification from the types you’ve set up.",
    });

    return () => {
      setTitle({ pageTitle: "" });
    };
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
    if (userAccountData) {
      setAccounts(userAccountData);
    }
    if (transactionData) {
      setCurrentPage(transactionData.pageInfo?.currentPage || 0);
      setTotalPages(transactionData.pageInfo?.totalPages || 0);
      setTransactions(transactionData);
    }
    if (incomeData) {
      setIncomes(incomeData);
    }

    setLoading(false);
  }, [
    companyData,
    transactionData,
    expenseData,
    classificationData,
    userAccountData,
  ]);

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
      loadTransactions();
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
      const res = await axios.get<
        ServerResponseInterface<TransactionsWithTotalsInterface>
      >(
        `/api/transaction?${searchParams}${
          searchParams ? "&" : ""
        }${paginationParams()}`
      );

      const { data } = res;

      setTransactions(data);

      setTotalPages(data.pageInfo?.totalPages || 1);
      setCurrentPage(data.pageInfo?.currentPage || 1);

      setTotalExpenseValue(data.data?.totalExpenseValue || 0);
      setTotalIncomeValue(data.data?.totalIncomeValue || 0);

      setLoading(false);

      if (!data.data?.transactions.length) {
        setCurrentPage(res.data.pageInfo?.totalPages || 1);
      }
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
        success: (res: AxiosResponse<ServerResponseInterface>) => {
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
    loadTransactions();
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: currentPage,
      pageSize: 10,
    } as any).toString();
  };

  const removeTransaction = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    toast.promise(
      axios.delete(`/api/transaction?transactionId=${mainForm.values.id}`),
      {
        loading: "Deleting transaction",
        success: (res: AxiosResponse<ServerResponseInterface>) => {
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
      account:
        accounts.data?.find(
          (account) => account.id == transaction.account_id
        ) || null,
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
          {TransactionFilterTagsConfig.map(
            (config, index) =>
              !!filterForm.values[config.fieldName] && (
                <FilterTag
                  fieldName={config.fieldName}
                  closeBtn={config.closeBtn}
                  onClose={(fieldName) => {
                    filterForm.setFieldValue(fieldName, "");
                    setReloadTransactions(true);
                  }}
                  className="ml-2 mb-2"
                  label={config.label}
                  value={config.getValue(filterForm.values[config.fieldName])}
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
            {!transactions.data?.transactions.length && (
              <tr>
                <td className="py-2 px-4" colSpan={4}>
                  There are no data yet
                </td>
              </tr>
            )}
            {transactions.data?.transactions.map((transaction, index) => (
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

      <div
        title="Total incomes and expenses using the current filters"
        className="w-100 text-right px-10 pt-2 text-violet-900 text-lg"
      >
        <span className="mr-4">
          Income Total: <span className="text-black">{totalIncomeValue}</span>
        </span>
        <span>
          Expense Total: <span className="text-black">{totalExpenseValue}</span>
        </span>
      </div>

      {totalPages > 1 && (
        <Pagination
          className="justify-center"
          currentPage={currentPage}
          totalPages={totalPages}
          optionsAmount={10}
          onPageChange={setCurrentPage}
        ></Pagination>
      )}

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
            onClick={removeTransaction}
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
          setSkipEffect={setSkipEffect}
          formik={mainForm}
          onModalCancel={() => setOpenAddModal(false)}
          accounts={accounts.data || []}
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
          <TransactionFilters
            companies={companies.data || []}
            expenses={expenses.data || []}
            incomes={incomes.data || []}
            formik={filterForm}
            onSubmit={onFilterFormSubmit}
          ></TransactionFilters>
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
    incomeLoader(request),
    userAccountLoader(request),
  ]);

  return {
    companyData: res[0],
    expenseData: res[1],
    classificationData: res[2],
    incomeData: res[3],
    userAccountData: res[4],
  };
}
