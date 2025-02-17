import { Account, Company } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Modal } from "react-responsive-modal";
import { Accordion } from "~/components/accordion/accordion";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { InputText } from "~/components/inputs/input-text/input-text";
import { Loader } from "~/components/loader/loader";
import { AccountDropdown } from "~/components/page-components/company-accounts/account-dropdown";
import { CompanyFormInterface } from "~/components/page-components/company-accounts/company-accounts-interfaces";
import { useTitle } from "~/components/top-bar/title-context";
import { CompanyWithRelationsInterface } from "~/data/company/company-types";
import {
  createOrUpdateCompany,
  deleteCompany,
  fetchAccounts,
  fetchCompanies,
} from "~/data/frontend-services/company-account-service";
import { loader as accountLoader } from "~/routes/api/account/index";
import { loader as companyLoader } from "~/routes/api/company/index";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { ServerResponseInterface } from "~/shared/server-response-interface";

export default function Companies() {
  const { setTitle } = useTitle();

  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [companies, setCompanies] = useState<
    ServerResponseInterface<CompanyWithRelationsInterface[]>
  >({});
  const [responseErrors, setResponseErrors] =
    useState<ServerResponseErrorInterface>({});
  const [userAccounts, setUserAccounts] = useState<
    ServerResponseInterface<Account[]>
  >({});

  const { userAccountData, companyData } = useLoaderData<{
    userAccountData: ServerResponseInterface<Account[]>;
    companyData: ServerResponseInterface<CompanyWithRelationsInterface[]>;
  }>();

  const formik = useFormik<CompanyFormInterface>({
    initialValues: {
      id: "",
      name: "",
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    setTitle({
      pageTitle: "Companies & Accounts",
      pageTooltipMessage:
        "Manage your company's details here. You can create new companies, update company names, and manage accounts by editing account names, balances, or removing unused accounts.",
    });
    return () => {
      setTitle({ pageTitle: "" });
    };
  }, []);

  useEffect(() => {
    if (userAccountData) {
      setUserAccounts(userAccountData);
    }
    if (companyData) {
      setCompanies(companyData);
    }
  }, [userAccountData, companyData]);

  const loadUserAccounts = async () => {
    setLoading(true);

    await fetchAccounts(
      {
        paginationParams: "is_personal_or_company=personal",
        searchParams: "",
      },
      {
        onSuccess: (data) => {
          setUserAccounts(data);
        },
        onError: () => {
          setLoading(false);
        },
        onFinally: () => {
          setLoading(false);
        },
      }
    );
  };

  const formSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);

    await createOrUpdateCompany(formik.values.id, formData, {
      onSuccess: () => {
        setOpenAddModal(false);
        loadCompanies();
        setResponseErrors({});
      },
      onError: (errors) => {
        setResponseErrors(errors);
      },
      onFinally: () => {
        setTimeout(() => setIsSubmitting(false), 500);
      },
    });
  };

  const loadCompanies = async () => {
    setLoading(true);
    const res = await fetchCompanies();
    if (res) {
      setCompanies(res);
    }
    setLoading(false);
  };

  const removeCompany = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    await deleteCompany(formik.values.id, {
      onSuccess: () => {
        loadCompanies();
      },
      onError: () => {
        setLoading(false);
      },
      onFinally: () => {
        setLoading(false);
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

  return (
    <Loader loading={loading}>
      <div className="flex justify-end mb-2">
        <PrimaryButton
          onClick={onClickAdd}
          iconName="PlusCircle"
          text="Add Company"
        ></PrimaryButton>
      </div>
      <div className="overflow-x-auto px-0 md:px-10">
        <Accordion
          title="Personal Accounts"
          titleIcons={[
            {
              iconName: "Edit",
              iconTitle: "Update Company",
            },
            {
              iconName: "Trash",
              iconTitle: "Remove Company",
              iconColor: "#f87171",
            },
          ]}
        >
          <AccountDropdown
            userAccounts={userAccounts?.data}
            onSave={loadUserAccounts}
            onAccountRemove={loadUserAccounts}
          ></AccountDropdown>
        </Accordion>
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
            <AccountDropdown
              company={company}
              onSave={loadCompanies}
              onAccountRemove={loadCompanies}
            ></AccountDropdown>
          </Accordion>
        ))}
      </div>

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
                errorMessage={responseErrors?.errors?.["name"]}
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
    </Loader>
  );
}

export async function loader(request: LoaderFunctionArgs) {
  const [userAccountData, companyData] = await Promise.all([
    accountLoader(request, {
      page: 1,
      pageSize: "all",
      is_personal_or_company: "personal",
    }).then((res) => res.json()),
    companyLoader(request, {
      extends: ["accounts"],
    }).then((res) => res.json()),
  ]);

  return {
    userAccountData,
    companyData,
  };
}
