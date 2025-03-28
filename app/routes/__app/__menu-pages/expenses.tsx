import { Modal } from "react-responsive-modal";
import { ChangeEvent, useEffect } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import { Checkbox } from "~/components/inputs/checkbox/checkbox";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Loader } from "~/components/loader/loader";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as expenseLoader } from "~/routes/api/expense/index";
import { Company, Expense } from "@prisma/client";
import { Icon } from "~/components/icon/icon";
import { Pagination } from "~/components/pagination/pagination";
import { queryParamsFromObject, useIsMobile } from "~/utils/utilities";
import { useTitle } from "~/components/top-bar/title-context";
import { ExpenseFilterTagsConfig } from "~/components/page-components/expense/expense-filter-tags-config";
import { FilterTag } from "~/components/filter-tag/filter-tag";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { InputText } from "~/components/inputs/input-text/input-text";
import { InputSelect } from "~/components/inputs/input-select/input-select";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  ExpenseFiltersFormInterface,
  ExpenseFormInterface,
} from "~/components/page-components/expense/expense-interfaces";
import { ExpenseWithRelationsInterface } from "~/data/expense/expense-types";
import {
  createOrUpdateExpense,
  deleteExpense,
  fetchExpenses,
} from "~/data/frontend-services/expense-service";
import { ThSort } from "~/components/th-sort/th-sort";
import { ExpenseThSortConfig } from "~/components/page-components/expense/expense-th-sort-config";
import {
  expenseStore,
  EXPENSE_FILTER_FORM_DEFAULTS_VALUES,
  EXPENSE_MAIN_FORM_DEFAULTS_VALUES,
} from "~/components/page-components/expense/expense-store";
import { Controller, useForm } from "react-hook-form";

