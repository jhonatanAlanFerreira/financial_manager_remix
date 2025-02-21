import { Company } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { dashboardStore } from "~/components/page-components/dashboard/dashboard-store";
import { useTitle } from "~/components/top-bar/title-context";
import { loader as companyLoader } from "~/routes/api/company/index";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { fetchGraphQL } from "~/data/frontend-services/graphql-service";
import { CHART_TRANSACTION_DATA_QUERY } from "~/data/graphql/queries/dashboard";
import { Loader } from "~/components/loader/loader";
import { MONTH_NAMES, useIsMobile } from "~/utils/utilities";
import { Chart } from "~/components/chart/chart";
import { InputSelect } from "~/components/inputs/input-select/input-select";
import { useFormik } from "formik";
import {
  DashboardFormInterface,
  LoadTransactionsChartDataVariablesInterface,
  StoreClassificationInterface,
  YearIndexOptionInterface,
} from "~/components/page-components/dashboard/dashboard-interfaces";
import { Icon } from "~/components/icon/icon";

export default function Index() {
  const isMobile = useIsMobile();
  const initialized = useRef(false);
  const { setTitle } = useTitle();
  const { companyData } = useLoaderData<{
    companyData: ServerResponseInterface<Company[]>;
  }>();

  const {
    loading,
    setLoading,
    companies,
    setCompanies,
    setSelectedCompany,
    getSelectedCompany,
    setChartTransactionDataResponse,
    getChartTransactionDataResponse,
    getChartTransactionSeriesData,
    setChartTransactionSeriesData,
    setYear,
    getYear,
    setClassifications,
    getClassifications,
  } = dashboardStore();

  const mainForm = useFormik<DashboardFormInterface>({
    initialValues: {
      yearIndex: null,
      classification: undefined,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    setTitle({ pageTitle: "Dashboard" });

    if (!initialized.current) {
      initialized.current = true;
      loadTransactionsChartData({ type: "PERSONAL_ONLY" });
    }

    return () => {
      setTitle({ pageTitle: "" });
    };
  }, []);

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData);
    }
    setLoading(false);
  }, [companyData, setCompanies, setLoading]);

  const selectCompany = (selected: Company | "personal") => {
    setSelectedCompany(selected);

    const isPersonalOnly = selected === "personal";

    loadTransactionsChartData({
      type: isPersonalOnly ? "PERSONAL_ONLY" : "COMPANY_ONLY",
      companyId: isPersonalOnly ? "" : selected.id,
      classificationId: mainForm.values.classification?.id,
    });
  };

  useEffect(() => {
    const isPersonalOnly = getSelectedCompany() === "personal";

    loadTransactionsChartData({
      type: isPersonalOnly ? "PERSONAL_ONLY" : "COMPANY_ONLY",
      companyId: isPersonalOnly ? "" : (getSelectedCompany() as Company).id,
      classificationId: mainForm.values.classification?.id,
    });
  }, [mainForm.values.classification]);

  const getSelectedCompanyName = () => {
    return getSelectedCompany() == "personal"
      ? "Personal Finances"
      : (getSelectedCompany() as Company).name;
  };

  const loadTransactionsChartData = (
    variables: LoadTransactionsChartDataVariablesInterface
  ) => {
    setLoading(true);

    fetchGraphQL(CHART_TRANSACTION_DATA_QUERY, variables)
      .then((data) => {
        setChartTransactionDataResponse(data);
        setClassifications(data.classifications);
        updateChartTransactionSeriesData();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getChartTransactionData = () => {
    return getChartTransactionDataResponse()?.chartTransactionData;
  };

  const updateChartTransactionSeriesData = (yearIndex?: number) => {
    const chartData = getChartTransactionData();

    if (chartData?.availableYears.length) {
      if (yearIndex === undefined) {
        yearIndex = chartData.availableYears.length - 1;
      }

      const { months } = chartData.data[yearIndex];

      setYear(chartData.availableYears[yearIndex]);

      mainForm.setFieldValue("yearIndex", {
        value: yearIndex,
        label: getYear(),
      });

      setChartTransactionSeriesData([
        {
          name: "Income",
          type: "line",
          data: months.map((m) => m.income),
        },
        {
          name: "Expense",
          type: "line",
          data: months.map((m) => m.expense),
        },
        {
          name: "Net",
          type: "line",
          data: months.map((m) => m.net),
        },
      ]);
    }
  };

  const onYearChange = (year: YearIndexOptionInterface) => {
    mainForm.setFieldValue("yearIndex", year);
    updateChartTransactionSeriesData(year.value);
  };

  const onClassificationChange = (
    classification: StoreClassificationInterface
  ) => {
    mainForm.setFieldValue("classification", classification);
  };

  const getChartTransactionTitle = () => {
    const isPersonal = getSelectedCompany() == "personal";
    return isPersonal
      ? `Net Position for Personal Finances in ${getYear()}`
      : `Net Position for the company (${getSelectedCompanyName()}) in ${getYear()}`;
  };

  return (
    <div className="flex h-full">
      <div className="w-2/12 min-w-[11rem] bg-violet-900 text-white p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-3 text-violet-200 tracking-wide flex items-center gap-2">
          <Icon
            name="PieChart"
            size={20}
            className="text-violet-300 flex-shrink-0"
          ></Icon>
          Select View
        </h2>

        <ul>
          <li
            onClick={() =>
              getSelectedCompany() != "personal" && selectCompany("personal")
            }
            className={`flex items-center gap-2 p-2 cursor-pointer hover:bg-violet-950 rounded text-lg ${
              getSelectedCompany() == "personal"
                ? "bg-violet-600 font-semibold"
                : "transition duration-300 ease-in-out"
            }`}
          >
            <Icon
              name="Home"
              size={18}
              className="text-violet-300 flex-shrink-0"
            ></Icon>
            Personal Finances
          </li>

          <h3 className="text-sm font-semibold mt-5 mb-1 text-violet-300 uppercase tracking-wide flex items-center gap-2">
            <Icon
              name="Briefcase"
              size={16}
              className="text-violet-300 flex-shrink-0"
            ></Icon>
            Companies
          </h3>
          <hr className="mb-2 border-violet-500" />

          {companies.data?.map((company, index) => (
            <li
              title={company.name}
              onClick={() =>
                (getSelectedCompany() as Company).id != company.id &&
                selectCompany(company)
              }
              key={index}
              className={`flex items-center gap-2 p-2 my-1 cursor-pointer hover:bg-violet-950 rounded text-lg whitespace-nowrap overflow-hidden text-ellipsis ${
                (getSelectedCompany() as Company).id == company.id
                  ? "bg-violet-600 font-semibold"
                  : "transition duration-300 ease-in-out"
              }`}
            >
              <Icon
                name="Briefcase"
                size={18}
                className="text-violet-300 flex-shrink-0"
              ></Icon>
              {company.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col w-full p-4 bg-white relative overflow-auto min-w-[40rem]">
        <h1 className="text-2xl font-bold text-violet-950 relative">
          <span className="mr-2">{getSelectedCompanyName()}</span>
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1 h-full">
          <Loader loading={loading}>
            {!!getChartTransactionData()?.availableYears.length && (
              <div>
                <div className="flex gap-4">
                  <InputSelect
                    dropdownPosition="absolute"
                    className="w-48 mb-18"
                    placeholder="Select the year"
                    value={mainForm.values.yearIndex}
                    onChange={(year) =>
                      onYearChange(year as YearIndexOptionInterface)
                    }
                    options={getChartTransactionData()?.availableYears.map(
                      (year, index) => ({ value: index, label: year })
                    )}
                  ></InputSelect>
                  <InputSelect
                    dropdownPosition="absolute"
                    className="w-64 mb-18"
                    placeholder="Select the classification"
                    value={mainForm.values.classification}
                    getOptionLabel={(classification) =>
                      (classification as { name: string }).name
                    }
                    getOptionValue={(classification) =>
                      (classification as { id: string }).id
                    }
                    onChange={(classification) =>
                      onClassificationChange(
                        classification as StoreClassificationInterface
                      )
                    }
                    options={getClassifications()}
                  ></InputSelect>
                </div>
                <div>
                  <h2 className="text-violet-950">
                    {getChartTransactionTitle()}
                  </h2>
                </div>
                <Chart
                  className="h-3/4"
                  seriesData={getChartTransactionSeriesData()}
                  xAxisData={MONTH_NAMES}
                ></Chart>
              </div>
            )}
            {!getChartTransactionData()?.availableYears.length && (
              <span className="text-violet-950">
                There are no data yet for the selected company
              </span>
            )}
          </Loader>
        </div>
      </div>
    </div>
  );
}

export async function loader(request: LoaderFunctionArgs) {
  const companyData = await (await companyLoader(request)).json();

  return {
    companyData,
  };
}
