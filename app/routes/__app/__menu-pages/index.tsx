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
import * as echarts from "echarts";
import { MONTH_NAMES } from "~/utils/utilities";

export default function Index() {
  const initialized = useRef(false);
  const chartRef = useRef<HTMLDivElement>(null);

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
    chartTransactionDataResponse,
    setChartTransactionDataResponse,
    getChartTransactionDataResponse,
  } = dashboardStore();

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      setTitle({ pageTitle: "Dashboard" });
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

  const initializeChart = () => {
    const myChart = echarts.init(chartRef.current!);
    myChart.setOption({
      title: {
        text: "Net Position",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["Income", "Expense", "Net"],
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: MONTH_NAMES,
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          name: "Income",
          type: "line",
          stack: "Total",
          data: getChartTransactionDataResponse()?.chartTransactionData.data[0].months.map(
            (m) => m.income
          ),
        },
        {
          name: "Expense",
          type: "line",
          stack: "Total",
          data: getChartTransactionDataResponse()?.chartTransactionData.data[0].months.map(
            (m) => m.expense
          ),
        },
        {
          name: "Net",
          type: "line",
          stack: "Total",
          data: getChartTransactionDataResponse()?.chartTransactionData.data[0].months.map(
            (m) => m.net
          ),
        },
      ],
    });
  };

  const selectCompany = (selected: Company | "personal") => {
    setSelectedCompany(selected);
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
        initializeChart();
      })
      .finally(() => {
        setLoading(false);
      });
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
            <div ref={chartRef}></div>
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
