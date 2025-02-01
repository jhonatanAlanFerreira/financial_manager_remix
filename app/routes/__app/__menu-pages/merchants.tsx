import { LoaderFunctionArgs } from "@remix-run/node";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";
import { FilterTag } from "~/components/filter-tag/filter-tag";
import { Icon } from "~/components/icon/icon";
import { Loader } from "~/components/loader/loader";
import { MerchantFilterTagsConfig } from "~/components/page-components/merchants/merchant-filter-tags-config";
import {
  MerchantFiltersFormInterface,
  MerchantFormInterface,
} from "~/components/page-components/merchants/merchant-interfaces";
import { useTitle } from "~/components/top-bar/title-context";
import { queryParamsFromObject } from "~/utils/utilities";
import { loader as merchantLoader } from "~/routes/api/merchant/index";
import { Form, useLoaderData } from "@remix-run/react";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { Merchant } from "@prisma/client";
import { Pagination } from "~/components/pagination/pagination";
import { Modal } from "react-responsive-modal";
import { DangerButton } from "~/components/buttons/danger-button/danger-button";
import {
  createOrUpdateMerchant,
  deleteMerchant,
  fetchMerchants,
} from "~/data/frontend-services/merchant-service";
import { ServerResponseErrorInterface } from "~/shared/server-response-error-interface";
import { InputText } from "~/components/inputs/input-text/input-text";
import { ThSort } from "~/components/th-sort/th-sort";
import { MerchantThSortConfig } from "~/components/page-components/merchants/merchant-th-sort-config";

