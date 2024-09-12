import { Dispatch, SetStateAction } from "react";

export default interface TitleContextProps {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
}
