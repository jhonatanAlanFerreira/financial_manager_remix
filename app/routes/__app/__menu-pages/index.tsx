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
import { MONTH_NAMES } from "~/utils/utilities";
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
import { Modal } from "react-responsive-modal";
import { PrimaryButton } from "~/components/buttons/primary-button/primary-button";

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
    setChartTransactionBarSeriesData,
    getChartTransactionBarSeriesData,
    setYear,
    getYear,
    setClassifications,
    getClassifications,
    openGuideModal,
    setOpenGuideModal,
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
    setSelectedCompany("personal");

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

    if (mainForm.values.classification != undefined) {
      mainForm.setFieldValue("classification", null);
      return;
    }

    const isPersonalOnly = selected === "personal";

    loadTransactionsChartData({
      type: isPersonalOnly ? "PERSONAL_ONLY" : "COMPANY_ONLY",
      companyId: isPersonalOnly ? "" : selected.id,
      classificationType: isPersonalOnly ? "PERSONAL_ONLY" : "COMPANY_ONLY",
    });
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }

    const isPersonalOnly = getSelectedCompany() === "personal";

    loadTransactionsChartData({
      type: isPersonalOnly ? "PERSONAL_ONLY" : "COMPANY_ONLY",
      companyId: isPersonalOnly ? "" : (getSelectedCompany() as Company).id,
      classificationId: mainForm.values.classification?.id,
      classificationType: isPersonalOnly ? "PERSONAL_ONLY" : "COMPANY_ONLY",
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

      const { classification } = mainForm.values;

      if (classification) {
        setChartTransactionBarSeriesData([
          {
            name: `${classification.name} ${
              classification.is_income ? "(Income)" : "(Expense)"
            }`,
            type: "bar",
            data: months.map((m) =>
              classification.is_income ? m.income : m.expense
            ),
          },
        ]);
        setChartTransactionSeriesData([]);
      } else {
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
        setChartTransactionBarSeriesData([]);
      }
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
    const { classification } = mainForm.values;

    if (classification) {
      return `Yearly (${classification.name}) overview for ${getYear()}`;
    }

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
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold text-violet-950 relative">
            <span className="mr-2">{getSelectedCompanyName()}</span>
          </h1>
          <span
            onClick={() => setOpenGuideModal(true)}
            className="flex text-violet-950 cursor-pointer gap-1 items-center"
            title="Click for a step-by-step guide on adding your first expense."
          >
            <Icon name="Info"></Icon> Get Started
          </span>
        </div>
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
                    isClearable
                    dropdownPosition="absolute"
                    className="w-64 mb-18"
                    placeholder="Select the classification"
                    name="classification"
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
                {!mainForm.values.classification && (
                  <Chart
                    className="h-3/4"
                    seriesData={getChartTransactionSeriesData()}
                    xAxisData={MONTH_NAMES}
                  ></Chart>
                )}
                {mainForm.values.classification && (
                  <Chart
                    className="h-3/4"
                    seriesData={getChartTransactionBarSeriesData()}
                    xAxisData={MONTH_NAMES}
                  ></Chart>
                )}
              </div>
            )}
            {!getChartTransactionData()?.availableYears.length && (
              <span className="text-violet-950">
                There are no data yet for the selected company
                {mainForm.values.classification && (
                  <span>
                    {" "}
                    with the classification{" "}
                    <b>
                      ({mainForm.values.classification?.name}) {"  "}
                    </b>
                    <span
                      onClick={() =>
                        mainForm.setFieldValue("classification", null)
                      }
                      className="!text-red-700 underline cursor-pointer"
                    >
                      clear filters
                    </span>
                  </span>
                )}
              </span>
            )}
          </Loader>
        </div>
      </div>
      <Modal
        classNames={{
          modal: "p-0 m-0 w-full",
        }}
        center
        showCloseIcon={false}
        open={openGuideModal}
        onClose={() => setOpenGuideModal(false)}
      >
        <h2 className="text-white text-xl bg-violet-950 text-center p-2">
          Get Started: Record Your First Company Expense
        </h2>

        <div className="p-6 space-y-6 text-gray-700 overflow-auto max-h-[85vh]">
          <p className="text-gray-800">
            Follow these steps to create a company, add a classification, record
            an expense, and then see it in your dashboard.
          </p>

          <ol className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white font-bold shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Create Your Company
                </h3>
                <p className="mt-1 text-gray-600">
                  Open the{" "}
                  <span className="inline-flex items-center space-x-1 font-semibold">
                    <span>Menu</span>
                    <Icon name="Menu" size={15} />
                  </span>
                  , then go to{" "}
                  <span className="font-semibold">Companies and Accounts</span>.
                  Add one (for example, “Acme Inc.”) and set up at least one
                  account (like “Main Checking”). This account will be used to
                  track your company transactions.
                </p>
                <div className="mt-2 border border-dashed border-gray-300 p-4 text-center text-gray-500 text-sm italic">
                  <img
                    src="screenshots/add_company_and_account.png"
                    alt="Add Company and Account"
                  />
                </div>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white font-bold shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Add an Expense Classification (<em>Office Supplies</em>)
                </h3>
                <p className="mt-1 text-gray-600">
                  Open the{" "}
                  <span className="inline-flex items-center space-x-1 font-semibold">
                    <span>Menu</span>
                    <Icon name="Menu" size={15} />
                  </span>{" "}
                  and select{" "}
                  <span className="font-semibold">
                    Inco./Expe. Classifications
                  </span>
                  . Click <em>Add</em>, enter{" "}
                  <span className="font-semibold">Office Supplies</span> as the
                  classification name, choose{" "}
                  <span className="font-semibold">Expense Classification</span>,
                  and select the <span className="font-semibold">Company</span>,
                  then save.
                </p>
                <div className="mt-2 border border-dashed border-gray-300 p-4 text-center text-gray-500 text-sm italic">
                  <img
                    src="screenshots/add_classification.png"
                    alt="Add Classification"
                  />
                </div>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white font-bold shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Navigate to{" "}
                  <span className="text-violet-600">Expense Categories</span>{" "}
                  and Add <em>Printer Paper</em>
                </h3>
                <p className="mt-1 text-gray-600">
                  From the{" "}
                  <span className="inline-flex items-center space-x-1 font-semibold">
                    <span>Menu</span>
                    <Icon name="Menu" size={15} />
                  </span>
                  , select{" "}
                  <span className="font-semibold">Expenses Categories</span>.
                  Click
                  <em> Add</em>, enter “Printer Paper” as the expense name,
                  optionally set an amount to automatically populate the amount
                  in the transaction page later (or leave it at 0), select your{" "}
                  <span className="font-semibold">Company</span>, then save.
                </p>
                <div className="mt-2 border border-dashed border-gray-300 p-4 text-center text-gray-500 text-sm italic">
                  <img src="screenshots/add_expense.png" alt="Add Expense" />
                </div>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white font-bold shrink-0">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Add a Transaction for “Printer Paper”
                </h3>
                <p className="mt-1 text-gray-600">
                  Go to{" "}
                  <span className="inline-flex items-center space-x-1 font-semibold">
                    <span>Menu</span>
                    <Icon name="Menu" size={15} />
                  </span>{" "}
                  &gt; <span className="font-semibold">Transactions</span>, then
                  click <em>Add</em>. Select the company, the account, and the
                  expense. If you set an amount earlier, it will be
                  automatically populated, but you can change it if needed.
                  Optionally select a merchant, or leave it as is. Finally,
                  choose the{" "}
                  <span className="font-semibold">classification</span> and
                  save.
                </p>
                <div className="mt-2 border border-dashed border-gray-300 p-4 text-center text-gray-500 text-sm italic">
                  <img
                    src="screenshots/add_transaction.png"
                    alt="Add Transaction"
                  />
                </div>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white font-bold shrink-0">
                5
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  View Your Data in the{" "}
                  <span className="text-violet-600">Dashboard</span>
                </h3>
                <p className="mt-1 text-gray-600">
                  Go to the{" "}
                  <span className="inline-flex items-center space-x-1 font-semibold">
                    <span>Menu</span>
                    <Icon name="Menu" size={15} />
                  </span>{" "}
                  and choose <span className="font-semibold">Dashboard</span>.
                  Select your company. Look for the Overall Net chart (or a
                  similar net view) to see your newly added expense.
                </p>
                <div className="mt-2 border border-dashed border-gray-300 p-4 text-center text-gray-500 text-sm italic">
                  <img
                    src="screenshots/dashboard_net.png"
                    alt="Dashboard Net"
                  />
                </div>
              </div>
            </li>

            <li className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white font-bold shrink-0">
                6
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Filter by{" "}
                  <span className="text-violet-600">Office Supplies</span>
                </h3>
                <p className="mt-1 text-gray-600">
                  Use the filter option in the dashboard to select{" "}
                  <span className="font-semibold">Office Supplies</span>. You'll
                  see how much has been spent on “Printer Paper” (or any other
                  expense under the same classification) by month.
                </p>
                <div className="mt-2 border border-dashed border-gray-300 p-4 text-center text-gray-500 text-sm italic">
                  <img
                    src="screenshots/dashboard_classification.png"
                    alt="Dashboard Classification"
                  />
                </div>
              </div>
            </li>
          </ol>
        </div>
        <div className="flex justify-end">
          <PrimaryButton text="Ok" onClick={() => setOpenGuideModal(false)} />
        </div>
      </Modal>
    </div>
  );
}

export async function loader(request: LoaderFunctionArgs) {
  const companyData = await (await companyLoader(request)).json();

  return {
    companyData,
  };
}