export default function Merchants() {
  const { setTitle } = useTitle();

  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useState<string>("");
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [reloadMerchants, setReloadMerchants] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [openRemoveModal, setOpenRemoveModal] = useState<boolean>(false);
  const [sortParams, setSortParams] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [responseErrors, setResponseErrors] =
    useState<ServerResponseErrorInterface>({});
  const [merchants, setMerchants] = useState<
    ServerResponseInterface<Merchant[]>
  >({});
  const [paginationState, setPaginationState] = useState<{
    reload: boolean;
    page: number;
  }>({
    reload: false,
    page: 1,
  });

  const { merchantData } = useLoaderData<{
    merchantData: ServerResponseInterface<Merchant[]>;
  }>();

  const mainForm = useFormik<MerchantFormInterface>({
    initialValues: {
      id: "",
      name: "",
    },
    onSubmit: () => {},
  });

  const filterForm = useFormik<MerchantFiltersFormInterface>({
    initialValues: {
      name: "",
    },
    onSubmit: () => {},
  });

  const onClickAdd = () => {
    mainForm.resetForm();
    setOpenAddModal(true);
  };

  useEffect(() => {
    buildSearchParamsUrl();
    setTitle({
      pageTitle: "Merchants",
      pageTooltipMessage:
        "Add merchants here to track transactions associated with them. Use the transaction screen to link entries to specific merchants.",
    });

    return () => {
      setTitle({ pageTitle: "" });
    };
  }, []);

  useEffect(() => {
    if (merchantData) {
      setTotalPages(merchantData.pageInfo?.totalPages || 0);
      setMerchants(merchantData);
    }

    setLoading(false);
  }, [merchantData]);

  useEffect(() => {
    if (paginationState.reload) {
      loadMerchants();
    }
  }, [paginationState]);

  useEffect(() => {
    buildSearchParamsUrl();
  }, [filterForm.values]);

  useEffect(() => {
    if (reloadMerchants) {
      setReloadMerchants(false);
      loadMerchants();
    }
  }, [searchParams]);

  useEffect(() => {
    if (reloadMerchants) {
      setReloadMerchants(false);
      loadMerchants();
    }
  }, [sortParams]);

  const onModalCancel = () => {
    mainForm.resetForm();
    setResponseErrors({});
    setOpenAddModal(false);
  };

  const loadMerchants = async () => {
    setLoading(true);

    await fetchMerchants(
      { paginationParams: paginationParams(), searchParams, sortParams },
      {
        onSuccess: (data) => {
          setPaginationState({
            reload: false,
            page: data.pageInfo?.currentPage || 1,
          });
          setTotalPages(data.pageInfo?.totalPages || 1);
          setMerchants(data);

          if (!data.data?.length) {
            setPaginationState({
              reload: false,
              page: data.pageInfo?.totalPages || 1,
            });
          }
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
    const formData = prepareFormData(event.currentTarget);
    setIsSubmitting(true);

    await createOrUpdateMerchant(formData, {
      onSuccess: () => {
        setOpenAddModal(false);
        loadMerchants();
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

  const paginationParams = () => {
    return new URLSearchParams({
      page: paginationState.page,
      pageSize: 10,
    } as any).toString();
  };

  const buildSearchParamsUrl = () => {
    setSearchParams(queryParamsFromObject(filterForm.values));
  };

  const onClickUpdate = (merchant: Merchant) => {
    setFormValues(merchant);
    setOpenAddModal(true);
  };

  const onClickDelete = (merchant: Merchant) => {
    mainForm.setFieldValue("id", merchant.id);
    setOpenRemoveModal(true);
  };

  const setFormValues = (merchant: Merchant) => {
    mainForm.setValues(merchant);
  };

  const adjustPaginationBeforeReload = () => {
    const { data } = merchants;
    const hasMinimalData = data && data?.length < 2;

    if (paginationState.page == 1 || !hasMinimalData) {
      loadMerchants();
    } else {
      setPaginationState({ reload: true, page: paginationState.page - 1 });
    }
  };

  const removeMerchant = async () => {
    setOpenRemoveModal(false);
    setLoading(true);

    await deleteMerchant(mainForm.values.id, {
      onSuccess: () => {
        adjustPaginationBeforeReload();
      },
      onError: () => {
        setLoading(false);
      },
      onFinally: () => {
        setLoading(false);
      },
    });
  };

  const prepareFormData = (form: HTMLFormElement) => {
    const formData = new FormData(form);
    formData.set("id", mainForm.values.id);
    return formData;
  };

  const onFilterFormSubmit = async (
    event?: React.FormEvent<HTMLFormElement>
  ) => {
    event?.preventDefault();

    setOpenFilterModal(false);
    if (paginationState.page == 1) {
      loadMerchants();
    } else {
      setPaginationState({ reload: true, page: 1 });
    }
  };

  const onSortChange = (sort_key: string, sort_order: "asc" | "desc") => {
    setReloadMerchants(true);
    setSortParams(queryParamsFromObject({ sort_key, sort_order }));
  };

  return (
    <Loader loading={loading}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap">
          <div
            onClick={() => setOpenFilterModal(true)}
            className="flex cursor-pointer text-violet-950 transform transition-transform duration-300 hover:scale-110 mb-2"
          >
            <Icon size={30} name="Filter"></Icon>
            Filters
          </div>
          <div className="flex flex-wrap">
            {MerchantFilterTagsConfig.map(
              (config, index) =>
                !!filterForm.values[config.fieldName] && (
                  <FilterTag
                    fieldName={config.fieldName}
                    closeBtn={config.closeBtn}
                    onClose={(fieldName) => {
                      filterForm.setFieldValue(fieldName, "");
                      setReloadMerchants(true);
                    }}
                    className="ml-2 mb-2"
                    label={config.label}
                    value={config.getValue(filterForm.values[config.fieldName])}
                    key={index}
                  ></FilterTag>
                )
            )}
          </div>
        </div>
        <PrimaryButton
          onClick={onClickAdd}
          text="Add"
          iconName="PlusCircle"
        ></PrimaryButton>
      </div>
      <div className="overflow-x-auto px-10 pb-4">
        <table className="min-w-full bg-white border border-gray-300 text-violet-900">
          <thead>
            <tr className="bg-gray-100">
              <ThSort
                thSortConfigs={MerchantThSortConfig.thSortConfigs}
                onSortChange={onSortChange}
              ></ThSort>
            </tr>
          </thead>
          <tbody>
            {!merchants.data?.length && (
              <tr>
                <td className="py-2 px-4" colSpan={4}>
                  There are no data yet
                </td>
              </tr>
            )}
            {merchants.data?.map((merchant, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="py-2 px-4 border-b border-r">{merchant.name}</td>
                <td className="flex justify-center gap-5 py-2 px-4 border-b">
                  <Icon
                    onClick={() => {
                      onClickUpdate(merchant);
                    }}
                    name="Edit"
                    className="cursor-pointer transition-transform  transform hover:scale-110"
                  ></Icon>{" "}
                  <Icon
                    onClick={() => {
                      onClickDelete(merchant);
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
          currentPage={paginationState.page}
          totalPages={totalPages}
          optionsAmount={10}
          onPageChange={(page) => {
            setPaginationState({ reload: true, page });
          }}
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
          Do you really want to remove this merchant?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton
            text="Cancel"
            onClick={() => setOpenRemoveModal(false)}
          ></PrimaryButton>
          <DangerButton
            disabled={loading}
            text="Remove"
            onClick={removeMerchant}
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
          {mainForm.values.id ? "Update merchant" : "Add new merchant"}
        </h2>
        <div>
          <div className="p-4">
            <Form method="post" id="merchant-form" onSubmit={formSubmit}>
              <InputText
                label="Name *"
                name="name"
                required
                errorMessage={responseErrors?.errors?.["name"]}
                value={mainForm.values.name}
                onChange={mainForm.handleChange}
              ></InputText>
            </Form>
          </div>
          <div className="flex justify-between p-2">
            <DangerButton text="Cancel" onClick={onModalCancel}></DangerButton>
            <PrimaryButton
              text="Save"
              disabled={isSubmitting}
              form="merchant-form"
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
          <form onSubmit={onFilterFormSubmit}>
            <div className="flex justify-end mb-5 underline decoration-red-700 text-red-700 cursor-pointer">
              <span onClick={() => filterForm.resetForm()}>
                Clear all filters
              </span>
            </div>
            <InputText
              label="Name"
              name="name"
              onChange={filterForm.handleChange}
              value={filterForm.values.name}
            ></InputText>

            <div className="flex justify-end p-2 mt-10">
              <PrimaryButton
                onClick={() => onFilterFormSubmit()}
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
  const [merchantData] = await Promise.all([
    merchantLoader(request, {
      page: 1,
      pageSize: 10,
    }).then((res) => res.json()),
  ]);

  return {
    merchantData,
  };
}
