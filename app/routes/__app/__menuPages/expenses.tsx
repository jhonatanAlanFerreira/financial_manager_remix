import PrimaryButton from "~/components/buttons/primary-button/PrimaryButton";
import { requireUserSession } from "~/data/auth.server";
import { Modal } from "react-responsive-modal";
import { useState } from "react";
import DangerButton from "~/components/buttons/danger-button/DangerButton";
import { Form } from "@remix-run/react";
import toast from "react-hot-toast";
import axios, { AxiosResponse, isAxiosError } from "axios";
import ServerResponse from "~/interfaces/ServerResponse";
import InputText from "~/components/inputs/inputText/InputText";
import Checkbox from "~/components/inputs/checkbox/Checkbox";

export default function Expenses() {
  const [openAddModal, setOpenAddModal] = useState(false);

  const onOpenAddModal = () => setOpenAddModal(true);
  const onCloseAddModal = () => setOpenAddModal(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [responseErrors, setResponseErrors] = useState<ServerResponse>({});

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);

    toast
      .promise(axios.post("/api/expense", formData), {
        loading: "Creating expense",
        success: (res: AxiosResponse<ServerResponse>) => {
          setOpenAddModal(false);
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
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div>
      <div className="flex justify-end">
        <PrimaryButton
          onClick={onOpenAddModal}
          text="Add"
          iconName="PlusCircle"
        ></PrimaryButton>
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
    </div>
  );
}

export async function loader({ request }: { request: Request }) {
  await requireUserSession(request);
  return null;
}
