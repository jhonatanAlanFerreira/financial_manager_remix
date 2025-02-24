import { Transaction } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { useEffect } from "react";
import { Modal } from "react-responsive-modal";
import { Loader } from "~/components/loader/loader";
import { loader as transactionLoader } from "~/routes/api/transaction/index";
import { Icon } from "~/components/icon/icon";
import {
  firstDayOfCurrentMonth,
  formatDate,
  getTimezoneFromClientCookies,
  queryParamsFromObject,
  useIsMobile,
} from "~/utils/utilities";
import { Pagination } from "~/components/pagination/pagination";
import { useTitle } from "~/components/top-bar/title-context";
import { TransactionFilterTagsConfig } from "~/components/page-components/transaction/transaction-filter-tags-config";
import { FilterTag } from "~/components/filter-tag/filter-tag";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { TransactionAdd } from "~/components/page-components/transaction/transaction-add";
import { TransactionFilters } from "~/components/page-components/transaction/transaction-filters";
import { ServerResponseInterface } from "~/shared/server-response-interface";
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
import {
  TRANSACTION_FILTER_FORM_DEFAULTS_VALUES,
  TRANSACTION_MAIN_FORM_DEFAULTS_VALUES,
  transactionStore,
} from "~/components/page-components/transaction/transaction-store";
import {
  TransactionFiltersFormInterface,
  TransactionFormInterface,
} from "~/components/page-components/transaction/transaction-interfaces";
import { useForm } from "react-hook-form";

const defaultSortKey: { sort_key: string; sort_order: "desc" | "asc" } = {
  sort_key: "date",
  sort_order: "desc",
};

