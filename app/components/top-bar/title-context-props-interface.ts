import { Dispatch, SetStateAction } from "react";

export interface TitleContextPropsInterface {
  title: { pageTitle: string; pageTooltipMessage?: string };
  setTitle: Dispatch<
    SetStateAction<{ pageTitle: string; pageTooltipMessage?: string }>
  >;
}
