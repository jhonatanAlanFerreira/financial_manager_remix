import { Company, TransactionClassification } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import axios, { AxiosResponse, isAxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Modal } from "react-responsive-modal";
import DangerButton from "~/components/buttons/danger-button/DangerButton";
import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import Checkbox from "~/components/inputs/checkbox/Checkbox";
import InputSelect from "~/components/inputs/inputSelect/InputSelect";
import InputText from "~/components/inputs/inputText/InputText";
import Loader from "~/components/loader/Loader";
import ServerResponse from "~/interfaces/ServerResponse";
import ValidatedData from "~/interfaces/ValidatedData";
import { loader as companyLoader } from "~/routes/api/company/index";
import { loader as classificationLoader } from "~/routes/api/classification/index";
import Icon from "~/components/icon/Icon";
import { ClassificationWithCompany } from "~/interfaces/prismaModelDetails/classification";

export default function Classifications() {
  const [loading, setLoading] = useState<boolean>(true);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const [classificationToDelete, setClassificationToDelete] =
    useState<TransactionClassification | null>();
  const [classificationToUpdate, setClassificationToUpdate] =
    useState<TransactionClassification | null>();
  const [responseErrors, setResponseErrors] = useState<
    ServerResponse<ValidatedData>
  >({});
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [classifications, setClassifications] = useState<
    ServerResponse<ClassificationWithCompany[]>
  >({});

  const { companyData, classificationData } = useLoaderData<{
    companyData: ServerResponse<Company[]>;
    classificationData: ServerResponse<ClassificationWithCompany[]>;
  }>();

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData);
    }
    if (classificationData) {
      setClassifications(classificationData);
    }
    setLoading(false);
  }, [companyData, classificationData]);

  const loadClassifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/classification?includeCompany=true");
      setClassifications(res.data);
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
        `/api/classification?classificationId=${classificationToUpdate?.id}`,
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

  const getClassificationType = (classification: ClassificationWithCompany) => {
    if (classification.companies.length) {
      return classification.is_personal_transaction_classification
        ? "Company and Personal Transaction Classification"
        : "Company Transaction Classification";
    } else {
      if (classification.is_personal_transaction_classification)
        return "Personal Transaction Classification";
      return null;
    }
  };

  const removeClassification = async () => {
    if (classificationToDelete) {
      setOpenRemoveModal(false);
      setLoading(true);

      toast.promise(
        axios.delete(
          `/api/classification?classificationId=${classificationToDelete.id}`
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
    }
  };

  return (
    <Loader loading={loading}>
      <div className="flex justify-end mb-2">
        <PrimaryButton
          onClick={() => {
            setClassificationToUpdate(null);
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
              <th className="py-2 px-4 border-b border-r">Type</th>
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
                <td
                  className={`py-2 px-4 border-b border-r ${
                    getClassificationType(classification) ? "" : "opacity-50"
                  }`}
                >
                  {getClassificationType(classification) || "Not set"}
                </td>
                <td className="flex justify-center gap-5 py-2 px-4 border-b">
                  <Icon
                    onClick={() => {
                      setClassificationToUpdate(classification);
                      setOpenAddModal(true);
                    }}
                    name="Edit"
                    className="cursor-pointer"
                  ></Icon>{" "}
                  <Icon
                    onClick={() => {
                      setClassificationToDelete(classification);
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
            onClick={() => removeClassification()}
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
          {classificationToUpdate
            ? "Update classification"
            : "Add new classification"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="classification-form" onSubmit={formSubmit}>
              <input
                type="text"
                name="id"
                hidden
                defaultValue={classificationToUpdate?.id}
              />
              <InputText
                label="Name *"
                name="name"
                required
                defaultValue={classificationToUpdate?.name}
                errorMessage={responseErrors?.data?.errors?.["name"]}
              ></InputText>
              <InputSelect
                isClearable
                isMulti
                className="mb-8"
                placeholder="Company"
                options={companies?.data}
                getOptionLabel={getSelectCompanyOptionLabel as any}
                getOptionValue={getSelectCompanyOptionValue as any}
                name="companies"
                defaultValue={companies?.data?.filter((company) =>
                  classificationToUpdate?.company_ids.includes(company.id)
                )}
              ></InputSelect>
              <div className="flex flex-col gap-2">
                <div>
                  <Checkbox
                    name="is_personal_transaction_classification"
                    id="is_personal_transaction_classification"
                    defaultChecked={
                      classificationToUpdate?.is_personal_transaction_classification
                    }
                  ></Checkbox>
                  <label
                    className="pl-3 text-violet-950 cursor-pointer"
                    htmlFor="is_personal_transaction_classification"
                  >
                    Use as personal classification
                  </label>
                </div>
                <div>
                  <Checkbox
                    name="is_income"
                    id="is_income"
                    defaultChecked={classificationToUpdate?.is_income}
                  ></Checkbox>
                  <label
                    className="pl-3 text-violet-950 cursor-pointer"
                    htmlFor="is_income"
                  >
                    Income classification
                  </label>
                </div>
              </div>
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
    classificationLoader(request, true),
  ]);

  return {
    companyData: res[0],
    classificationData: res[1],
  };
}
