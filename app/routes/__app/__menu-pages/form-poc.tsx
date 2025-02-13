import { InputText } from "~/components/inputs/input-text/input-text";
import { useForm, SubmitHandler } from "react-hook-form";

type Inputs = {
  example: string;
};

export default function poc() {
  const onSetValue = (value: string) => {
    setPocValue("example", value);
    console.log(getPocValue().example);
  };

  const {
    register,
    handleSubmit,
    setValue: setPocValue,
    getValues: getPocValue,
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <InputText
          label="Testing Form Hook"
          {...register("example")}
        ></InputText>
        <input type="submit" />
      </form>
      <br />
      <button onClick={() => onSetValue("Value Updated A")}>Set Value A</button>
      <br />
      <br />
      <button onClick={() => onSetValue("Value Updated B")}>Set Value B</button>
    </>
  );
}
