import { Tooltip } from "react-tooltip";
import Icon from "~/components/icon/icon";
import { useId } from "react";
import TooltipIconProps from "./tooltip-icon-props-interface";

export default function TooltipIcon({ message }: TooltipIconProps) {
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
