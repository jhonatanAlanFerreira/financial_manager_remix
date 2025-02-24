import { Company, TransactionClassification } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { ChangeEvent, useEffect } from "react";
import { Modal } from "react-responsive-modal";
import { Checkbox } from "~/components/inputs/checkbox/checkbox";
import { Loader } from "~/components/loader/loader";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as classificationLoader } from "~/routes/api/classification/index";
import { Icon } from "~/components/icon/icon";
import { queryParamsFromObject, useIsMobile } from "~/utils/utilities";
import { Pagination } from "~/components/pagination/pagination";
import { useTitle } from "~/components/top-bar/title-context";
import { ClassificationFilterTagsConfig } from "~/components/page-components/classification/classification-filter-tags-config";
import { FilterTag } from "~/components/filter-tag/filter-tag";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { InputText } from "~/components/inputs/input-text/input-text";
import { InputSelect } from "~/components/inputs/input-select/input-select";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import {
  ClassificationFiltersFormInterface,
  ClassificationFormInterface,
} from "~/components/page-components/classification/classification-finterfaces";
import { ClassificationWithRelationsInterface } from "~/data/classification/classification-types";
import {
  createOrUpdateClassification,
  deleteClassification,
  fetchClassifications,
} from "~/data/frontend-services/classification-service";
import { ThSort } from "~/components/th-sort/th-sort";
import { ClassificationThSortConfig } from "~/components/page-components/classification/classification-th-sort-config";
import {
  CLASSIFICATION_FILTER_FORM_DEFAULTS_VALUES,
  CLASSIFICATION_MAIN_FORM_DEFAULTS_VALUES,
  classificationStore,
} from "~/components/page-components/classification/classification-store";
import { Controller, useForm } from "react-hook-form";
import {
  IsIncomeOrExpenseType,
  IsPersonalOrCompanyType,
} from "~/shared/shared-types";

