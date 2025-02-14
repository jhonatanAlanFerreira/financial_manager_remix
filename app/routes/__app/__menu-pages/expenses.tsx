import { Modal } from "react-responsive-modal";
import { useEffect } from "react";
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
import { expenseStore } from "~/components/page-components/expense/expense.store";
import { useForm } from "react-hook-form";
import { IsPersonalOrCompanyType } from "~/shared/shared-types";

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
    handleSubmit: handleSubmitMain,
    reset: resetMain,
    setValue: setMainValue,
    watch: watchMain,
    getValues: getMainValues,
  } = useForm<ExpenseFormInterface>({
    defaultValues: {
      id: "",
      name: "",
      amount: 0,
      companies: [],
      is_personal: false,
    },
  });

  const {
    register: registerFilter,
    handleSubmit: handleSubmitFilter,
    reset: resetFilter,
    setValue: setFilterValue,
    getValues: getFilterValues,
  } = useForm<ExpenseFiltersFormInterface>({
    defaultValues: {
      name: "",
      amount_greater: 0,
      amount_less: 0,
      has_company: null,
      is_personal_or_company: "all",
    },
  });

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;

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

  const getExpenseType = (expense: Expense) => {
    return expense.is_personal ? "Personal Expense" : "Company Expense";
  };

  const adjustPaginationBeforeReload = () => {
    const { data } = expenses;
    const hasMinimalData = data && data?.length < 2;

    if (hasMinimalData && getCurrentPage() !== 1) {
      setCurrentPage(getCurrentPage() - 1);
    }
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

  const setFormValues = (expense: ExpenseWithRelationsInterface) => {
    resetMain(expense);
  };

  const onCompaniesChange = (companies: Company[]) => {
    setMainValue("companies", companies);
  };

  const onClickAdd = () => {
    resetMain();
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
    resetMain();
    setResponseErrors({});
    setModals(null);
  };

  const onCompanyFilterChange = (company: Company) => {
    setFilterValue("has_company", company);
  };

  const onFilterFormSubmit = async (data: ExpenseFiltersFormInterface) => {
    setModals(null);
    setCurrentPage(1);
    loadExpenses();
  };

  const buildSearchParamsUrl = () => {
    setSearchParams(
      queryParamsFromObject(getFilterValues(), {
        has_company: "id",
      })
    );
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: getCurrentPage(),
      pageSize: 10,
    } as any).toString();
  };

  const isPersonalOrCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterValue(
      "is_personal_or_company",
      e.currentTarget.value as IsPersonalOrCompanyType
    );
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

  const onSortChange = (sort_key: string, sort_order: "asc" | "desc") => {
    setSortParams(queryParamsFromObject({ sort_key, sort_order }));
    loadExpenses();
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    loadExpenses();
  };

  const onFilterTagClose = (fieldName: string, defaultValue: any) => {
    setFilterValue("name", defaultValue);
    onFilterFormSubmit(getFilterValues());
  };

  return (
    <Loader loading={loading}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap">
          <div
            onClick={() => setModals("filter")}
            className="flex cursor-pointer text-violet-950 transform transition-transform duration-300 hover:scale-110 mb-2"
          >
            <Icon size={30} name="Filter"></Icon>
            Filters
          </div>
          <div className="flex flex-wrap">
            {ExpenseFilterTagsConfig.map((config, index) => (
              <FilterTag
                fieldName={config.fieldName}
                fieldValue={getFilterValues()[config.fieldName]}
                defaultFieldValue={config.defaultFieldValue}
                onClose={onFilterTagClose}
                className="ml-2 mb-2"
                tagLabel={config.tagLabel}
                tagValue={config.getTagValue(
                  getFilterValues()[config.fieldName]
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
                <td className="flex justify-center gap-5 py-2 px-4 border-b">
                  <Icon
                    onClick={() => onClickUpdate(expense)}
                    name="Edit"
                    className="cursor-pointer transition-transform  transform hover:scale-110"
                  ></Icon>{" "}
                  <Icon
                    onClick={() => {
                      onClickDelete(expense);
                    }}
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
          {mainForm.values.id ? "Update expense" : "Add new expense"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="expense-form" onSubmit={formSubmit}>
              <div className="border-2 border-violet-950 border-opacity-50 p-4">
                <Checkbox
                  className="relative top-1"
                  name="is_personal"
                  id="is_personal"
                  checked={mainForm.values.is_personal}
                  onChange={mainForm.handleChange}
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
                name="name"
                required
                value={mainForm.values.name}
                onChange={mainForm.handleChange}
                errorMessage={responseErrors?.errors?.["name"]}
              ></InputText>
              <InputText
                label="Amount"
                name="amount"
                type="number"
                step={0.01}
                min={0}
                value={mainForm.values.amount || 0}
                onChange={mainForm.handleChange}
              ></InputText>
              {!mainForm.values.is_personal && (
                <InputSelect
                  isMulti
                  isClearable
                  className="mb-8"
                  placeholder="Companies"
                  options={companies?.data}
                  getOptionLabel={getSelectCompanyOptionLabel as any}
                  getOptionValue={getSelectCompanyOptionValue as any}
                  name="companies"
                  onChange={(event) => onCompaniesChange(event as Company[])}
                  value={mainForm.values.companies}
                ></InputSelect>
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
          <form>
            <div className="flex justify-end mb-5 underline decoration-red-700 text-red-700 cursor-pointer">
              <span onClick={() => filterForm.resetForm()}>
                Clear all filters
              </span>
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
                    name="is_personal_or_company"
                    value={"all"}
                    onChange={isPersonalOrCompanyChange}
                    checked={filterForm.values.is_personal_or_company === "all"}
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
                    checked={
                      filterForm.values.is_personal_or_company === "personal"
                    }
                  ></input>
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
                    name="is_personal_or_company"
                    value={"company"}
                    onChange={isPersonalOrCompanyChange}
                    checked={
                      filterForm.values.is_personal_or_company === "company"
                    }
                  ></input>
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
              name="amount_greater"
              value={filterForm.values.amount_greater}
              onChange={filterForm.handleChange}
            ></InputText>
            <InputText
              type="number"
              label="Amount less than"
              name="amount_less"
              value={filterForm.values.amount_less}
              onChange={filterForm.handleChange}
            ></InputText>
            <InputText
              label="Name"
              name="name"
              onChange={filterForm.handleChange}
              value={filterForm.values.name}
            ></InputText>
            {filterForm.values.is_personal_or_company != "personal" && (
              <InputSelect
                isClearable
                className="mb-8"
                placeholder="Company"
                options={companies.data}
                getOptionLabel={getSelectCompanyOptionLabel as any}
                getOptionValue={getSelectCompanyOptionValue as any}
                name="has_company"
                onChange={(event) => onCompanyFilterChange(event as Company)}
                value={filterForm.values.has_company}
              ></InputSelect>
            )}

            <div className="flex justify-end p-2 mt-10">
              <PrimaryButton
                onClick={onFilterFormSubmit}
                text="Done"
                type="button"
              ></PrimaryButton>
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
