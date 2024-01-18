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
import { Expense } from "@prisma/client";
import ValidatedData from "~/interfaces/ValidatedData";

export default function Expenses() {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [expenses, setExpenses] = useState<ServerResponse<Expense[]>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [loading, setLoading] = useState<boolean>(true);

  const expenseData = useLoaderData<ServerResponse<Expense[]>>();

  const onOpenAddModal = () => setOpenAddModal(true);
  const onCloseAddModal = () => setOpenAddModal(false);

  useEffect(() => {
    if (expenseData) {
      setExpenses(expenseData);
      setLoading(false);
    }
  }, [expenseData]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/expense");
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

    setIsSubmitting(true);

    toast
      .promise(axios.post("/api/expense", formData), {
        loading: "Creating expense",
        success: (res: AxiosResponse<ServerResponse>) => {
          setOpenAddModal(false);
          loadExpenses();
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

  return (
    <Loader loading={loading}>
      <div className="flex justify-end p-3">
        <PrimaryButton
          onClick={onOpenAddModal}
          text="Add"
          iconName="PlusCircle"
        ></PrimaryButton>
      </div>
      <div className="overflow-x-auto px-10">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b border-r">Name</th>
              <th className="py-2 px-4 border-b border-r">Amount</th>
              <th className="py-2 px-4 border-b">Personal Expense</th>
            </tr>
          </thead>
          <tbody>
            {expenses.data?.map((expense, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-r">{expense.name}</td>
                <td className="py-2 px-4 border-b border-r">
                  {expense.amount}
                </td>
                <td className="py-2 px-4 border-b">
                  {expense.is_personal_expense ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-3/4",
        }}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
        open={openAddModal}
        onClose={onCloseAddModal}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Add new expense
        </h2>
        <div className="overflow-auto">
          <div className="p-4">
            <Form method="post" id="expense-form" onSubmit={formSubmit}>
              <InputText
                label="Name"
                name="name"
                required
                errorMessage={responseErrors?.data?.errors?.["name"]}
              ></InputText>
              <InputText label="Amount" name="amount" type="number"></InputText>
              <Checkbox
                name="is_personal_expense"
                id="is_personal_expense"
              ></Checkbox>
              <label
                className="pl-3 text-violet-950"
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
  return expenseLoader(request);
}
