import { Company, Income } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "react-responsive-modal";
import Icon from "~/components/icon/icon";
import Checkbox from "~/components/inputs/checkbox/checkbox";
import Loader from "~/components/loader/loader";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";
import IncomeFiltersForm from "~/interfaces/forms/income/IncomeFiltersForm";
import { IncomeForm } from "~/interfaces/forms/income/IncomeForm";
import { IncomeWithCompanies } from "~/interfaces/prismaModelDetails/income";
import { loader as companyLoader } from "~/routes/api/company/index";
import Pagination from "~/components/pagination/pagination";
import { queryParamsFromObject } from "~/utils/utilities";
import { useTitle } from "~/components/top-bar/title-context";
import { IncomeFilterTagsConfig } from "~/components/page-components/income/income-filter-tags-config";
import FilterTag from "~/components/filter-tag/filter-tag";
import PrimaryButton from "~/components/buttons/primary-button/primary-button";
import DangerButton from "~/components/buttons/danger-button/danger-button";
import InputText from "~/components/inputs/input-text/input-text";
import InputSelect from "~/components/inputs/input-select/input-select";

export default function Incomes() {
  const { setTitle } = useTitle();

  const [loading, setLoading] = useState<boolean>(true);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [reloadIncomes, setReloadIncomes] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [incomes, setIncomes] = useState<ServerResponse<Income[]>>({});
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;

  const { companyData, incomeData } = useLoaderData<{
    companyData: ServerResponse<Company[]>;
    incomeData: ServerResponse<IncomeWithCompanies[]>;
  }>();

  const mainForm = useFormik<IncomeForm>({
    initialValues: {
      id: "",
      name: "",
      amount: 0,
      companies: [],
      is_personal_income: false,
    },
    onSubmit: () => {},
  });

  const filterForm = useFormik<IncomeFiltersForm>({
    initialValues: {
      name: "",
      amount_greater: 0,
      amount_less: 0,
      company: null,
      is_personal_or_company: "all",
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    buildSearchParamsUrl();
    setCurrentPage(1);
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
      setCurrentPage(incomeData.pageInfo?.currentPage || 0);
      setTotalPages(incomeData.pageInfo?.totalPages || 0);
      setIncomes(incomeData);
    }
    setLoading(false);
  }, [companyData, incomeData]);

  useEffect(() => {
    mainForm.setFieldValue("companies", null);
  }, [mainForm.values.is_personal_income]);

  useEffect(() => {
    if (filterForm.values.is_personal_or_company === "personal") {
      filterForm.setFieldValue("company", null);
    }
  }, [filterForm.values.is_personal_or_company]);

  useEffect(() => {
    if (currentPage) {
      loadIncomes();
    }
  }, [currentPage]);

  useEffect(() => {
    buildSearchParamsUrl();
  }, [filterForm.values]);

  useEffect(() => {
    if (reloadIncomes) {
      setReloadIncomes(false);
      loadIncomes();
    }
  }, [searchParams]);

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    let axiosRequest;
    let loadingMessage;

    if (mainForm.values.id) {
      axiosRequest = axios.patch(
        `/api/income?incomeId=${mainForm.values.id}`,
        formData
      );
      loadingMessage = "Updating income";
    } else {
      axiosRequest = axios.post("/api/income", formData);
      loadingMessage = "Creating income";
    }

    setIsSubmitting(true);

    toast
      .promise(axiosRequest, {
        loading: loadingMessage,
        success: (res: AxiosResponse<ServerResponse>) => {
          setOpenAddModal(false);
          loadIncomes();
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

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ServerResponse<Income[]>>(
        `/api/income?${searchParams}${
          searchParams ? "&" : ""
        }${paginationParams()}`
      );
      setCurrentPage(res.data.pageInfo?.currentPage || 1);
      setTotalPages(res.data.pageInfo?.totalPages || 1);

      setIncomes(res.data);
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

  const removeIncome = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    toast.promise(axios.delete(`/api/income?incomeId=${mainForm.values.id}`), {
      loading: "Deleting income",
      success: (res: AxiosResponse<ServerResponse>) => {
        loadIncomes();
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
    });
  };

  const getIncomeType = (income: Income) => {
    return income.is_personal_income ? "Personal Income" : "Company Income";
  };

  const onClickAdd = () => {
    mainForm.resetForm();
    setOpenAddModal(true);
  };

  const onModalCancel = () => {
    mainForm.resetForm();
    setResponseErrors({});
    setOpenAddModal(false);
  };

  const onClickDelete = (income: Income) => {
    mainForm.setFieldValue("id", income.id);
    setOpenRemoveModal(true);
  };

  const onClickUpdate = (income: Income) => {
    setFormValues(income);
    setOpenAddModal(true);
  };

  const onCompaniesChange = (companies: Company[]) => {
    mainForm.setFieldValue("companies", companies);
  };

  const setFormValues = (income: Income) => {
    mainForm.setValues({
      id: income.id,
      amount: income.amount,
      is_personal_income: income.is_personal_income,
      name: income.name,
      companies:
        companies.data?.filter((company) =>
          income.company_ids.includes(company.id)
        ) || [],
    });
  };

  const onFilterFormSubmit = async () => {
    setOpenFilterModal(false);
    loadIncomes();
  };

  const onCompanyFilterChange = (company: Company) => {
    filterForm.setFieldValue("company", company);
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: currentPage,
      pageSize: 10,
    } as any).toString();
  };

  const buildSearchParamsUrl = () => {
    setSearchParams(
      queryParamsFromObject(filterForm.values, {
        company: "id",
      })
    );
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
          {IncomeFilterTagsConfig.map(
            (config, index) =>
              !!filterForm.values[config.fieldName] && (
                <FilterTag
                  fieldName={config.fieldName}
                  closeBtn={config.closeBtn}
                  onClose={(fieldName) => {
                    filterForm.setFieldValue(fieldName, "");
                    setReloadIncomes(true);
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
              <th className="py-2 px-4 border-b border-r">Amount</th>
              <th className="py-2 px-4 border-b border-r">Type</th>
              <th className="py-2 px-4 border-b">Actions</th>
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
          Do you really want to remove this income?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setOpenRemoveModal(false)}
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
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          {mainForm.values.id ? "Update income" : "Add new income"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="income-form" onSubmit={formSubmit}>
              <div className="border-2 border-violet-950 border-opacity-50 p-4">
                <Checkbox
                  className="relative top-1"
                  name="is_personal_income"
                  id="is_personal_income"
                  onChange={mainForm.handleChange}
                  checked={mainForm.values.is_personal_income}
                ></Checkbox>
                <label
                  className="pl-3 text-violet-950 cursor-pointer"
                  htmlFor="is_personal_income"
                >
                  Use as personal income
                </label>
              </div>
              <InputText
                label="Name *"
                name="name"
                required
                errorMessage={responseErrors?.data?.errors?.["name"]}
                value={mainForm.values.name}
                onChange={mainForm.handleChange}
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
              {!mainForm.values.is_personal_income && (
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
                Personal or Company Income
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
                    Personal income
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
                    Company income
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
