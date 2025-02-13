import { InputText } from "~/components/inputs/input-text/input-text";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { LoaderFunctionArgs } from "@remix-run/node";
import { loader as companyLoader } from "~/routes/api/company/index";
import { useLoaderData } from "@remix-run/react";
import { ServerResponseInterface } from "~/shared/server-response-interface";
import { Company } from "@prisma/client";
import { useEffect, useState } from "react";
import { InputSelect } from "~/components/inputs/input-select/input-select";

type Inputs = {
  example: string;
  selectedCompanies: Company[];
};

export default function poc() {
  const onSetValue = (value: string) => {
    setPocValue("example", value);
    console.log(getPocValue().example);
  };

  const onReset = () => {
    reset();
    console.log(getPocValue().example);
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue: setPocValue,
    getValues: getPocValue,
    control,
  } = useForm<Inputs>({
    defaultValues: {
      example: "",
      selectedCompanies: [],
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  const { companyData } = useLoaderData<{
    companyData: ServerResponseInterface<Company[]>;
  }>();

  const [companies, setCompanies] = useState<
    ServerResponseInterface<Company[]>
  >({});

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData);
    }
  }, [companyData]);

  const getSelectCompanyOptionValue = (option: Company) => option.id;
  const getSelectCompanyOptionLabel = (option: Company) => option.name;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputText
          label="Testing Form Hook"
          {...register("example")}
        ></InputText>
        <br />
        <br />
        {companies.data && (
          <Controller
            name="selectedCompanies"
            control={control}
            render={({ field }) => (
              <InputSelect
                isMulti
                isClearable
                className="mb-8"
                placeholder="Companies"
                options={companies?.data}
                getOptionLabel={getSelectCompanyOptionLabel as any}
                getOptionValue={getSelectCompanyOptionValue as any}
                onChange={(selected) => field.onChange(selected)}
                value={field.value}
              />
            )}
          />
        )}
        <br />
        <br />
        <input type="submit" />
      </form>
      <br />
      <button onClick={() => onSetValue("Value Updated A")}>Set Value A</button>
      <br />
      <br />
      <button onClick={() => onSetValue("Value Updated B")}>Set Value B</button>
      <br />
      <br />
      <button onClick={onReset}>Reset</button>
    </>
  );
}

export async function loader(request: LoaderFunctionArgs) {
  const [companyData] = await Promise.all([
    companyLoader(request).then((res) => res.json()),
  ]);

  return {
    companyData,
  };
}
