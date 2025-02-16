import { LoaderFunctionArgs } from "@remix-run/node";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
import { queryParamsFromObject, useIsMobile } from "~/utils/utilities";
import { loader as merchantLoader } from "~/routes/api/merchant/index";
import { useLoaderData } from "@remix-run/react";
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
import { InputText } from "~/components/inputs/input-text/input-text";
import { ThSort } from "~/components/th-sort/th-sort";
import { MerchantThSortConfig } from "~/components/page-components/merchants/merchant-th-sort-config";
import {
  MERCHANT_FILTER_FORM_DEFAULTS_VALUES,
  MERCHANT_MAIN_FORM_DEFAULTS_VALUES,
  merchantStore,
} from "~/components/page-components/merchants/merchant-store";

export default function Merchants() {
  const isMobile = useIsMobile();
  const { setTitle } = useTitle();

  const {
    loading,
    setLoading,
    getSearchParams,
    setSearchParams,
    isSubmitting,
    setIsSubmitting,
    modals,
    setModals,
    getSortParams,
    setSortParams,
    totalPages,
    setTotalPages,
    setCurrentPage,
    getCurrentPage,
    responseErrors,
    setResponseErrors,
    merchants,
    setMerchants,
  } = merchantStore();

  const { merchantData } = useLoaderData<{
    merchantData: ServerResponseInterface<Merchant[]>;
  }>();

  const {
    register: registerMain,
    handleSubmit: handleSubmitMain,
    reset: resetMain,
    setValue: setMainValue,
    watch: watchMain,
    getValues: getMainValues,
  } = useForm<MerchantFormInterface>({
    defaultValues: MERCHANT_MAIN_FORM_DEFAULTS_VALUES,
  });

  const {
    register: registerFilter,
    handleSubmit: handleSubmitFilter,
    reset: resetFilter,
    setValue: setFilterValue,
    getValues: getFilterValues,
    watch: watchFilter,
  } = useForm<MerchantFiltersFormInterface>({
    defaultValues: MERCHANT_FILTER_FORM_DEFAULTS_VALUES,
  });

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

  const onClickAdd = () => {
    resetMain(MERCHANT_MAIN_FORM_DEFAULTS_VALUES);
    setModals("add");
  };

  const onModalCancel = () => {
    resetMain(MERCHANT_MAIN_FORM_DEFAULTS_VALUES);
    setResponseErrors({});
    setModals(null);
  };

  const loadMerchants = async () => {
    setLoading(true);
    buildSearchParamsUrl();

    await fetchMerchants(
      {
        paginationParams: paginationParams(),
        searchParams: getSearchParams(),
        sortParams: getSortParams(),
      },
      {
        onSuccess: (data) => {
          setCurrentPage(data.pageInfo?.currentPage || 1);
          setTotalPages(data.pageInfo?.totalPages || 1);
          setMerchants(data);

          if (!data.data?.length) {
            setTotalPages(data.pageInfo?.totalPages || 1);
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

  const onMainSubmit = async (data: MerchantFormInterface) => {
    const formData = prepareFormData(data);
    setIsSubmitting(true);

    await createOrUpdateMerchant(formData, {
      onSuccess: () => {
        setModals(null);
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
      page: getCurrentPage(),
      pageSize: 10,
    } as any).toString();
  };

  const buildSearchParamsUrl = () => {
    setSearchParams(queryParamsFromObject(getFilterValues()));
  };

  const onClickUpdate = (merchant: Merchant) => {
    resetMain(merchant);
    setModals("add");
  };

  const onClickDelete = (merchant: Merchant) => {
    setMainValue("id", merchant.id);
    setModals("remove");
  };

  const adjustPaginationBeforeReload = () => {
    const { data } = merchants;
    const hasMinimalData = data && data?.length < 2;

    if (hasMinimalData && getCurrentPage() !== 1) {
      setCurrentPage(getCurrentPage() - 1);
    }
    loadMerchants();
  };

  const removeMerchant = async () => {
    setModals(null);
    setLoading(true);

    await deleteMerchant(getMainValues().id, {
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

  const onFilterFormSubmit = () => {
    setModals(null);
    setCurrentPage(1);
    loadMerchants();
  };

  const onSortChange = (sort_key: string, sort_order: "asc" | "desc") => {
    setSortParams(queryParamsFromObject({ sort_key, sort_order }));
    loadMerchants();
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    loadMerchants();
  };

  const onFilterTagClose = (
    fieldName: keyof MerchantFiltersFormInterface,
    defaultValue: any
  ) => {
    setFilterValue(fieldName, defaultValue);
    onFilterFormSubmit();
  };

  const prepareFormData = (data: MerchantFormInterface) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => formData.set(key, value));
    return formData;
  };

  return (
    <Loader loading={loading}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap">
          <div
            onClick={() => setModals("filter")}
            className="flex cursor-pointer text-violet-950 transform transition-transform duration-300 hover:scale-110 mb-2"
          >
            <Icon size={30} name="Filter" />
            Filters
          </div>
          <div className="flex flex-wrap">
            {MerchantFilterTagsConfig.map((config, index) => (
              <FilterTag
                key={index}
                fieldName={config.fieldName}
                fieldValue={getFilterValues()[config.fieldName]}
                defaultFieldValue={config.defaultFieldValue}
                onClose={(fieldName, defaultValue) =>
                  onFilterTagClose(
                    fieldName as keyof MerchantFiltersFormInterface,
                    defaultValue
                  )
                }
                className="ml-2 mb-2"
                tagLabel={config.tagLabel}
                tagValue={config.getTagValue(watchFilter(config.fieldName))}
              />
            ))}
          </div>
        </div>
        <PrimaryButton onClick={onClickAdd} text="Add" iconName="PlusCircle" />
      </div>
      <div className="overflow-x-auto px-10 pb-4">
        <table className="min-w-full bg-white border border-gray-300 text-violet-900">
          <thead>
            <tr className="bg-gray-100">
              <ThSort
                thSortConfigs={MerchantThSortConfig.thSortConfigs}
                onSortChange={onSortChange}
              />
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
                    onClick={() => onClickUpdate(merchant)}
                    name="Edit"
                    className="cursor-pointer transition-transform transform hover:scale-110"
                  />{" "}
                  <Icon
                    onClick={() => onClickDelete(merchant)}
                    name="Trash"
                    className="cursor-pointer transition-transform transform hover:scale-110"
                    color="red"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          className="justify-center"
          currentPage={getCurrentPage()}
          totalPages={totalPages}
          optionsAmount={isMobile ? 3 : 10}
          onPageChange={onPageChange}
        />
      )}

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-1/3",
        }}
        center
        showCloseIcon={false}
        open={modals == "remove"}
        onClose={() => setModals(null)}
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Atention
        </h2>
        <p className="text-center text-violet-950 text-xl pt-2">
          Do you really want to remove this merchant?
        </p>
        <div className="flex justify-between p-2 mt-10">
          <PrimaryButton text="Cancel" onClick={() => setModals(null)} />
          <DangerButton
            disabled={loading}
            text="Remove"
            onClick={removeMerchant}
          />
        </div>
      </Modal>

      <Modal
        classNames={{
          modal: "p-0 m-0 w-full sm:w-3/4 max-h-95vh",
        }}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        showCloseIcon={false}
        open={modals == "add"}
        onClose={() => setModals(null)}
        center
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          {watchMain("id") ? "Update merchant" : "Add new merchant"}
        </h2>
        <div>
          <div className="p-4">
            <form id="merchant-form" onSubmit={handleSubmitMain(onMainSubmit)}>
              <InputText
                label="Name *"
                required
                errorMessage={responseErrors?.errors?.["name"]}
                {...registerMain("name", { required: true })}
              />
            </form>
          </div>
          <div className="flex justify-between p-2">
            <DangerButton text="Cancel" onClick={onModalCancel} />
            <PrimaryButton
              text="Save"
              disabled={isSubmitting}
              form="merchant-form"
              type="submit"
              className={isSubmitting ? "bg-violet-950/50" : ""}
            />
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
        open={modals == "filter"}
        onClose={() => setModals(null)}
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Filters
        </h2>
        <div className="p-4">
          <form onSubmit={handleSubmitFilter(onFilterFormSubmit)}>
            <div className="flex justify-end mb-5 underline decoration-red-700 text-red-700 cursor-pointer">
              <span onClick={() => resetFilter()}>Clear all filters</span>
            </div>
            <InputText label="Name" {...registerFilter("name")} />
            <div className="flex justify-end p-2 mt-10">
              <PrimaryButton
                onClick={handleSubmitFilter(onFilterFormSubmit)}
                text="Done"
                type="button"
              />
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
