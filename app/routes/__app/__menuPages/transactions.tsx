import {
  Company,
  Expense,
  Transaction,
  TransactionClassification,
} from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "react-responsive-modal";
import DangerButton from "~/components/buttons/danger-button/DangerButton";
import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import InputSelect from "~/components/inputs/inputSelect/InputSelect";
import InputText from "~/components/inputs/inputText/InputText";
import Loader from "~/components/loader/Loader";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as classificationLoader } from "~/routes/api/classification/index";
import { loader as expenseLoader } from "~/routes/api/expense/index";
import { loader as transactionLoader } from "~/routes/api/transaction/index";
import Icon from "~/components/icon/Icon";
import { formatDate, todayFormatedDate } from "~/utilities";

export default function Transactions() {
  const [loading, setLoading] = useState<boolean>(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [classifications, setClassifications] = useState<
    ServerResponse<TransactionClassification[]>
  >({});
  const [expenses, setExpenses] = useState<ServerResponse<Expense[]>>({});
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [transactions, setTransactions] = useState<
    ServerResponse<Transaction[]>
  >({});
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>();
  const [transactionToUpdate, setTransactionToUpdate] =
    useState<Transaction | null>();

  const { companyData, transactionData, expenseData, classificationData } =
    useLoaderData<{
      companyData: ServerResponse<Company[]>;
      transactionData: ServerResponse<Transaction[]>;
      expenseData: ServerResponse<Expense[]>;
      classificationData: ServerResponse<TransactionClassification[]>;
    }>();

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;
  const getSelectExpenseOptionValue = (option: Expense) => option.id;
  const getSelectExpenseOptionLabel = (option: Expense) => option.name;
  const getSelectClassificationOptionValue = (
    option: TransactionClassification
  ) => option.id;
  const getSelectClassificationOptionLabel = (
    option: TransactionClassification
  ) => option.name;

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData);
    }
    if (classificationData) {
      setClassifications(classificationData);
    }
    if (expenseData) {
      setExpenses(expenseData);
    }
    if (transactionData) {
      setTransactions(transactionData);
    }

    setLoading(false);
  }, [companyData, transactionData, expenseData, classificationData]);

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    let axiosRequest;
    let loadingMessage;

    if (formData.get("id")) {
      axiosRequest = axios.patch(
        `/api/transaction?transactionId=${transactionToUpdate?.id}`,
        formData
      );
      loadingMessage = "Updating transaction";
    } else {
      axiosRequest = axios.post("/api/transaction", formData);
      loadingMessage = "Creating transaction";
    }

    setIsSubmitting(true);

    toast
      .promise(axiosRequest, {
        loading: loadingMessage,
        success: (res: AxiosResponse<ServerResponse>) => {
          setOpenAddModal(false);
          loadTransactions();
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

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/transaction");
      setTransactions(res.data);
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

  const getCompanyNameFromTransaction = (transaction: Transaction) => {
    return companies?.data?.find((c) => c.id == transaction.company_id)?.name;
  };
  const getExpenseNameFromTransaction = (transaction: Transaction) => {
    return expenses?.data?.find((e) => e.id == transaction.expense_id)?.name;
  };
  const getClassificationNameFromTransaction = (transaction: Transaction) => {
    return classifications?.data?.find(
      (c) => c.id == transaction.transaction_classification_id
    )?.name;
  };

  const removeTransaction = async () => {
    if (transactionToDelete) {
      setOpenRemoveModal(false);
      setLoading(true);

      toast.promise(
        axios.delete(
          `/api/transaction?transactionId=${transactionToDelete.id}`
        ),
        {
          loading: "Deleting transaction",
          success: (res: AxiosResponse<ServerResponse>) => {
            loadTransactions();
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
            setTransactionToUpdate(null);
            setOpenAddModal(true);
          }}
          text="Add"
          iconName="PlusCircle"
        ></PrimaryButton>
      </div>
      <table className="min-w-full bg-white border border-gray-300 text-violet-900">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b border-r">Name</th>
            <th className="py-2 px-4 border-b border-r">Company</th>
            <th className="py-2 px-4 border-b border-r">Expense</th>
            <th className="py-2 px-4 border-b border-r">Classification</th>
            <th className="py-2 px-4 border-b border-r">Date</th>
            <th className="py-2 px-4 border-b border-r">Amount</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {!transactions.data?.length && (
            <tr>
              <td className="py-2 px-4" colSpan={4}>
                There are no data yet
              </td>
            </tr>
          )}
          {transactions.data?.map((transaction, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b border-r">
                {transaction.name}
              </td>
              <td
                className={`py-2 px-4 border-b border-r ${
                  getCompanyNameFromTransaction(transaction) ? "" : "opacity-50"
                }`}
              >
                {getCompanyNameFromTransaction(transaction) || "Not set"}
              </td>
              <td
                className={`py-2 px-4 border-b border-r ${
                  getExpenseNameFromTransaction(transaction) ? "" : "opacity-50"
                }`}
              >
                {getExpenseNameFromTransaction(transaction) || "Not set"}
              </td>
              <td
                className={`py-2 px-4 border-b border-r ${
                  getClassificationNameFromTransaction(transaction)
                    ? ""
                    : "opacity-50"
                }`}
              >
                {getClassificationNameFromTransaction(transaction) || "Not set"}
              </td>
              <td className="py-2 px-4 border-b border-r">
                {formatDate(transaction.transaction_date)}
              </td>
              <td className="py-2 px-4 border-b border-r">
                {transaction.amount}
              </td>
              <td className="flex justify-center gap-5 py-2 px-4 border-b">
                <Icon
                  onClick={() => {
                    setTransactionToUpdate(transaction);
                    setOpenAddModal(true);
                  }}
                  name="Edit"
                  className="cursor-pointer"
                ></Icon>{" "}
                <Icon
                  onClick={() => {
                    setTransactionToDelete(transaction);
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
          Do you really want to remove this transaction?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setOpenRemoveModal(false)}
          ></PrimaryButton>
          <DangerButton
            disabled={loading}
            text="Remove"
            onClick={() => removeTransaction()}
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
          {transactionToUpdate ? "Update transaction" : "Add new transaction"}
        </h2>
        <div className="overflow-auto">
          <div className="p-4">
            <Form method="post" id="classification-form" onSubmit={formSubmit}>
              <input
                type="text"
                name="id"
                hidden
                defaultValue={transactionToUpdate?.id}
              />
              <InputText
                label="Name *"
                name="name"
                required
                defaultValue={transactionToUpdate?.name}
              ></InputText>
              <InputText
                label="Date *"
                name="transaction_date"
                type="date"
                required
                defaultValue={
                  transactionToUpdate?.transaction_date || todayFormatedDate()
                }
              ></InputText>
              <InputText
                label="Amount *"
                name="amount"
                type="number"
                required
                defaultValue={transactionToUpdate?.amount || 0}
                errorMessage={responseErrors?.data?.errors?.["amount"]}
              ></InputText>
              <InputSelect
                isClearable
                className="mb-8"
                placeholder="Company"
                options={companies?.data}
                getOptionLabel={getSelectCompanyOptionLabel as any}
                getOptionValue={getSelectCompanyOptionValue as any}
                name="company"
                defaultValue={companies.data?.find(
                  (company) => company.id == transactionToUpdate?.company_id
                )}
              ></InputSelect>
              <InputSelect
                isClearable
                className="mb-8"
                placeholder="Expense"
                options={expenses?.data}
                getOptionLabel={getSelectExpenseOptionLabel as any}
                getOptionValue={getSelectExpenseOptionValue as any}
                name="expense"
                defaultValue={expenses.data?.find(
                  (expense) => expense.id == transactionToUpdate?.expense_id
                )}
              ></InputSelect>
              <InputSelect
                isClearable
                className="mb-8"
                placeholder="Classification"
                options={classifications?.data}
                getOptionLabel={getSelectClassificationOptionLabel as any}
                getOptionValue={getSelectClassificationOptionValue as any}
                name="classification"
                defaultValue={classifications.data?.find(
                  (classification) =>
                    classification.id ==
                    transactionToUpdate?.transaction_classification_id
                )}
              ></InputSelect>
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
              form="classification-form"
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
    companyLoader(request),
    expenseLoader(request),
    classificationLoader(request),
    transactionLoader(request),
  ]);

  return {
    companyData: res[0],
    expenseData: res[1],
    classificationData: res[2],
    transactionData: res[3],
  };
}