export default function Classifications() {
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
    classifications,
    setClassifications,
  } = classificationStore();

  const { companyData, classificationData } = useLoaderData<{
    companyData: ServerResponseInterface<Company[]>;
    classificationData: ServerResponseInterface<
      ClassificationWithRelationsInterface[]
    >;
  }>();

  const {
    register: registerMain,
    reset: resetMain,
    setValue: setMainValue,
    watch: watchMain,
    getValues: getMainValues,
    control: mainControl,
  } = useForm<ClassificationFormInterface>({
    defaultValues: CLASSIFICATION_MAIN_FORM_DEFAULTS_VALUES,
  });

  const {
    register: registerFilter,
    reset: resetFilter,
    setValue: setFilterValue,
    getValues: getFilterValues,
    watch: watchFilter,
    control: filterControl,
  } = useForm<ClassificationFiltersFormInterface>({
    defaultValues: CLASSIFICATION_FILTER_FORM_DEFAULTS_VALUES,
  });

  useEffect(() => {
    buildSearchParamsUrl();
    setTitle({
      pageTitle: "Incomes & Expenses Classifications",
      pageTooltipMessage:
        "Create categories to classify your income and expenses. You'll apply these when recording transactions.",
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
      setTotalPages(classificationData.pageInfo?.totalPages || 0);
      setClassifications(classificationData);
    }
    setLoading(false);
  }, [companyData, classificationData]);

  const loadClassifications = async () => {
    setLoading(true);
    buildSearchParamsUrl();

    await fetchClassifications(
      {
        paginationParams: paginationParams(),
        searchParams: getSearchParams(),
        sortParams: getSortParams(),
        extends: "companies",
      },
      {
        onSuccess: (data) => {
          setCurrentPage(data.pageInfo?.currentPage || 1);
          setTotalPages(data.pageInfo?.totalPages || 1);
          setClassifications(data);

          if (!data.data?.length) {
            setCurrentPage(data.pageInfo?.currentPage || 1);
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

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = prepareFormData(event.currentTarget);
    setIsSubmitting(true);

    await createOrUpdateClassification(formData, {
      onSuccess: () => {
        setModals(null);
        loadClassifications();
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
    loadClassifications();
  };

  const removeClassification = async () => {
    setModals(null);
    setLoading(true);

    await deleteClassification(watchMain("id") as string, {
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

  const buildSearchParamsUrl = () => {
    setSearchParams(
      queryParamsFromObject(getFilterValues(), {
        has_company: "id",
      })
    );
  };

  const onSortChange = (sort_key: string, sort_order: "asc" | "desc") => {
    setSortParams(queryParamsFromObject({ sort_key, sort_order }));
    loadClassifications();
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    loadClassifications();
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: getCurrentPage(),
      pageSize: 10,
    } as any).toString();
  };

  const adjustPaginationBeforeReload = () => {
    const { data } = classifications;
    const hasMinimalData = data && data?.length < 2;

    if (hasMinimalData && getCurrentPage() !== 1) {
      setCurrentPage(getCurrentPage() - 1);
    }
    loadClassifications();
  };

  const getClassificationType = (classification: TransactionClassification) => {
    return classification.is_personal
      ? "Personal Transaction Classification"
      : "Company Transaction Classification";
  };

  const onClickAdd = () => {
    resetMain(CLASSIFICATION_MAIN_FORM_DEFAULTS_VALUES);
    setModals("add");
  };

  const onClickUpdate = (
    classification: ClassificationWithRelationsInterface
  ) => {
    setFormValues(classification);
    setModals("add");
  };

  const onClickDelete = (classification: TransactionClassification) => {
    setMainValue("id", classification.id);
    setModals("remove");
  };

  const onModalCancel = () => {
    resetMain(CLASSIFICATION_MAIN_FORM_DEFAULTS_VALUES);
    setResponseErrors({});
    setModals(null);
  };

  const isIncomeOrExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(
      "is_income_or_expense",
      e.currentTarget.value as IsIncomeOrExpenseType
    );
  };

  const isPersonalOrCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFilterValue(
      "is_personal_or_company",
      e.currentTarget.value as IsPersonalOrCompanyType
    );

    if (getFilterValues().is_personal_or_company == "personal") {
      setFilterValue("has_company", null);
    }
  };

  const onMainIsPersonalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setMainValue("is_personal", checked);
    if (checked) {
      setMainValue("companies", []);
    }
  };

  const setFormValues = (
    classification: ClassificationWithRelationsInterface
  ) => {
    resetMain(classification);
  };

  const prepareFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    formData.set(
      "is_personal",
      formData.get("is_personal") == "on" ? "true" : "false"
    );
    formData.set(
      "is_income",
      formData.get("is_income") == "on" ? "true" : "false"
    );

    formData.set("id", getMainValues().id);

    return formData;
  };

  const onFilterTagClose = (
    fieldName: keyof ClassificationFiltersFormInterface,
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
            {ClassificationFilterTagsConfig.map((config, index) => (
              <FilterTag
                fieldName={config.fieldName}
                fieldValue={getFilterValues()[config.fieldName]}
                defaultFieldValue={config.defaultFieldValue}
                onClose={(fieldName, defaultValue) =>
                  onFilterTagClose(
                    fieldName as keyof ClassificationFiltersFormInterface,
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
                thSortConfigs={ClassificationThSortConfig.thSortConfigs}
                onSortChange={onSortChange}
              ></ThSort>
            </tr>
          </thead>
          <tbody>
            {!classifications.data?.length && (
              <tr>
                <td className="py-2 px-4" colSpan={3}>
                  There are no data yet
                </td>
              </tr>
            )}
            {classifications.data?.map((classification, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-r">
                  {classification.name}
                </td>
                <td className="py-2 px-4 border-b border-r">
                  {getClassificationType(classification)}
                </td>
                <td className="py-2 px-4 border-b border-r">
                  {classification.is_income ? "Income" : "Expense"}
                </td>
                <td className="flex justify-center gap-5 py-2 px-4 border-b">
                  <Icon
                    onClick={() => onClickUpdate(classification)}
                    name="Edit"
                    className="cursor-pointer transition-transform  transform hover:scale-110"
                  ></Icon>{" "}
                  <Icon
                    onClick={() => onClickDelete(classification)}
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
          Do you really want to remove this classification?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setModals(null)}
          ></PrimaryButton>
          <DangerButton
            disabled={loading}
            text="Remove"
            onClick={removeClassification}
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
          {watchMain("id") ? "Update classification" : "Add new classification"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="classification-form" onSubmit={formSubmit}>
              <div className="flex flex-col gap-2 border-2 border-violet-950 border-opacity-50 p-4 mb-6">
                <div>
                  <Checkbox
                    id="is_personal"
                    className="relative top-1"
                    {...registerMain("is_personal")}
                    onChange={onMainIsPersonalChange}
                  ></Checkbox>
                  <label
                    className="pl-3 text-violet-950 cursor-pointer"
                    htmlFor="is_personal"
                  >
                    Use as personal classification
                  </label>
                </div>
              </div>
              <div className="p-4 text-violet-950 flex justify-start gap-7 border-2 border-violet-950 border-opacity-50">
                <div>
                  <input
                    id="is_not_income"
                    type="radio"
                    value={""}
                    checked={!watchMain("is_income")}
                    {...registerMain("is_income")}
                  ></input>
                  <label
                    className="cursor-pointer ml-2"
                    htmlFor="is_not_income"
                  >
                    Expense Classification
                  </label>
                </div>
                <div>
                  <input
                    id="is_income"
                    type="radio"
                    value={"on"}
                    checked={watchMain("is_income")}
                    {...registerMain("is_income")}
                  ></input>
                  <label className="cursor-pointer ml-2" htmlFor="is_income">
                    Income Classification
                  </label>
                </div>
              </div>
              <InputText
                label="Name *"
                required
                errorMessage={responseErrors?.errors?.["name"]}
                {...registerMain("name")}
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
              form="classification-form"
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
          <form onSubmit={onFilterFormSubmit}>
            <div className="flex justify-end mb-5 underline decoration-red-700 text-red-700 cursor-pointer">
              <span
                onClick={() =>
                  resetFilter(CLASSIFICATION_FILTER_FORM_DEFAULTS_VALUES)
                }
              >
                Clear all filters
              </span>
            </div>
            <div className="flex flex-col gap-2 mb-12">
              <span className="relative bg-white w-auto self-center top-6 text-violet-950 px-2">
                Income or Expense Classification
              </span>
              <div className="p-4 text-violet-950 flex flex-col xl:flex-row justify-between border-2 border-violet-950 border-opacity-50">
                <div>
                  <input
                    id="income_expense_all_filter"
                    type="radio"
                    value={"all"}
                    {...registerFilter("is_income_or_expense")}
                    onChange={(event) => isIncomeOrExpenseChange(event)}
                  ></input>
                  <label
                    className="cursor-pointer ml-2"
                    htmlFor="income_expense_all_filter"
                  >
                    All
                  </label>
                </div>
                <div>
                  <input
                    id="is_expense_filter"
                    type="radio"
                    value={"expense"}
                    {...registerFilter("is_income_or_expense")}
                    onChange={(event) => isIncomeOrExpenseChange(event)}
                  ></input>
                  <label
                    className="cursor-pointer ml-2"
                    htmlFor="is_expense_filter"
                  >
                    Expense classification
                  </label>
                </div>
                <div>
                  <input
                    id="is_income_filter"
                    type="radio"
                    value={"income"}
                    {...registerFilter("is_income_or_expense")}
                    onChange={(event) => isIncomeOrExpenseChange(event)}
                  ></input>
                  <label
                    className="cursor-pointer ml-2"
                    htmlFor="is_income_filter"
                  >
                    Income classification
                  </label>
                </div>
              </div>
              <span className="relative bg-white w-auto self-center top-6 text-violet-950 px-2">
                Personal or Company Classification
              </span>
              <div className="p-4 text-violet-950 flex flex-col xl:flex-row justify-between border-2 border-violet-950 border-opacity-50">
                <div>
                  <input
                    id="personal_company_all_filter"
                    type="radio"
                    {...registerFilter("is_personal_or_company")}
                    value={"all"}
                    onChange={(event) => isPersonalOrCompanyChange(event)}
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
                    {...registerFilter("is_personal_or_company")}
                    value={"personal"}
                    onChange={(event) => isPersonalOrCompanyChange(event)}
                  ></input>
                  <label
                    className="cursor-pointer ml-2"
                    htmlFor="is_personal_filter"
                  >
                    Personal classification
                  </label>
                </div>
                <div>
                  <input
                    id="is_company_filter"
                    type="radio"
                    {...registerFilter("is_personal_or_company")}
                    value={"company"}
                    onChange={(event) => isPersonalOrCompanyChange(event)}
                  ></input>
                  <label
                    className="cursor-pointer ml-2"
                    htmlFor="is_company_filter"
                  >
                    Company classification
                  </label>
                </div>
              </div>
            </div>
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
  const [companyData, classificationData] = await Promise.all([
    companyLoader(request).then((res) => res.json()),
    classificationLoader(request, {
      page: 1,
      pageSize: 10,
      extends: ["companies"],
    }).then((res) => res.json()),
  ]);

  return {
    companyData,
    classificationData,
  };
}
