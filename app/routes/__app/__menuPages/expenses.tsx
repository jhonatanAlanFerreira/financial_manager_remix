import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import { Modal } from "react-responsive-modal";
import { useEffect, useState } from "react";
import DangerButton from "~/components/buttons/danger-button/DangerButton";
import { Form, useLoaderData } from "@remix-run/react";
import toast from "react-hot-toast";
import axios, { AxiosResponse, isAxiosError } from "axios";
import ServerResponse from "~/interfaces/ServerResponse";
import InputText from "~/components/inputs/inputText/InputText";
import Checkbox from "~/components/inputs/checkbox/Checkbox";
import { LoaderFunctionArgs } from "@remix-run/node";
import Loader from "~/components/loader/Loader";
import ValidatedData from "~/interfaces/ValidatedData";
import { loader as companyLoader } from "~/routes/api/company/index";
import { Company, Expense } from "@prisma/client";
import Icon from "~/components/icon/Icon";
import InputSelect from "~/components/inputs/inputSelect/InputSelect";
import { useFormik } from "formik";
import { ExpenseForm } from "~/interfaces/forms/expense/ExpenseForm";
import FilterTag from "~/components/filterTag/FilterTag";
import ExpenseFiltersForm from "~/interfaces/forms/expense/ExpenseFiltersForm";
import { ExpenseFilterTagsConfig } from "~/components/pageComponents/expense/ExpenseFilterTagsConfig";
import Pagination from "~/components/pagination/Pagination";
import { queryParamsFromObject } from "~/utilities";
import { useTitle } from "~/components/topBar/TitleContext";

export default function Expenses() {
  const { setTitle } = useTitle();

  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [reloadExpenses, setReloadExpenses] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [expenses, setExpenses] = useState<ServerResponse<Expense[]>>({});
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [loading, setLoading] = useState<boolean>(true);

  const { expenseData, companyData } = useLoaderData<{
    expenseData: ServerResponse<Expense[]>;
    companyData: ServerResponse<Company[]>;
  }>();

  const mainForm = useFormik<ExpenseForm>({
    initialValues: {
      id: "",
      name: "",
      amount: 0,
      companies: [],
      is_personal_expense: false,
    },
    onSubmit: () => {},
  });

  const filterForm = useFormik<ExpenseFiltersForm>({
    initialValues: {
      name: "",
      amount_greater: 0,
      amount_less: 0,
      company: null,
      is_personal_or_company: "all",
    },
    onSubmit: () => {},
  });

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;

  useEffect(() => {
    buildSearchParamsUrl();
    setCurrentPage(1);
    setTitle("Expenses");

    return () => {
      setTitle("");
    };
  }, []);

  useEffect(() => {
    if (expenseData) {
      setCurrentPage(expenseData.pageInfo?.currentPage || 0);
      setTotalPages(expenseData.pageInfo?.totalPages || 0);
      setExpenses(expenseData);
    }
    if (companyData) {
      setCompanies(companyData);
    }
    setLoading(false);
  }, [expenseData, companyData]);

  useEffect(() => {
    if (currentPage) {
      loadExpenses();
    }
  }, [currentPage]);

  useEffect(() => {
    if (filterForm.values.is_personal_or_company === "personal") {
      filterForm.setFieldValue("company", null);
    }
  }, [filterForm.values.is_personal_or_company]);

  useEffect(() => {
    buildSearchParamsUrl();
  }, [filterForm.values]);

  useEffect(() => {
    if (reloadExpenses) {
      loadExpenses();
    }
  }, [searchParams]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get<ServerResponse<Expense[]>>(
        `/api/expense?${searchParams}${
          searchParams ? "&" : ""
        }${paginationParams()}`
      );

      setCurrentPage(res.data.pageInfo?.currentPage || 1);
      setTotalPages(res.data.pageInfo?.totalPages || 1);

      setExpenses(res.data);
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
        `/api/expense?expenseId=${mainForm.values.id}`,
        formData
      );
      loadingMessage = "Updating expense";
    } else {
      axiosRequest = axios.post("/api/expense", formData);
      loadingMessage = "Creating expense";
    }

    setIsSubmitting(true);

    toast
      .promise(axiosRequest, {
        loading: loadingMessage,
        success: (res: AxiosResponse<ServerResponse>) => {
          setOpenAddModal(false);
          loadExpenses();
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

  const getExpenseType = (expense: Expense) => {
    return expense.is_personal_expense ? "Personal Expense" : "Company Expense";
  };

  const removeExpense = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    toast.promise(
      axios.delete(`/api/expense?expenseId=${mainForm.values.id}`),
      {
        loading: "Deleting expense",
        success: (res: AxiosResponse<ServerResponse>) => {
          loadExpenses();
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

  const setFormValues = (expense: Expense) => {
    mainForm.setValues({
      id: expense.id,
      amount: expense.amount,
      is_personal_expense: expense.is_personal_expense,
      name: expense.name,
      companies:
        companies.data?.filter((company) =>
          expense.company_ids.includes(company.id)
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

  const onClickUpdate = (expense: Expense) => {
    setFormValues(expense);
    setOpenAddModal(true);
  };

  const onClickDelete = (expense: Expense) => {
    mainForm.setFieldValue("id", expense.id);
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
    loadExpenses();
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
          {ExpenseFilterTagsConfig.map(
            (config, index) =>
              !!filterForm.values[config.fieldName] && (
                <FilterTag
                  fieldName={config.fieldName}
                  closeBtn={config.closeBtn}
                  onClose={(fieldName) => {
                    filterForm.setFieldValue(fieldName, "");
                    setReloadExpenses(true);
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
          Do you really want to remove this expense?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setOpenRemoveModal(false)}
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
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
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
                  name="is_personal_expense"
                  id="is_personal_expense"
                  checked={mainForm.values.is_personal_expense}
                  onChange={mainForm.handleChange}
                ></Checkbox>
                <label
                  className="pl-3 text-violet-950 cursor-pointer"
                  htmlFor="is_personal_expense"
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
                errorMessage={responseErrors?.data?.errors?.["name"]}
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
              {!mainForm.values.is_personal_expense && (
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
                Personal or Company Expense
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
