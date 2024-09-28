import { Dispatch, SetStateAction } from "react";

export default interface TitleContextProps {
  title: { pageTitle: string; pageTooltipMessage?: string };
  setTitle: Dispatch<
    SetStateAction<{ pageTitle: string; pageTooltipMessage?: string }>
  >;
}
