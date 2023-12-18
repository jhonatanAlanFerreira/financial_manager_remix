import InputText from "~/components/inputText/InputText";

export default function Signup() {
  return (
    <div className="h-screen bg-violet-950 flex justify-center items-center">
      <div className="bg-white rounded-lg h-5/6 w-full mx-4 md:w-3/5 px-5">
        <h1 className="text-center mt-3 text-2xl font-bold text-violet-950">
          Sign Up
        </h1>

        <div>
          <InputText label="Name"></InputText>
          <InputText label="Login"></InputText>
          <InputText label="Password" type="password"></InputText>
          <InputText label="Repeat Password" type="password"></InputText>
        </div>

        <div className="text-right">
          <button className="bg-violet-950 text-white rounded-lg px-10 py-1">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
