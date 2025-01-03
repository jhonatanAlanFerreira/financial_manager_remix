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
import { useLoaderData } from "@remix-run/react";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { Merchant } from "@prisma/client";

export default function Merchants() {
  const { setTitle } = useTitle();

  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useState<string>("");
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [reloadMerchants, setReloadMerchants] = useState<boolean>(false);
  const [merchants, setMerchants] = useState<
    ServerResponseInterface<Merchant[]>
  >({});

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
      setMerchants(merchantData);
    }

    setLoading(false);
  }, [merchantData]);

  const buildSearchParamsUrl = () => {
    setSearchParams(queryParamsFromObject(filterForm.values));
  };

  return (
    <Loader loading={loading}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap justify-center">
          <div
            onClick={() => setOpenFilterModal(true)}
            className="flex cursor-pointer text-violet-950 transform transition-transform duration-300 hover:scale-110"
          >
            <Icon size={30} name="Filter"></Icon>
            Filters
          </div>
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
        <PrimaryButton
          onClick={onClickAdd}
          text="Add"
          iconName="PlusCircle"
        ></PrimaryButton>
      </div>
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
