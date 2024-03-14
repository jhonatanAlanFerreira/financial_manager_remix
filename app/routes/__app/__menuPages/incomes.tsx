import { Company, Income } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "react-responsive-modal";
import DangerButton from "~/components/buttons/danger-button/DangerButton";
import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import Icon from "~/components/icon/Icon";
import Checkbox from "~/components/inputs/checkbox/Checkbox";
import InputSelect from "~/components/inputs/inputSelect/InputSelect";
import InputText from "~/components/inputs/inputText/InputText";
import Loader from "~/components/loader/Loader";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";
import { IncomeWithCompanies } from "~/interfaces/prismaModelDetails/income";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as incomeLoader } from "~/routes/api/income/index";

export default function Incomes() {
  const [loading, setLoading] = useState<boolean>(false); //true
  const [incomeToDelete, setIncomeToDelete] = useState<Income | null>();
  const [incomeToUpdate, setIncomeToUpdate] = useState<Income | null>();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPersonalIncome, setIsPersonalIncome] = useState<boolean>(false);
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [incomes, setIncomes] = useState<ServerResponse<Income[]>>({});

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;

  const { companyData, incomeData } = useLoaderData<{
    companyData: ServerResponse<Company[]>;
    incomeData: ServerResponse<IncomeWithCompanies[]>;
  }>();

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData);
    }
    if (incomeData) {
      setIncomes(incomeData);
    }
    setLoading(false);
  }, [companyData, incomeData]);

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    let axiosRequest;
    let loadingMessage;

    if (formData.get("id")) {
      axiosRequest = axios.patch(
        `/api/income?incomeId=${incomeToUpdate?.id}`,
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
      const res = await axios.get("/api/income");
      setIncomes(res.data);
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

  const removeIncome = async () => {
    if (incomeToDelete) {
      setOpenRemoveModal(false);
      setLoading(true);

      toast.promise(axios.delete(`/api/income?incomeId=${incomeToDelete.id}`), {
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
    }
  };

  const onClickAdd = () => {
    setIncomeToUpdate(null);
    setOpenAddModal(true);
    setIsPersonalIncome(false);
  };

  return (
    <Loader loading={loading}>
      <div className="flex justify-end mb-2">
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
                <td className="flex justify-center gap-5 py-2 px-4 border-b">
                  <Icon
                    onClick={() => {
                      setIncomeToUpdate(income);
                      setOpenAddModal(true);
                    }}
                    name="Edit"
                    className="cursor-pointer"
                  ></Icon>{" "}
                  <Icon
                    onClick={() => {
                      setIncomeToDelete(income);
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
            onClick={() => removeIncome()}
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
          {incomeToUpdate ? "Update income" : "Add new income"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="income-form" onSubmit={formSubmit}>
              <input
                type="text"
                name="id"
                hidden
                defaultValue={incomeToUpdate?.id}
              />
              <InputText
                label="Name *"
                name="name"
                required
                defaultValue={incomeToUpdate?.name}
                errorMessage={responseErrors?.data?.errors?.["name"]}
              ></InputText>
              <InputText
                label="Amount"
                name="amount"
                type="number"
                step={0.01}
                min={0}
                defaultValue={incomeToUpdate?.amount || 0}
              ></InputText>
              <div className="mb-6">
                <Checkbox
                  onChange={(event) =>
                    setIsPersonalIncome(event.target.checked)
                  }
                  name="is_personal_income"
                  id="is_personal_income"
                  defaultChecked={incomeToUpdate?.is_personal_income}
                ></Checkbox>
                <label
                  className="pl-3 text-violet-950 cursor-pointer"
                  htmlFor="is_personal_income"
                >
                  Use as personal income
                </label>
              </div>
              {!isPersonalIncome && (
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
                    incomeToUpdate?.company_ids.includes(company.id)
                  )}
                ></InputSelect>
              )}
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
              form="income-form"
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
    incomeLoader(request, true),
  ]);
  return {
    companyData: res[0],
    incomeData: res[1],
  };
}
