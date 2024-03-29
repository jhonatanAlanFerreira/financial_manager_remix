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
import { loader as expenseLoader } from "~/routes/api/expense/index";
import { LoaderFunctionArgs } from "@remix-run/node";
import Loader from "~/components/loader/Loader";
import ValidatedData from "~/interfaces/ValidatedData";
import { ExpenseWithCompanies } from "~/interfaces/prismaModelDetails/expense";
import { loader as companyLoader } from "~/routes/api/company/index";
import { Company, Expense } from "@prisma/client";
import Icon from "~/components/icon/Icon";
import InputSelect from "~/components/inputs/inputSelect/InputSelect";

export default function Expenses() {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [expenses, setExpenses] = useState<
    ServerResponse<ExpenseWithCompanies[]>
  >({});
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>();
  const [expenseToUpdate, setExpenseToUpdate] = useState<Expense | null>();

  const { expenseData, companyData } = useLoaderData<{
    expenseData: ServerResponse<ExpenseWithCompanies[]>;
    companyData: ServerResponse<Company[]>;
  }>();

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;

  useEffect(() => {
    if (expenseData) {
      setExpenses(expenseData);
    }
    if (companyData) {
      setCompanies(companyData);
    }
    setLoading(false);
  }, [expenseData, companyData]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/expense?includeCompanies=true");
      setExpenses(res.data);
      setLoading(false);
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

    if (formData.get("id")) {
      axiosRequest = axios.patch(
        `/api/expense?expenseId=${expenseToUpdate?.id}`,
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

  const getExpenseType = (expense: ExpenseWithCompanies) => {
    if (expense.companies.length) {
      return expense.is_personal_expense
        ? "Company and Personal Expense"
        : "Company Expense";
    } else {
      if (expense.is_personal_expense) return "Personal Expense";
      return null;
    }
  };

  const removeExpense = async () => {
    if (expenseToDelete) {
      setOpenRemoveModal(false);
      setLoading(true);

      toast.promise(
        axios.delete(`/api/expense?expenseId=${expenseToDelete.id}`),
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
    }
  };

  return (
    <Loader loading={loading}>
      <div className="flex justify-end mb-2">
        <PrimaryButton
          onClick={() => {
            setExpenseToUpdate(null);
            setOpenAddModal(true);
          }}
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
                <td
                  className={`py-2 px-4 border-b border-r ${
                    getExpenseType(expense) ? "" : "opacity-50"
                  }`}
                >
                  {getExpenseType(expense) || "Not set"}
                </td>
                <td className="flex justify-center gap-5 py-2 px-4 border-b">
                  <Icon
                    onClick={() => {
                      setExpenseToUpdate(expense);
                      setOpenAddModal(true);
                    }}
                    name="Edit"
                    className="cursor-pointer"
                  ></Icon>{" "}
                  <Icon
                    onClick={() => {
                      setExpenseToDelete(expense);
                      setOpenRemoveModal(true);
                    }}
                    name="Trash"
                    className="cursor-pointer"
                    color="red"
                  ></Icon>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-1/3",
        }}
        center
        showCloseIcon={false}
        open={openRemoveModal}
        onClose={() => setOpenAddModal(false)}
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
            onClick={() => removeExpense()}
          ></DangerButton>
        </div>
      </Modal>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-3/4 overflow-visible",
        }}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          {expenseToUpdate ? "Update expense" : "Add new expense"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="expense-form" onSubmit={formSubmit}>
              <input
                type="text"
                name="id"
                hidden
                defaultValue={expenseToUpdate?.id}
              />
              <InputText
                label="Name *"
                name="name"
                required
                defaultValue={expenseToUpdate?.name}
                errorMessage={responseErrors?.data?.errors?.["name"]}
              ></InputText>
              <InputText
                label="Amount"
                name="amount"
                type="number"
                step={0.01}
                min={0}
                defaultValue={expenseToUpdate?.amount || 0}
              ></InputText>
              <InputSelect
                isMulti
                isClearable
                className="mb-8"
                placeholder="Company"
                options={companies?.data}
                getOptionLabel={getSelectCompanyOptionLabel as any}
                getOptionValue={getSelectCompanyOptionValue as any}
                name="companies"
                defaultValue={companies?.data?.filter((company) =>
                  expenseToUpdate?.company_ids.includes(company.id)
                )}
              ></InputSelect>
              <Checkbox
                name="is_personal_expense"
                id="is_personal_expense"
                defaultChecked={expenseToUpdate?.is_personal_expense}
              ></Checkbox>
              <label
                className="pl-3 text-violet-950 cursor-pointer"
                htmlFor="is_personal_expense"
              >
                Use as personal expense
              </label>
            </Form>
          </div>
          <div className="flex justify-between p-2">
            <DangerButton
              text="Cancel"
              onClick={() => setOpenAddModal(false)}
            ></DangerButton>
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
    </Loader>
  );
}

export async function loader(request: LoaderFunctionArgs) {
  const res = await Promise.all([
    expenseLoader(request, true),
    companyLoader(request),
  ]);

  return {
    expenseData: res[0],
    companyData: res[1],
  };
}
