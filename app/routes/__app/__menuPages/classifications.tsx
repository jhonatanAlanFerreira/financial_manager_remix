import { Company, TransactionClassification } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "react-responsive-modal";
import Checkbox from "~/components/inputs/checkbox/checkbox";
import Loader from "~/components/loader/loader";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as classificationLoader } from "~/routes/api/classification/index";
import Icon from "~/components/icon/icon";
import { useFormik } from "formik";
import { ClassificationForm } from "~/interfaces/forms/classification/ClassificationForm";
import ClassificationFiltersForm from "~/interfaces/forms/classification/ClassificationFiltersForm";
import { queryParamsFromObject } from "~/utils/utilities";
import Pagination from "~/components/pagination/pagination";
import { useTitle } from "~/components/top-bar/title-context";
import { ClassificationFilterTagsConfig } from "~/components/page-components/classification/classification-filter-tags-config";
import FilterTag from "~/components/filter-tag/filter-tag";
import PrimaryButton from "~/components/buttons/primary-button/primary-button";
import DangerButton from "~/components/buttons/danger-button/danger-button";
import InputText from "~/components/inputs/input-text/input-text";
import InputSelect from "~/components/inputs/input-select/input-select";

export default function Classifications() {
  const { setTitle } = useTitle();

  const [loading, setLoading] = useState<boolean>(true);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [reloadClassification, setReloadClassification] =
    useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<String>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [classifications, setClassifications] = useState<
    ServerResponse<TransactionClassification[]>
  >({});

  const { companyData, classificationData } = useLoaderData<{
    companyData: ServerResponse<Company[]>;
    classificationData: ServerResponse<TransactionClassification[]>;
  }>();

  const mainForm = useFormik<ClassificationForm>({
    initialValues: {
      id: "",
      name: "",
      companies: [],
      is_personal_transaction_classification: false,
      is_income: false,
    },
    onSubmit: () => {},
  });

  const filterForm = useFormik<ClassificationFiltersForm>({
    initialValues: {
      name: "",
      company: null,
      is_personal_or_company: "all",
      is_income_or_expense: "all",
    },
    onSubmit: () => {},
  });

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;

  useEffect(() => {
    buildSearchParamsUrl();
    setCurrentPage(1);
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
      setCurrentPage(classificationData.pageInfo?.currentPage || 0);
      setTotalPages(classificationData.pageInfo?.totalPages || 0);
      setClassifications(classificationData);
    }
    setLoading(false);
  }, [companyData, classificationData]);

  useEffect(() => {
    if (currentPage) {
      loadClassifications();
    }
  }, [currentPage]);

  useEffect(() => {
    buildSearchParamsUrl();
  }, [filterForm.values]);

  useEffect(() => {
    if (reloadClassification) {
      setReloadClassification(false);
      loadClassifications();
    }
  }, [searchParams]);

  useEffect(() => {
    if (filterForm.values.is_personal_or_company === "personal") {
      filterForm.setFieldValue("company", null);
    }
  }, [filterForm.values.is_personal_or_company]);

  const loadClassifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ServerResponse<TransactionClassification[]>>(
        `/api/classification?${searchParams}${
          searchParams ? "&" : ""
        }${paginationParams()}`
      );

      setCurrentPage(res.data.pageInfo?.currentPage || 1);
      setTotalPages(res.data.pageInfo?.totalPages || 1);

      setClassifications(res.data);
      setLoading(false);

      if (!res.data.data?.length) {
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
    let axiosRequest;
    let loadingMessage;

    if (mainForm.values.id) {
      axiosRequest = axios.patch(
        `/api/classification?classificationId=${mainForm.values.id}`,
        formData
      );
      loadingMessage = "Updating classification";
    } else {
      axiosRequest = axios.post("/api/classification", formData);
      loadingMessage = "Creating classification";
    }

    setIsSubmitting(true);

    toast
      .promise(axiosRequest, {
        loading: loadingMessage,
        success: (res: AxiosResponse<ServerResponse>) => {
          setOpenAddModal(false);
          loadClassifications();
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
      .finally(() => setTimeout(() => setIsSubmitting(false), 500));
  };

  const getClassificationType = (classification: TransactionClassification) => {
    return classification.is_personal_transaction_classification
      ? "Personal Transaction Classification"
      : "Company Transaction Classification";
  };

  const removeClassification = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    toast.promise(
      axios.delete(
        `/api/classification?classificationId=${mainForm.values.id}`
      ),
      {
        loading: "Deleting classification",
        success: (res: AxiosResponse<ServerResponse>) => {
          loadClassifications();
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

  const setFormValues = (classification: TransactionClassification) => {
    mainForm.setValues({
      id: classification.id,
      name: classification.name,
      is_personal_transaction_classification:
        classification.is_personal_transaction_classification,
      is_income: classification.is_income,
      companies:
        companies.data?.filter((company) =>
          classification.company_ids.includes(company.id)
        ) || [],
    });
  };

  const onCompaniesChange = (companies: Company[]) => {
    mainForm.setFieldValue("companies", companies);
  };

  const onClickAdd = () => {
    mainForm.resetForm();
    setOpenAddModal(true);
  };

  const onClickUpdate = (classification: TransactionClassification) => {
    setFormValues(classification);
    setOpenAddModal(true);
  };

  const onClickDelete = (classification: TransactionClassification) => {
    mainForm.setFieldValue("id", classification.id);
    setOpenRemoveModal(true);
  };

  const onModalCancel = () => {
    mainForm.resetForm();
    setResponseErrors({});
    setOpenAddModal(false);
  };

  const onCompanyFilterChange = (company: Company) => {
    filterForm.setFieldValue("company", company);
  };

  const onFilterFormSubmit = async () => {
    setOpenFilterModal(false);
    loadClassifications();
  };

  const buildSearchParamsUrl = () => {
    setSearchParams(
      queryParamsFromObject(filterForm.values, {
        company: "id",
      })
    );
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: currentPage,
      pageSize: 10,
    } as any).toString();
  };

  const isIncomeOrExpenseChange = (e: any) => {
    filterForm.setFieldValue("is_income_or_expense", e.currentTarget.value);
  };

  const isPersonalOrCompanyChange = (e: any) => {
    filterForm.setFieldValue("is_personal_or_company", e.currentTarget.value);
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
          {ClassificationFilterTagsConfig.map(
            (config, index) =>
              !!filterForm.values[config.fieldName] && (
                <FilterTag
                  fieldName={config.fieldName}
                  closeBtn={config.closeBtn}
                  onClose={(fieldName) => {
                    filterForm.setFieldValue(fieldName, "");
                    setReloadClassification(true);
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
              <th className="py-2 px-4 border-b border-r">Income/Expense</th>
              <th className="py-2 px-4 border-b">Actions</th>
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
          Do you really want to remove this classification?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setOpenRemoveModal(false)}
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
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          {mainForm.values.id
            ? "Update classification"
            : "Add new classification"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="classification-form" onSubmit={formSubmit}>
              <div className="flex flex-col gap-2 border-2 border-violet-950 border-opacity-50 p-4 mb-6">
                <div>
                  <Checkbox
                    name="is_personal_transaction_classification"
                    id="is_personal_transaction_classification"
                    className="relative top-1"
                    checked={
                      mainForm.values.is_personal_transaction_classification
                    }
                    onChange={mainForm.handleChange}
                  ></Checkbox>
                  <label
                    className="pl-3 text-violet-950 cursor-pointer"
                    htmlFor="is_personal_transaction_classification"
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
                    name="is_income"
                    value={""}
                    checked={!mainForm.values.is_income}
                    onChange={mainForm.handleChange}
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
                    name="is_income"
                    value={"on"}
                    checked={mainForm.values.is_income}
                    onChange={mainForm.handleChange}
                  ></input>
                  <label className="cursor-pointer ml-2" htmlFor="is_income">
                    Income Classification
                  </label>
                </div>
              </div>
              <InputText
                label="Name *"
                name="name"
                required
                value={mainForm.values.name}
                onChange={mainForm.handleChange}
                errorMessage={responseErrors?.data?.errors?.["name"]}
              ></InputText>
              {!mainForm.values.is_personal_transaction_classification && (
                <InputSelect
                  isClearable
                  isMulti
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
        open={openFilterModal}
        onClose={() => setOpenFilterModal(false)}
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
                Income or Expense Classification
              </span>
              <div className="p-4 text-violet-950 flex justify-between border-2 border-violet-950 border-opacity-50">
                <div>
                  <input
                    id="income_expense_all_filter"
                    type="radio"
                    name="is_income_or_expense"
                    value={"all"}
                    onChange={isIncomeOrExpenseChange}
                    checked={filterForm.values.is_income_or_expense === "all"}
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
                    name="is_income_or_expense"
                    value={"expense"}
                    onChange={isIncomeOrExpenseChange}
                    checked={
                      filterForm.values.is_income_or_expense === "expense"
                    }
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
                    name="is_income_or_expense"
                    value={"income"}
                    onChange={isIncomeOrExpenseChange}
                    checked={
                      filterForm.values.is_income_or_expense === "income"
                    }
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
              <div className="p-4 text-violet-950 flex justify-between border-2 border-violet-950 border-opacity-50">
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
                    Personal classification
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
                    Company classification
                  </label>
                </div>
              </div>
            </div>
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
                name="company"
                onChange={(event) => onCompanyFilterChange(event as Company)}
                value={filterForm.values.company}
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
  return {
    companyData: await companyLoader(request),
  };
}
