import { Company } from "@prisma/client";
import { Form } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "react-responsive-modal";
import Accordion from "~/components/accordion/Accordion";
import DangerButton from "~/components/buttons/danger-button/DangerButton";
import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import FilterTag from "~/components/filterTag/FilterTag";
import Icon from "~/components/icon/Icon";
import InputText from "~/components/inputs/inputText/InputText";
import Loader from "~/components/loader/Loader";
import AccountDropdown from "~/components/pageComponents/company/AccountDropdown";
import { CompanyFilterTagsConfig } from "~/components/pageComponents/company/CompanyFilterTagsConfig";
import Pagination from "~/components/pagination/Pagination";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";
import CompanyFiltersForm from "~/interfaces/forms/company/CompanyFiltersForm";
import CompanyForm from "~/interfaces/forms/company/CompanyForm";
import { CompanyWithAccounts } from "~/interfaces/prismaModelDetails/company";
import { queryParamsFromObject } from "~/utilities";

export default function Companies() {
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [reloadCompanies, setReloadCompanies] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [companies, setCompanies] = useState<
    ServerResponse<CompanyWithAccounts[]>
  >({});
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});

  const formik = useFormik<CompanyForm>({
    initialValues: {
      id: "",
      name: "",
    },
    onSubmit: () => {},
  });

  const filterForm = useFormik<CompanyFiltersForm>({
    initialValues: {
      name: "",
      working_capital_greater: 0,
      working_capital_less: 0,
      with_accounts: true,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    buildSearchParamsUrl();
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    buildSearchParamsUrl();
  }, [filterForm.values]);

  useEffect(() => {
    if (currentPage) {
      loadCompanies();
    }
  }, [currentPage]);

  useEffect(() => {
    if (reloadCompanies) {
      setReloadCompanies(false);
      loadCompanies();
    }
  }, [searchParams]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/company?${searchParams}${
          searchParams ? "&" : ""
        }${paginationParams()}`
      );

      setCurrentPage(res.data.pageInfo?.currentPage || 1);
      setTotalPages(res.data.pageInfo?.totalPages || 1);

      setCompanies(res.data);
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

    if (formik.values.id) {
      axiosRequest = axios.patch(
        `/api/company?companyId=${formik.values.id}`,
        formData
      );
      loadingMessage = "Updating company";
    } else {
      axiosRequest = axios.post("/api/company", formData);
      loadingMessage = "Creating company";
    }

    setIsSubmitting(true);

    toast
      .promise(axiosRequest, {
        loading: loadingMessage,
        success: (res: AxiosResponse<ServerResponse>) => {
          setOpenAddModal(false);
          loadCompanies();
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

  const removeCompany = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    toast.promise(axios.delete(`/api/company?companyId=${formik.values.id}`), {
      loading: "Deleting company",
      success: (res: AxiosResponse<ServerResponse>) => {
        loadCompanies();
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

  const setFormValues = (company: Company) => {
    formik.setValues({
      id: company.id,
      name: company.name,
    });
  };

  const onClickAdd = () => {
    formik.resetForm();
    setOpenAddModal(true);
  };

  const onUpdateCompany = (company: Company) => {
    setFormValues(company);
    setOpenAddModal(true);
  };

  const onRemoveCompany = (company: Company) => {
    formik.setFieldValue("id", company.id);
    setOpenRemoveModal(true);
  };

  const onModalCancel = () => {
    formik.resetForm();
    setResponseErrors({});
    setOpenAddModal(false);
  };

  const onFilterFormSubmit = async () => {
    setOpenFilterModal(false);
    loadCompanies();
  };

  const buildSearchParamsUrl = () => {
    setSearchParams(queryParamsFromObject(filterForm.values));
  };

  const paginationParams = () => {
    return new URLSearchParams({
      page: currentPage,
      pageSize: 10,
    } as any).toString();
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
          {CompanyFilterTagsConfig.map(
            (config, index) =>
              !!filterForm.values[config.fieldName] && (
                <FilterTag
                  fieldName={config.fieldName}
                  closeBtn={config.closeBtn}
                  onClose={(fieldName) => {
                    filterForm.setFieldValue(fieldName, "");
                    setReloadCompanies(true);
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
          iconName="PlusCircle"
          text="Add Company"
        ></PrimaryButton>
      </div>
      <div className="overflow-x-auto px-10">
        {companies.data?.map((company, index) => (
          <Accordion
            key={index}
            title={company.name}
            titleIcons={[
              {
                iconName: "Edit",
                iconTitle: "Update Company",
                onClick: () => onUpdateCompany(company),
              },
              {
                iconName: "Trash",
                iconTitle: "Remove Company",
                iconColor: "#f87171",
                onClick: () => onRemoveCompany(company),
              },
            ]}
          >
            <AccountDropdown company={company}></AccountDropdown>
          </Accordion>
        ))}
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
          Do you really want to remove this company?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setOpenRemoveModal(false)}
          ></PrimaryButton>
          <DangerButton
            disabled={loading}
            text="Remove"
            onClick={removeCompany}
          ></DangerButton>
        </div>
      </Modal>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-3/4",
        }}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          {formik.values.id ? "Update company" : "Add new company"}
        </h2>
        <div className="overflow-auto">
          <div className="p-4">
            <Form method="post" id="company-form" onSubmit={formSubmit}>
              <InputText
                label="Name *"
                name="name"
                required
                value={formik.values.name}
                onChange={formik.handleChange}
                errorMessage={responseErrors?.data?.errors?.["name"]}
              ></InputText>
            </Form>
          </div>
          <div className="flex justify-between p-2">
            <DangerButton text="Cancel" onClick={onModalCancel}></DangerButton>
            <PrimaryButton
              text="Save"
              disabled={isSubmitting}
              form="company-form"
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
            <InputText
              type="number"
              label="Working Capital greater than"
              name="working_capital_greater"
              value={filterForm.values.working_capital_greater}
              onChange={filterForm.handleChange}
            ></InputText>
            <InputText
              type="number"
              label="Working Capital less than"
              name="working_capital_less"
              value={filterForm.values.working_capital_less}
              onChange={filterForm.handleChange}
            ></InputText>
            <InputText
              label="Name"
              name="name"
              onChange={filterForm.handleChange}
              value={filterForm.values.name}
            ></InputText>

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
