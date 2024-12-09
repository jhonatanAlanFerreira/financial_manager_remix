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
import { loader as transactionLoader } from "~/routes/api/transaction/index";
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
} from "~/components/page-components/transaction/transaction-interfaces";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import {
  TransactionsWithTotalsInterface,
  TransactionWithRelationsInterface,
} from "~/data/transaction/transaction-types";
import { createOrUpdateTransaction } from "~/data/frontend-services/transactions";

export default function Transactions() {
  const { setTitle } = useTitle();

  const [loading, setLoading] = useState<boolean>(true);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [skipEffect, setSkipEffect] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [reloadTransactions, setReloadTransactions] = useState<boolean>(false);
  const [totalIncomeValue, setTotalIncomeValue] = useState<number>(0);
  const [totalExpenseValue, setTotalExpenseValue] = useState<number>(0);
  const [paginationState, setPaginationState] = useState<{
    reload: boolean;
    page: number;
  }>({
    reload: false,
    page: 1,
  });

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

  const [responseErrors, setResponseErrors] =
    useState<ServerResponseErrorInterface>({});

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
      date: todayFormatedDate(),
      amount: 0,
      transaction_classifications: [],
      is_personal: false,
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
      setTransactions(transactionData);
      setTotalIncomeValue(transactionData.data?.totalIncomeValue || 0);
      setTotalExpenseValue(transactionData.data?.totalExpenseValue || 0);
      setTotalPages(transactionData.pageInfo?.totalPages || 0);
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
    if (paginationState.reload) {
      loadTransactions();
    }
  }, [paginationState]);

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

  const getTransactionType = (transaction: Transaction) => {
    return transaction.is_personal
      ? "Personal Transaction"
      : "Company Transaction";
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get<
        ServerResponseInterface<TransactionsWithTotalsInterface>
      >(
        `/api/transaction?${paginationParams()}&${searchParams}&extends=company,transaction_classifications,expense,income,account`
      );

      const { data } = res;

      setTransactions(data);

      setTotalPages(data.pageInfo?.totalPages || 1);
      setPaginationState({
        reload: false,
        page: data.pageInfo?.currentPage || 1,
      });

      setTotalExpenseValue(data.data?.totalExpenseValue || 0);
      setTotalIncomeValue(data.data?.totalIncomeValue || 0);

      setLoading(false);

      if (!data.data?.transactions.length) {
        setPaginationState({
          reload: false,
          page: data.pageInfo?.totalPages || 1,
        });
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
    const formData = prepareFormData(event.currentTarget);
    setIsSubmitting(true);

    createOrUpdateTransaction(formData, {
      onSuccess: () => {
        mainForm.resetForm();
        setOpenAddModal(false);
        loadTransactions();
        setResponseErrors({});
      },
      onError: (errors) => {
        setResponseErrors(errors);
      },
      onFinally: () => {
        setTimeout(() => setIsSubmitting(false), 500);
      },
    });
  };

  const onFilterFormSubmit = async () => {
    setOpenFilterModal(false);
    if (paginationState.page == 1) {
      loadTransactions();
    } else {
      setPaginationState({ reload: true, page: 1 });
    }
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: paginationState.page,
      pageSize: 10,
    } as any).toString();
  };

  const adjustPaginationBeforeReload = () => {
    const { data } = transactions;
    const hasMinimalData = data?.transactions && data?.transactions.length < 2;

    if (paginationState.page == 1 || !hasMinimalData) {
      loadTransactions();
    } else {
      setPaginationState({ reload: true, page: paginationState.page - 1 });
    }
  };

  const removeTransaction = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    toast.promise(
      axios.delete(`/api/transaction?transactionId=${mainForm.values.id}`),
      {
        loading: "Deleting transaction",
        success: (res: AxiosResponse<ServerResponseInterface>) => {
          adjustPaginationBeforeReload();
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

  const onClickUpdate = (transaction: TransactionWithRelationsInterface) => {
    setFormValues(transaction);
    setOpenAddModal(true);
  };

  const onClickDelete = (transaction: Transaction) => {
    mainForm.setFieldValue("id", transaction.id);
    setOpenRemoveModal(true);
  };

  const setFormValues = (transaction: TransactionWithRelationsInterface) => {
    setSkipEffect(true);
    mainForm.setValues(transaction);
  };

  const prepareFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    formData.set(
      "is_personal",
      formData.get("is_personal") == "on" ? "true" : "false"
    );
    formData.set("is_income", mainForm.values.is_income ? "true" : "false");

    formData.set("id", mainForm.values.id);

    return formData;
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
                    transaction.company?.name ? "" : "opacity-50"
                  }`}
                >
                  {transaction.company?.name || "Not set"}
                </td>
                <td
                  className={`py-2 px-4 border-b border-r ${
                    transaction.expense?.name ? "" : "opacity-50"
                  }`}
                >
                  {transaction.expense?.name || "Not set"}
                </td>
                <td
                  className={`py-2 px-4 border-b border-r ${
                    transaction.income?.name ? "" : "opacity-50"
                  }`}
                >
                  {transaction.income?.name || "Not set"}
                </td>

                <td className="py-2 px-4 border-b border-r">
                  {formatDate(transaction.date)}
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
          currentPage={paginationState.page}
          totalPages={totalPages}
          optionsAmount={10}
          onPageChange={(page) => setPaginationState({ reload: true, page })}
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
  const [
    companyData,
    expenseData,
    classificationData,
    incomeData,
    userAccountData,
    transactionData,
  ] = await Promise.all([
    companyLoader(request).then((res) => res.json()),
    expenseLoader(request).then((res) => res.json()),
    classificationLoader(request).then((res) => res.json()),
    incomeLoader(request).then((res) => res.json()),
    userAccountLoader(request).then((res) => res.json()),
    transactionLoader(request, {
      page: 1,
      pageSize: 10,
      extends: [
        "account",
        "company",
        "expense",
        "income",
        "transaction_classifications",
      ],
      date_after: firstDayOfCurrentMonth(),
      date_before: lastDayOfCurrentMonth(),
    }).then((res) => res.json()),
  ]);

  return {
    companyData,
    expenseData,
    classificationData,
    incomeData,
    userAccountData,
    transactionData,
  };
}
