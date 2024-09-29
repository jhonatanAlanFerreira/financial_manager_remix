import { Dispatch, SetStateAction } from "react";

export default interface TitleContextPropsInterface {
  title: { pageTitle: string; pageTooltipMessage?: string };
  setTitle: Dispatch<
    SetStateAction<{ pageTitle: string; pageTooltipMessage?: string }>
  >;
}
