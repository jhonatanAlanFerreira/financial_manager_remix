import { Tooltip } from "react-tooltip";
import TooltipIconProps from "~/interfaces/componentsProps/TooltipIconProps";
import Icon from "~/components/icon/Icon";
import { useId } from "react";

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
