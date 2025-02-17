import { Transaction } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import { Loader } from "~/components/loader/loader";
import { loader as transactionLoader } from "~/routes/api/transaction/index";
import { Icon } from "~/components/icon/icon";
import {
  firstDayOfCurrentMonth,
  formatDate,
  getTimezoneFromClientCookies,
  queryParamsFromObject,
  todayFormatedDate,
  useIsMobile,
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
import {
  createOrUpdateTransaction,
  deleteTransaction,
  fetchTransactions,
} from "~/data/frontend-services/transactions-service";
import { ThSort } from "~/components/th-sort/th-sort";
import { TransactionThSortConfig } from "~/components/page-components/transaction/transaction-th-sort-config";

const defaultSortKey: { sort_key: string; sort_order: "desc" | "asc" } = {
  sort_key: "date",
  sort_order: "desc",
};

export default function Transactions() {
  const isMobile = useIsMobile();
  const { setTitle } = useTitle();

  const [loading, setLoading] = useState<boolean>(true);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<string>("");
  const [sortParams, setSortParams] = useState<string>(
    queryParamsFromObject(defaultSortKey)
  );
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

  const [responseErrors, setResponseErrors] =
    useState<ServerResponseErrorInterface>({});

  const { transactionData } = useLoaderData<{
    transactionData: ServerResponseInterface<TransactionsWithTotalsInterface>;
  }>();

  const mainForm = useFormik<TransactionFormInterface>({
    initialValues: {
      id: "",
      is_income: false,
      company: null,
      expense: null,
      account: null,
      merchant: null,
      date: todayFormatedDate(),
      amount: 0,
      transaction_classifications: [],
      is_personal: false,
      income: null,
      name: "",
      description: "",
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
      merchant: null,
      has_classification: null,
      account: null,
      date_after: firstDayOfCurrentMonth(),
      date_before: "",
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
    if (transactionData) {
      setTransactions(transactionData);
      setTotalIncomeValue(transactionData.data?.totalIncomeValue || 0);
      setTotalExpenseValue(transactionData.data?.totalExpenseValue || 0);
      setTotalPages(transactionData.pageInfo?.totalPages || 0);
    }

    setLoading(false);
  }, [transactionData]);

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

  useEffect(() => {
    if (reloadTransactions) {
      setReloadTransactions(false);
      loadTransactions();
    }
  }, [sortParams]);

  const buildSearchParamsUrl = () => {
    setSearchParams(
      queryParamsFromObject(filterForm.values, {
        company: "id",
        expense: "id",
        income: "id",
        account: "id",
        merchant: "id",
        has_classification: "id",
      })
    );
  };

  const onSortChange = (sort_key: string, sort_order: "asc" | "desc") => {
    setReloadTransactions(true);
    setSortParams(queryParamsFromObject({ sort_key, sort_order }));
  };

  const getPersonalCompanyType = (transaction: Transaction) => {
    return transaction.is_personal
      ? "Personal Transaction"
      : "Company Transaction";
  };

  const getIncomeExpenseType = (transaction: Transaction) => {
    return transaction.is_income ? "Income" : "Expense";
  };

  const loadTransactions = async () => {
    setLoading(true);
    await fetchTransactions(
      `${paginationParams()}&${searchParams}&${sortParams}&extends=company,transaction_classifications,expense,income,account,merchant`,
      {
        onSuccess: (data, totalPages) => {
          setTransactions(data);
          setTotalPages(totalPages);
          setTotalExpenseValue(data.data?.totalExpenseValue || 0);
          setTotalIncomeValue(data.data?.totalIncomeValue || 0);
          if (!data.data?.transactions.length) {
            setPaginationState({
              reload: false,
              page: data.pageInfo?.totalPages || 1,
            });
          }
        },
        onError: () => setLoading(false),
        onFinally: () => setLoading(false),
      }
    );
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
    await deleteTransaction(mainForm.values.id, {
      onSuccess: () => {
        adjustPaginationBeforeReload();
        setOpenRemoveModal(false);
      },
      onError: () => setLoading(false),
      onFinally: () => setLoading(false),
    });
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
        <div className="flex flex-wrap">
          <div
            onClick={() => setOpenFilterModal(true)}
            className="flex cursor-pointer text-violet-950 transform transition-transform duration-300 hover:scale-110 mb-2"
          >
            <Icon size={30} name="Filter"></Icon>
            Filters
          </div>
          <div className="flex flex-wrap">
            {TransactionFilterTagsConfig.map((config, index) => (
              <FilterTag
                fieldName={config.fieldName}
                fieldValue={filterForm.values[config.fieldName]}
                defaultFieldValue={config.defaultFieldValue}
                onClose={(fieldName, defaultFieldValue) => {
                  filterForm.setFieldValue(fieldName, defaultFieldValue);
                  setReloadTransactions(true);
                }}
                className="ml-2 mb-2"
                tagLabel={config.tagLabel}
                tagValue={config.getTagValue(
                  filterForm.values[config.fieldName]
                )}
                key={index}
              ></FilterTag>
            ))}
          </div>
        </div>
        <PrimaryButton
          onClick={onClickAdd}
          text="Add"
          iconName="PlusCircle"
        ></PrimaryButton>
      </div>
      <div className="overflow-x-auto px-10 pb-4">
        <table className="min-w-full bg-white border border-gray-300 text-violet-900">
          <thead>
            <tr className="bg-gray-100">
              <ThSort
                thSortConfigs={TransactionThSortConfig.thSortConfigs}
                defaultKey={defaultSortKey}
                onSortChange={onSortChange}
              ></ThSort>
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
                  {formatDate(transaction.date)}
                </td>
                <td className="py-2 px-4 border-b border-r">
                  {transaction.name}
                </td>
                <td className="py-2 px-4 border-b border-r">
                  {getPersonalCompanyType(transaction)}
                </td>
                <td className="py-2 px-4 border-b border-r">
                  {getIncomeExpenseType(transaction)}
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
                <td
                  className={`py-2 px-4 border-b border-r ${
                    transaction.merchant?.name ? "" : "opacity-50"
                  }`}
                >
                  {transaction.merchant?.name || "Not set"}
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
        className="w-100 text-right px-10 pt-2 text-violet-900 text-lg whitespace-nowrap flex flex-col md:flex-row justify-end"
      >
        <span className="mr-0 md:mr-4">
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
          optionsAmount={isMobile ? 3 : 10}
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
          modal: "p-0 m-0 w-full sm:w-3/4 max-h-95vh overflow-hidden",
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
          formik={mainForm}
          onModalCancel={() => setOpenAddModal(false)}
          isSubmitting={isSubmitting}
          onSubmit={formSubmit}
          responseErrors={responseErrors}
        ></TransactionAdd>
      </Modal>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-1/3 overflow-hidden",
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
            formik={filterForm}
            onSubmit={onFilterFormSubmit}
          ></TransactionFilters>
        </div>
      </Modal>
    </Loader>
  );
}

export async function loader(request: LoaderFunctionArgs) {
  const transactionData = await transactionLoader(request, {
    page: 1,
    pageSize: 10,
    extends: [
      "account",
      "company",
      "expense",
      "income",
      "merchant",
      "transaction_classifications",
    ],
    date_after: firstDayOfCurrentMonth(getTimezoneFromClientCookies(request)),
    ...defaultSortKey,
  }).then((res) => res.json());

  return {
    transactionData,
  };
}
