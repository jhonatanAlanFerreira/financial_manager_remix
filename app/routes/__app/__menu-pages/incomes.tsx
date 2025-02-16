import { Company, Income } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { ChangeEvent, useEffect } from "react";
import { Modal } from "react-responsive-modal";
import { Icon } from "~/components/icon/icon";
import { Checkbox } from "~/components/inputs/checkbox/checkbox";
import { Loader } from "~/components/loader/loader";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as incomeLoader } from "~/routes/api/income/index";
import { Pagination } from "~/components/pagination/pagination";
import { queryParamsFromObject, useIsMobile } from "~/utils/utilities";
import { useTitle } from "~/components/top-bar/title-context";
import { IncomeFilterTagsConfig } from "~/components/page-components/income/income-filter-tags-config";
import { FilterTag } from "~/components/filter-tag/filter-tag";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { InputText } from "~/components/inputs/input-text/input-text";
import { InputSelect } from "~/components/inputs/input-select/input-select";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  IncomeFiltersFormInterface,
  IncomeFormInterface,
} from "~/components/page-components/income/income-interfaces";
import { IncomeWithRelationsInterface } from "~/data/income/income-types";
import {
  createOrUpdateIncome,
  deleteIncome,
  fetchIncomes,
} from "~/data/frontend-services/income-service";
import { ThSort } from "~/components/th-sort/th-sort";
import { IncomesThSortConfig } from "~/components/page-components/income/incomes-th-sort-config";
import {
  INCOME_FILTER_FORM_DEFAULTS_VALUES,
  INCOME_MAIN_FORM_DEFAULTS_VALUES,
  incomeStore,
} from "~/components/page-components/income/income-store";
import { Controller, useForm } from "react-hook-form";

