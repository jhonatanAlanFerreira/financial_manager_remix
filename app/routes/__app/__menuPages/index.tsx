import { Company } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTitle } from "~/components/topBar/TitleContext";
import ServerResponse from "~/interfaces/ServerResponse";
import { loader as companyLoader } from "~/routes/api/company/index";

export default function Index() {
  const { setTitle } = useTitle();

  const [loading, setLoading] = useState<boolean>(true);
  const [companies, setCompanies] = useState<ServerResponse<Company[]>>({});
  const [selectedCompany, setSelectedCompany] = useState<Company | "personal">(
    "personal"
  );

  const { companyData } = useLoaderData<{
    companyData: ServerResponse<Company[]>;
  }>();

  useEffect(() => {
    setTitle({ pageTitle: "Dashboard" });

    return () => {
      setTitle({ pageTitle: "" });
    };
  }, []);

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData);
    }
    setLoading(false);
  }, [companyData]);

  const selectCompany = (selected: Company | "personal") => {
    setSelectedCompany(selected);
  };

  const getSelectedCompanyName = () => {
    return selectedCompany == "personal"
      ? "Personal Dashboard"
      : selectedCompany.name;
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 h-full">
          <div className="bg-white border border-violet-950 p-4 rounded-md flex items-center justify-center h-full">
            <p className="text-violet-950">Chart 1</p>
          </div>
          <div className="bg-white border border-violet-950 p-4 rounded-md flex items-center justify-center h-full">
            <p className="text-violet-950">Chart 2</p>
          </div>
          <div className="bg-white border border-violet-950 p-4 rounded-md flex items-center justify-center h-full">
            <p className="text-violet-950">Chart 3</p>
          </div>
          <div className="bg-white border border-violet-950 p-4 rounded-md flex items-center justify-center h-full">
            <p className="text-violet-950">Chart 4</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function loader(request: LoaderFunctionArgs) {
  return {
    companyData: await companyLoader(request),
  };
}
