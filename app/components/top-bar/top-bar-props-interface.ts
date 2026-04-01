export interface TopBarPropsInterface {
  updateSidebarOpen: (value: boolean) => void;
  overrideTitle?: { pageTitle: string; pageTooltipMessage?: string };
}