export default function Expenses() {
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
    companies,
    setCompanies,
    expenses,
    setExpenses,
  } = expenseStore();

  const { expenseData, companyData } = useLoaderData<{
    expenseData: ServerResponseInterface<ExpenseWithRelationsInterface[]>;
    companyData: ServerResponseInterface<Company[]>;
  }>();

  const {
    register: registerMain,
    reset: resetMain,
    setValue: setMainValue,
    watch: watchMain,
    getValues: getMainValues,
    control: mainControl,
  } = useForm<ExpenseFormInterface>({
    defaultValues: EXPENSE_MAIN_FORM_DEFAULTS_VALUES,
  });

  const {
    register: registerFilter,
    reset: resetFilter,
    setValue: setFilterValue,
    getValues: getFilterValues,
    watch: watchFilter,
    control: filterControl,
  } = useForm<ExpenseFiltersFormInterface>({
    defaultValues: EXPENSE_FILTER_FORM_DEFAULTS_VALUES,
  });

  useEffect(() => {
    buildSearchParamsUrl();
    setTitle({
      pageTitle: "Expenses",
      pageTooltipMessage:
        "Add types of expenses here, such as 'Rent' or 'Utilities'. Record individual expense transactions on the transaction screen.",
    });

    return () => {
      setTitle({ pageTitle: "" });
    };
  }, []);

  useEffect(() => {
    if (expenseData) {
      setTotalPages(expenseData.pageInfo?.totalPages || 0);
      setExpenses(expenseData);
    }
    if (companyData) {
      setCompanies(companyData);
    }
    setLoading(false);
  }, [expenseData, companyData]);

  const loadExpenses = async () => {
    setLoading(true);
    buildSearchParamsUrl();

    await fetchExpenses(
      {
        paginationParams: paginationParams(),
        searchParams: getSearchParams(),
        sortParams: getSortParams(),
      },
      {
        onSuccess: (data) => {
          setCurrentPage(data.pageInfo?.currentPage || 1);
          setTotalPages(data.pageInfo?.totalPages || 1);
          setExpenses(data);
        },
        onError: () => {
          setLoading(false);
        },
        onFinally: () => {
          setLoading(false);
        },
      }
    );
  };

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = prepareFormData(event.currentTarget);
    setIsSubmitting(true);

    createOrUpdateExpense(formData, {
      onSuccess: () => {
        setModals(null);
        loadExpenses();
        setResponseErrors({});
      },
      onError: (errors) => {
        setResponseErrors(errors);
      },
      onFinally: () => {
        setIsSubmitting(false);
      },
    });
  };

  const onFilterFormSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    setModals(null);
    setCurrentPage(1);
    loadExpenses();
  };

  const removeExpense = async () => {
    setModals(null);
    setLoading(true);

    try {
      await deleteExpense(getMainValues().id, {
        onSuccess: () => {
          adjustPaginationBeforeReload();
          setLoading(false);
        },
        onError: () => {
          setLoading(false);
        },
        onFinally: () => setLoading(false),
      });
    } catch (error) {
      console.error("Unexpected error:", error);
      setLoading(false);
    }
  };

  const buildSearchParamsUrl = () => {
    setSearchParams(
      queryParamsFromObject(getFilterValues(), {
        has_company: "id",
      })
    );
  };

  const onSortChange = (sort_key: string, sort_order: "asc" | "desc") => {
    setSortParams(queryParamsFromObject({ sort_key, sort_order }));
    loadExpenses();
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    loadExpenses();
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: getCurrentPage(),
      pageSize: 10,
    } as any).toString();
  };

  const adjustPaginationBeforeReload = () => {
    const { data } = expenses;
    const hasMinimalData = data && data?.length < 2;

    if (hasMinimalData && getCurrentPage() !== 1) {
      setCurrentPage(getCurrentPage() - 1);
    }
    loadExpenses();
  };

  const onClickAdd = () => {
    resetMain(EXPENSE_MAIN_FORM_DEFAULTS_VALUES);
    setModals("add");
  };

  const onClickUpdate = (expense: ExpenseWithRelationsInterface) => {
    setFormValues(expense);
    setModals("add");
  };

  const onClickDelete = (expense: Expense) => {
    setMainValue("id", expense.id);
    setModals("remove");
  };

  const onModalCancel = () => {
    resetMain(EXPENSE_MAIN_FORM_DEFAULTS_VALUES);
    setResponseErrors({});
    setModals(null);
  };

  const onMainIsPersonalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setMainValue("is_personal", checked);
    if (checked) {
      setMainValue("companies", []);
    }
  };

  const getExpenseType = (expense: Expense) => {
    return expense.is_personal ? "Personal Expense" : "Company Expense";
  };

  const setFormValues = (expense: ExpenseWithRelationsInterface) => {
    resetMain(expense);
  };

  const prepareFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    formData.set(
      "is_personal",
      formData.get("is_personal") == "on" ? "true" : "false"
    );

    formData.set("id", getMainValues().id);

    return formData;
  };

  const onFilterTagClose = (
    fieldName: keyof ExpenseFiltersFormInterface,
    defaultValue: any
  ) => {
    setFilterValue(fieldName, defaultValue);
    onFilterFormSubmit();
  };

  const onFiltersClear = () => {
    resetFilter();
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
            {ExpenseFilterTagsConfig.map((config, index) => (
              <FilterTag
                fieldName={config.fieldName}
                fieldValue={getFilterValues()[config.fieldName]}
                defaultFieldValue={config.defaultFieldValue}
                onClose={(fieldName, defaultValue) =>
                  onFilterTagClose(
                    fieldName as keyof ExpenseFiltersFormInterface,
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
                thSortConfigs={ExpenseThSortConfig.thSortConfigs}
                onSortChange={onSortChange}
              ></ThSort>
            </tr>
          </thead>
          <tbody>
            {!expenses.data?.length && (
              <tr>
                <td className="py-2 px-4" colSpan={4}>
                  There are no data yet
                </td>
              </tr>
            )}
            {expenses.data?.map((expense, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-r">{expense.name}</td>
                <td
                  className={`py-2 px-4 border-b border-r ${
                    expense.amount ? "" : "opacity-50"
                  }`}
                >
                  {expense.amount || "Not Set"}
                </td>
                <td className="py-2 px-4 border-b border-r">
                  {getExpenseType(expense)}
                </td>
                <td className="border-b">
                  <div className="h-full flex justify-center gap-5 py-2 px-4">
                    <Icon
                      onClick={() => onClickUpdate(expense)}
                      name="Edit"
                      size={17}
                      className="cursor-pointer transition-transform  transform hover:scale-110"
                    ></Icon>{" "}
                    <Icon
                      onClick={() => {
                        onClickDelete(expense);
                      }}
                      name="Trash"
                      size={17}
                      className="cursor-pointer transition-transform  transform hover:scale-110"
                      color="red"
                    ></Icon>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
          Do you really want to remove this expense?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setModals(null)}
          ></PrimaryButton>
          <DangerButton
            disabled={loading}
            text="Remove"
            onClick={removeExpense}
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
        open={modals == "add"}
        onClose={() => setModals(null)}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          {watchMain("id") ? "Update expense" : "Add new expense"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="expense-form" onSubmit={formSubmit}>
              <div className="border-2 border-violet-950 border-opacity-50 p-4">
                <Checkbox
                  className="relative top-1"
                  id="is_personal"
                  {...registerMain("is_personal")}
                  onChange={onMainIsPersonalChange}
                ></Checkbox>
                <label
                  className="pl-3 text-violet-950 cursor-pointer"
                  htmlFor="is_personal"
                >
                  Use as personal expense
                </label>
              </div>
              <InputText
                label="Name *"
                required
                errorMessage={responseErrors?.errors?.["name"]}
                {...registerMain("name")}
              ></InputText>
              <InputText
                label="Amount"
                {...registerMain("amount")}
                type="number"
                step={0.01}
                min={0}
              ></InputText>
              {!watchMain("is_personal") && (
                <Controller
                  name="companies"
                  control={mainControl}
                  render={({ field }) => (
                    <InputSelect
                      isMulti
                      isClearable
                      className="mb-8"
                      placeholder="Companies"
                      options={companies?.data}
                      getOptionLabel={(company) => (company as Company).name}
                      getOptionValue={(company) => (company as Company).id}
                      {...field}
                    />
                  )}
                />
              )}
            </Form>
          </div>
          <div className="flex justify-between p-2">
            <DangerButton text="Cancel" onClick={onModalCancel}></DangerButton>
            <PrimaryButton
              text="Save"
              disabled={isSubmitting}
              form="expense-form"
              type="submit"
              className={`${isSubmitting ? "bg-violet-950/50" : ""}`}
            ></PrimaryButton>
          </div>
        </div>
      </Modal>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-1/3",
        }}
        center
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
        open={modals == "filter"}
        onClose={() => setModals("filter")}
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Filters
        </h2>
        <div className="p-4">
          <form onSubmit={onFilterFormSubmit}>
            <div className="flex justify-end mb-5 underline decoration-red-700 text-red-700 cursor-pointer">
              <span onClick={onFiltersClear}>Clear all filters</span>
            </div>
            <div className="flex flex-col gap-2 mb-12">
              <span className="relative bg-white w-auto self-center top-6 text-violet-950 px-2">
                Personal or Company Expense
              </span>
              <div className="p-4 text-violet-950 flex flex-col xl:flex-row justify-between border-2 border-violet-950 border-opacity-50">
                <div>
                  <input
                    id="personal_company_all_filter"
                    type="radio"
                    value="all"
                    {...registerFilter("is_personal_or_company", {
                      onChange: (e) => {},
                    })}
                  />
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
                    value="personal"
                    {...registerFilter("is_personal_or_company")}
                  />
                  <label
                    className="cursor-pointer ml-2"
                    htmlFor="is_personal_filter"
                  >
                    Personal expense
                  </label>
                </div>
                <div>
                  <input
                    id="is_company_filter"
                    type="radio"
                    value="company"
                    {...registerFilter("is_personal_or_company")}
                  />
                  <label
                    className="cursor-pointer ml-2"
                    htmlFor="is_company_filter"
                  >
                    Company expense
                  </label>
                </div>
              </div>
            </div>
            <InputText
              type="number"
              label="Amount greater than"
              {...registerFilter("amount_greater")}
            ></InputText>
            <InputText
              type="number"
              label="Amount less than"
              {...registerFilter("amount_less")}
            ></InputText>
            <InputText label="Name" {...registerFilter("name")}></InputText>
            {watchFilter("is_personal_or_company") != "personal" && (
              <Controller
                name="has_company"
                control={filterControl}
                render={({ field }) => (
                  <InputSelect
                    isClearable
                    className="mb-8"
                    placeholder="Company"
                    options={companies?.data}
                    getOptionLabel={(company) => (company as Company).name}
                    getOptionValue={(company) => (company as Company).id}
                    {...field}
                  />
                )}
              />
            )}

            <div className="flex justify-end p-2 mt-10">
              <PrimaryButton text="Done" type="submit"></PrimaryButton>
            </div>
          </form>
        </div>
      </Modal>
    </Loader>
  );
}

export async function loader(request: LoaderFunctionArgs) {
  const [companyData, expenseData] = await Promise.all([
    companyLoader(request).then((res) => res.json()),
    expenseLoader(request, {
      page: 1,
      pageSize: 10,
      extends: ["companies"],
    }).then((res) => res.json()),
  ]);

  return {
    companyData,
    expenseData,
  };
}
