import { useFormik } from "formik";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { Modal } from "react-responsive-modal";
import { Icon } from "~/components/icon/icon";
import { Account } from "@prisma/client";
import { AddButton } from "~/components/buttons/add-button/add-button";
import { InputText } from "~/components/inputs/input-text/input-text";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import {
  AccountDropdownPropsInterface,
  AccountFormInterface,
} from "~/components/page-components/company-accounts/company-accounts-interfaces";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import {
  createOrUpdateAccount,
  deleteAccount,
} from "~/data/frontend-services/company-account-service";

export function AccountDropdown({
  company,
  userAccounts,
  onSave,
  onAccountRemove,
}: AccountDropdownPropsInterface) {
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [responseErrors, setResponseErrors] =
    useState<ServerResponseErrorInterface>({});
  const formik = useFormik<AccountFormInterface>({
    initialValues: {
      id: "",
      name: "",
      balance: 0,
      company: company?.id || "",
    },
    onSubmit: () => {},
  });

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.append("company", formik.values.company);

    setIsSubmitting(true);

    await createOrUpdateAccount(formik.values.id, formData, {
      onSuccess: () => {
        setOpenAddModal(false);
        setResponseErrors({});
        onSave();
      },
      onError: (errors) => {
        setResponseErrors(errors);
      },
      onFinally: () => {
        setTimeout(() => setIsSubmitting(false), 500);
      },
    });
  };

  const onModalCancel = () => {
    formik.resetForm();
    setResponseErrors({});
    setOpenAddModal(false);
  };

  const onClickAdd = () => {
    formik.resetForm();
    setOpenAddModal(true);
  };

  const setFormValues = (account: Account) => {
    formik.setValues({
      id: account.id,
      name: account.name,
      balance: account.balance || 0,
      company: account.company_id || "",
    });
  };

  const onUpdate = (account: Account) => {
    setFormValues(account);
    setOpenAddModal(true);
  };

  const removeAccount = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    await deleteAccount(formik.values.id, {
      onSuccess: () => {
        onAccountRemove();
      },
      onError: () => {
        setLoading(false);
      },
      onFinally: () => {
        setLoading(false);
      },
    });
  };

  const onClickDelete = (account: Account) => {
    formik.setFieldValue("id", account.id);
    setOpenRemoveModal(true);
  };

  const accounts = () => {
    return userAccounts || company?.accounts || [];
  };

  return (
    <>
      <div className="flex justify-end">
        <AddButton title="Add Account" onClick={onClickAdd}></AddButton>
      </div>
      <div className="overflow-x-auto px-10 pb-8">
        <table className="min-w-full bg-white border border-gray-300 text-violet-900">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b border-r">Name</th>
              <th className="py-2 px-4 border-b border-r">Balance</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!accounts().length && (
              <tr>
                <td className="py-2 px-4" colSpan={3}>
                  There are no data yet
                </td>
              </tr>
            )}
            {accounts().map((account, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-r">{account.name}</td>
                <td className="py-2 px-4 border-b border-r">
                  {account.balance}
                </td>
                <td className="flex justify-center gap-5 py-2 px-4 border-b">
                  <Icon
                    onClick={() => onUpdate(account)}
                    name="Edit"
                    className="cursor-pointer transition-transform  transform hover:scale-110"
                  ></Icon>{" "}
                  <Icon
                    name="Trash"
                    className="cursor-pointer transition-transform  transform hover:scale-110"
                    color="red"
                    onClick={() => onClickDelete(account)}
                  ></Icon>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
          {formik.values.id ? "Update account" : "Add new account"}
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
                errorMessage={responseErrors?.errors?.["name"]}
              ></InputText>
              <InputText
                label="Balance"
                name="balance"
                type="number"
                step={0.01}
                min={0}
                value={formik.values.balance || 0}
                onChange={formik.handleChange}
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
        showCloseIcon={false}
        open={openRemoveModal}
        onClose={() => setOpenRemoveModal(false)}
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Atention
        </h2>
        <p className="text-center text-violet-950 text-xl pt-2">
          Do you really want to remove this account?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setOpenRemoveModal(false)}
          ></PrimaryButton>
          <DangerButton
            disabled={loading}
            text="Remove"
            onClick={() => removeAccount()}
          ></DangerButton>
        </div>
      </Modal>
    </>
  );
}