export default function Transactions() {
  const isMobile = useIsMobile();
  const { setTitle } = useTitle();

  const {
    loading,
    setLoading,
    getSearchParams,
    setSearchParams,
    isSubmitting,
    setIsSubmitting,
    modals,
    setModals,
    getSortParams,
    setSortParams,
    totalPages,
    setTotalPages,
    setCurrentPage,
    getCurrentPage,
    responseErrors,
    setResponseErrors,
    transactions,
    setTransactions,
    totalExpenseValue,
    setTotalExpenseValue,
    totalIncomeValue,
    setTotalIncomeValue,
  } = transactionStore();

  const mainForm = useForm<TransactionFormInterface>({
    defaultValues: TRANSACTION_MAIN_FORM_DEFAULTS_VALUES,
  });

  const filterForm = useForm<TransactionFiltersFormInterface>({
    defaultValues: TRANSACTION_FILTER_FORM_DEFAULTS_VALUES,
  });

  const {
    reset: resetMain,
    setValue: setMainValue,
    watch: watchMain,
    getValues: getMainValues,
  } = mainForm;

  const {
    setValue: setFilterValue,
    getValues: getFilterValues,
    watch: watchFilter,
  } = filterForm;

  const { transactionData } = useLoaderData<{
    transactionData: ServerResponseInterface<TransactionsWithTotalsInterface>;
  }>();

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

  const loadTransactions = async () => {
    setLoading(true);
    buildSearchParamsUrl();

    await fetchTransactions(
      `${paginationParams()}&${getSearchParams()}&${getSortParams()}&extends=company,transaction_classifications,expense,income,account,merchant`,
      {
        onSuccess: (data, totalPages) => {
          setTransactions(data);
          setTotalPages(totalPages);
          setTotalExpenseValue(data.data?.totalExpenseValue || 0);
          setTotalIncomeValue(data.data?.totalIncomeValue || 0);
          if (!data.data?.transactions.length) {
            setCurrentPage(data.pageInfo?.totalPages || 1);
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
        resetMain(TRANSACTION_MAIN_FORM_DEFAULTS_VALUES);
        setModals(null);
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

  const onFilterFormSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    setModals(null);
    setCurrentPage(1);
    loadTransactions();
  };

  const removeTransaction = async () => {
    await deleteTransaction(getMainValues().id, {
      onSuccess: () => {
        adjustPaginationBeforeReload();
        setModals(null);
      },
      onError: () => setLoading(false),
      onFinally: () => setLoading(false),
    });
  };

  const buildSearchParamsUrl = () => {
    setSearchParams(
      queryParamsFromObject(getFilterValues(), {
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
    setSortParams(queryParamsFromObject({ sort_key, sort_order }));
    loadTransactions();
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    loadTransactions();
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: getCurrentPage(),
      pageSize: 10,
    } as any).toString();
  };

  const adjustPaginationBeforeReload = () => {
    const { data } = transactions;
    const hasMinimalData = data?.transactions && data?.transactions?.length < 2;

    if (hasMinimalData && getCurrentPage() !== 1) {
      setCurrentPage(getCurrentPage() - 1);
    }
    loadTransactions();
  };

  const getPersonalCompanyType = (transaction: Transaction) => {
    return transaction.is_personal
      ? "Personal Transaction"
      : "Company Transaction";
  };

  const getIncomeExpenseType = (transaction: Transaction) => {
    return transaction.is_income ? "Income" : "Expense";
  };

  const onClickAdd = () => {
    resetMain(TRANSACTION_MAIN_FORM_DEFAULTS_VALUES);
    setModals("add");
  };

  const onClickUpdate = (transaction: TransactionWithRelationsInterface) => {
    setFormValues(transaction);
    setModals("add");
  };

  const onClickDelete = (transaction: Transaction) => {
    setMainValue("id", transaction.id);
    setModals("remove");
  };

  const setFormValues = (transaction: TransactionWithRelationsInterface) => {
    resetMain(transaction);
  };

  const prepareFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);

    formData.set(
      "is_personal",
      formData.get("is_personal") == "on" ? "true" : "false"
    );
    formData.set("is_income", getMainValues().is_income ? "true" : "false");

    formData.set("id", getMainValues().id);

    return formData;
  };

  const onFilterTagClose = (
    fieldName: keyof TransactionFiltersFormInterface,
    defaultValue: any
  ) => {
    setFilterValue(fieldName, defaultValue);
    onFilterFormSubmit();
  };

  return (
    <Loader loading={loading}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap">
          <div
            onClick={() => setModals("filter")}
            className="flex cursor-pointer text-violet-950 transform transition-transform duration-300 hover:scale-110 mb-2"
          >
            <Icon size={20} name="Filter"></Icon>
            Filters
          </div>
          <div className="flex flex-wrap">
            {TransactionFilterTagsConfig.map((config, index) => (
              <FilterTag
                fieldName={config.fieldName}
                fieldValue={getFilterValues()[config.fieldName]}
                defaultFieldValue={config.defaultFieldValue}
                onClose={(fieldName, defaultValue) =>
                  onFilterTagClose(
                    fieldName as keyof TransactionFiltersFormInterface,
                    defaultValue
                  )
                }
                className="ml-2 mb-2"
                tagLabel={config.tagLabel}
                tagValue={config.getTagValue(watchFilter(config.fieldName))}
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
          currentPage={getCurrentPage()}
          totalPages={totalPages}
          optionsAmount={isMobile ? 3 : 10}
          onPageChange={onPageChange}
        ></Pagination>
      )}

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-1/3",
        }}
        center
        showCloseIcon={false}
        open={modals == "remove"}
        onClose={() => setModals(null)}
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
            onClick={() => setModals(null)}
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
        open={modals == "add"}
        onClose={() => setModals(null)}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          {watchMain("id") ? "Update transaction" : "Add new transaction"}
        </h2>
        <TransactionAdd
          onModalCancel={() => setModals(null)}
          isSubmitting={isSubmitting}
          onSubmit={formSubmit}
          responseErrors={responseErrors}
          form={mainForm}
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
        open={modals == "filter"}
        onClose={() => setModals(null)}
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Filters
        </h2>
        <div className="p-4">
          <TransactionFilters
            onSubmit={onFilterFormSubmit}
            form={filterForm}
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