export default function Incomes() {
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
    incomes,
    setIncomes,
  } = incomeStore();

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;

  const { companyData, incomeData } = useLoaderData<{
    companyData: ServerResponseInterface<Company[]>;
    incomeData: ServerResponseInterface<IncomeWithRelationsInterface[]>;
  }>();

  const {
    register: registerMain,
    reset: resetMain,
    setValue: setMainValue,
    watch: watchMain,
    getValues: getMainValues,
    control: mainControl,
  } = useForm<IncomeFormInterface>({
    defaultValues: INCOME_MAIN_FORM_DEFAULTS_VALUES,
  });

  const {
    register: registerFilter,
    reset: resetFilter,
    setValue: setFilterValue,
    getValues: getFilterValues,
    watch: watchFilter,
    control: filterControl,
  } = useForm<IncomeFiltersFormInterface>({
    defaultValues: INCOME_FILTER_FORM_DEFAULTS_VALUES,
  });

  useEffect(() => {
    buildSearchParamsUrl();
    setTitle({
      pageTitle: "Incomes",
      pageTooltipMessage:
        "Add types of income here, such as 'Salary' or 'Freelance Work'. Use the transaction screen to record individual income entries.",
    });

    return () => {
      setTitle({ pageTitle: "" });
    };
  }, []);

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData);
    }
    if (incomeData) {
      setTotalPages(incomeData.pageInfo?.totalPages || 0);
      setIncomes(incomeData);
    }
    setLoading(false);
  }, [companyData, incomeData]);

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = prepareFormData(event.currentTarget);
    setIsSubmitting(true);

    await createOrUpdateIncome(formData, {
      onSuccess: () => {
        setModals(null);
        loadIncomes();
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

  const loadIncomes = async () => {
    setLoading(true);
    buildSearchParamsUrl();

    await fetchIncomes(
      {
        paginationParams: paginationParams(),
        searchParams: getSearchParams(),
        sortParams: getSortParams(),
      },
      {
        onSuccess: (data) => {
          setCurrentPage(data.pageInfo?.currentPage || 1);
          setTotalPages(data.pageInfo?.totalPages || 1);
          setIncomes(data);

          if (!data.data?.length) {
            setCurrentPage(data.pageInfo?.totalPages || 1);
          }
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

  const adjustPaginationBeforeReload = () => {
    const { data } = incomes;
    const hasMinimalData = data && data?.length < 2;

    if (hasMinimalData && getCurrentPage() !== 1) {
      setCurrentPage(getCurrentPage() - 1);
    }
    loadIncomes();
  };

  const removeIncome = async () => {
    setModals(null);
    setLoading(true);

    await deleteIncome(getMainValues().id, {
      onSuccess: () => {
        adjustPaginationBeforeReload();
      },
      onError: () => {
        setLoading(false);
      },
      onFinally: () => {
        setLoading(false);
      },
    });
  };

  const getIncomeType = (income: Income) => {
    return income.is_personal ? "Personal Income" : "Company Income";
  };

  const onClickAdd = () => {
    resetMain(INCOME_MAIN_FORM_DEFAULTS_VALUES);
    setModals("add");
  };

  const onModalCancel = () => {
    resetMain(INCOME_MAIN_FORM_DEFAULTS_VALUES);
    setResponseErrors({});
    setModals(null);
  };

  const onClickDelete = (income: Income) => {
    setMainValue("id", income.id);
    setModals("remove");
  };

  const onClickUpdate = (income: IncomeWithRelationsInterface) => {
    setFormValues(income);
    setModals("add");
  };

  const setFormValues = (income: IncomeWithRelationsInterface) => {
    resetMain(income);
  };

  const onFilterFormSubmit = () => {
    setModals(null);
    setCurrentPage(1);
    loadIncomes();
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: getCurrentPage(),
      pageSize: 10,
    } as any).toString();
  };

  const buildSearchParamsUrl = () => {
    setSearchParams(
      queryParamsFromObject(getFilterValues(), {
        has_company: "id",
      })
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
    loadIncomes();
  };
  const onFilterTagClose = (
    fieldName: keyof IncomeFiltersFormInterface,
    defaultValue: any
  ) => {
    setFilterValue(fieldName, defaultValue);
    onFilterFormSubmit();
  };

  const onMainIsPersonalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setMainValue("is_personal", checked);
    if (checked) {
      setMainValue("companies", []);
    }
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    loadIncomes();
  };

  const onFilterIsPersonalOrCompanyChange = () => {
    const { is_personal_or_company } = getFilterValues();
    if (is_personal_or_company == "personal") {
      setFilterValue("has_company", null);
    }
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
            {IncomeFilterTagsConfig.map((config, index) => (
              <FilterTag
                fieldName={config.fieldName}
                fieldValue={getFilterValues()[config.fieldName]}
                defaultFieldValue={config.defaultFieldValue}
                onClose={(fieldName, defaultValue) =>
                  onFilterTagClose(
                    fieldName as keyof IncomeFiltersFormInterface,
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
                thSortConfigs={IncomesThSortConfig.thSortConfigs}
                onSortChange={onSortChange}
              ></ThSort>
            </tr>
          </thead>
          <tbody>
            {!incomes.data?.length && (
              <tr>
                <td className="py-2 px-4" colSpan={4}>
                  There are no data yet
                </td>
              </tr>
            )}
            {incomes.data?.map((income, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-r">{income.name}</td>
                <td className="py-2 px-4 border-b border-r">{income.amount}</td>
                <td className="py-2 px-4 border-b border-r">
                  {getIncomeType(income)}
                </td>
                <td className="flex justify-center gap-5 py-2 px-4 border-b">
                  <Icon
                    onClick={() => {
                      onClickUpdate(income);
                    }}
                    name="Edit"
                    className="cursor-pointer transition-transform  transform hover:scale-110"
                  ></Icon>{" "}
                  <Icon
                    onClick={() => {
                      onClickDelete(income);
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
          Do you really want to remove this income?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setModals(null)}
          ></PrimaryButton>
          <DangerButton
            disabled={loading}
            text="Remove"
            onClick={removeIncome}
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
          {watchMain("id") ? "Update income" : "Add new income"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="income-form" onSubmit={formSubmit}>
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
                  Use as personal income
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
                type="number"
                step={0.01}
                min={0}
                {...registerMain("amount")}
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
                      getOptionLabel={getSelectCompanyOptionLabel as any}
                      getOptionValue={getSelectCompanyOptionValue as any}
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
              form="income-form"
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
        onClose={() => setModals(null)}
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Filters
        </h2>
        <div className="p-4">
          <form>
            <div className="flex justify-end mb-5 underline decoration-red-700 text-red-700 cursor-pointer">
              <span onClick={() => resetFilter()}>Clear all filters</span>
            </div>
            <div className="flex flex-col gap-2 mb-12">
              <span className="relative bg-white w-auto self-center top-6 text-violet-950 px-2">
                Personal or Company Income
              </span>
              <div className="p-4 text-violet-950 flex flex-col xl:flex-row justify-between border-2 border-violet-950 border-opacity-50">
                <div>
                  <input
                    id="personal_company_all_filter"
                    type="radio"
                    value="all"
                    {...registerFilter("is_personal_or_company", {
                      onChange: onFilterIsPersonalOrCompanyChange,
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
                    getOptionLabel={getSelectCompanyOptionLabel as any}
                    getOptionValue={getSelectCompanyOptionValue as any}
                    {...field}
                  />
                )}
              />
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
  const [companyData, incomeData] = await Promise.all([
    companyLoader(request).then((res) => res.json()),
    incomeLoader(request, {
      page: 1,
      pageSize: 10,
      extends: ["companies"],
    }).then((res) => res.json()),
  ]);

  return {
    companyData,
    incomeData,
  };
}
