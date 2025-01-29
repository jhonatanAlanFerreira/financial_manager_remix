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

export default function Index() {
  //WIP
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
    selectedCompany,
    setSelectedCompany,
    setChartTransactionDataResponse,
    getChartTransactionDataResponse,
    getChartTransactionSeriesData,
    setChartTransactionSeriesData,
    setYear,
    getYear,
  } = dashboardStore();

  useEffect(() => {
    setTitle({ pageTitle: "Dashboard [WIP]" });

    if (!initialized.current) {
      initialized.current = true;
      loadTransactionsChartData();
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
    // setSelectedCompany(selected); WIP
  };

  const getSelectedCompanyName = () => {
    return selectedCompany == "personal"
      ? "Personal Dashboard"
      : selectedCompany.name;
  };

  const loadTransactionsChartData = () => {
    setLoading(true);

    fetchGraphQL(CHART_TRANSACTION_DATA_QUERY)
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

    if (chartData) {
      if (yearIndex === undefined) {
        yearIndex = chartData.availableYears.length - 1;
      }

      const { months } = chartData.data[yearIndex];

      setYear(chartData.availableYears[yearIndex]);

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

  return (
    <div className="flex h-full">
      <div className="w-2/12 bg-violet-900 text-white p-4 overflow-auto">
        <h2 className="text-lg font-semibold mb-1">Your Dashboard</h2>
        <ul>
          <li
            onClick={() => selectCompany("personal")}
            className={`p-2 cursor-pointer hover:bg-violet-950 rounded ${
              selectedCompany == "personal"
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
                selectedCompany != "personal" &&
                selectedCompany.id == company.id
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
        <h1 className="text-2xl font-bold text-violet-950 relative mb-4">
          <span className="mr-2">{getSelectedCompanyName()}</span>
        </h1>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1 h-full">
          <Loader loading={loading}>
            {!!getChartTransactionData()?.availableYears.length && (
              <div>
                <div className="mb-2 flex text-violet-950">
                  <span className="mr-2">Select Year: </span>
                  {getChartTransactionData()?.availableYears.map(
                    (year, index) => (
                      <a
                        onClick={() => updateChartTransactionSeriesData(index)}
                        className="mr-2 cursor-pointer underline"
                        key={index}
                      >
                        {year}
                      </a>
                    )
                  )}
                </div>
                <Chart
                  title={`Net Position for the year ${getYear()}`}
                  seriesData={getChartTransactionSeriesData()}
                  xAxisData={MONTH_NAMES}
                ></Chart>
              </div>
            )}
            {!getChartTransactionData()?.availableYears.length && (
              <span className="text-violet-950">There are no data yet</span>
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
