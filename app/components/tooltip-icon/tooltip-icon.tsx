import { Tooltip } from "react-tooltip";
import { Icon } from "~/components/icon/icon";
import { useId } from "react";
import { TooltipIconPropsInterface } from "~/components/tooltip-icon/tooltip-icon-props-interface";

export function TooltipIcon({ message }: TooltipIconPropsInterface) {
  const tooltipId = useId();

  return (
    <div>
      <a data-tooltip-id={tooltipId} data-tooltip-content={message}>
        {" "}
        <Icon name="HelpCircle" size={15}></Icon>
      </a>
      <Tooltip
        id={tooltipId}
        className="!bg-violet-800 break-words max-w-md"
        classNameArrow="!bg-violet-900"
      />
    </div>
  );
}
