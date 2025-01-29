import { Company } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { dashboardStore } from "~/components/page-components/dashboard/dashboard-zustand";
import { useTitle } from "~/components/top-bar/title-context";
import { loader as companyLoader } from "~/routes/api/company/index";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { fetchGraphQL } from "~/data/frontend-services/graphql-service";
import { CHART_TRANSACTION_DATA_QUERY } from "~/data/graphql/queries/dashboard";
import { Loader } from "~/components/loader/loader";
import { MONTH_NAMES } from "~/utils/utilities";
import { Chart } from "~/components/chart/chart";
import { InputSelect } from "~/components/inputs/input-select/input-select";
import { useFormik } from "formik";
import {
  DashboardFormInterface,
  LoadTransactionsChartDataVariablesInterface,
  YearIndexOptionInterface,
} from "~/components/page-components/dashboard/dashboard-interfaces";

export default function Index() {
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
  } = dashboardStore();

  const mainForm = useFormik<DashboardFormInterface>({
    initialValues: {
      yearIndex: null,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    setTitle({ pageTitle: "Dashboard" });

    if (!initialized.current) {
      initialized.current = true;
      loadTransactionsChartData({ type: "ALL" });
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
    });
  };

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

  return (
    <div className="flex h-full">
      <div className="w-2/12 bg-violet-900 text-white p-4 overflow-auto">
        <h2 className="text-lg font-semibold mb-1">Your Dashboard</h2>
        <ul>
          <li
            onClick={() => selectCompany("personal")}
            className={`p-2 cursor-pointer hover:bg-violet-950 rounded ${
              getSelectedCompany() == "personal"
                ? "bg-violet-600"
                : "transition duration-300 ease-in-out"
            }`}
          >
            Personal Finances
          </li>
          <hr className="my-2 border-violet-500" />
          <h2 className="text-lg font-semibold mb-1">Your Companies</h2>
          {companies.data?.map((company, index) => (
            <li
              title={company.name}
              onClick={() => selectCompany(company)}
              key={index}
              className={`p-2 my-2 cursor-pointer hover:bg-violet-950 rounded whitespace-nowrap overflow-hidden text-ellipsis ${
                getSelectedCompany() != "personal" &&
                (getSelectedCompany() as Company).id == company.id
                  ? "bg-violet-600"
                  : "transition duration-300 ease-in-out"
              }`}
            >
              {company.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col w-full p-4 bg-white relative overflow-auto">
        <h1 className="text-2xl font-bold text-violet-950 relative">
          <span className="mr-2">{getSelectedCompanyName()}</span>
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1 h-full">
          <Loader loading={loading}>
            {!!getChartTransactionData()?.availableYears.length && (
              <div>
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
                <Chart
                  className="h-4/5"
                  title={`(${getSelectedCompanyName()}) Net Position for the year ${getYear()}`}
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
