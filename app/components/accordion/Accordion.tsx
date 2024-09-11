import { useState } from "react";
import AccordionProps from "~/interfaces/componentsProps/AccordionProps";
import Icon from "../icon/Icon";

export default function Accordion({
  title,
  titleIcons,
  children,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mb-4">
      <button
        onClick={toggleAccordion}
        className="flex justify-between w-full px-4 py-2 text-left bg-violet-950 text-white rounded-lg focus:outline-none"
      >
        <span>{title}</span>
        <div className="flex gap-2">
          {titleIcons?.map((icon, iconIndex) => (
            <span
              className="transition-transform  transform hover:scale-110"
              key={iconIndex}
              title={icon.iconTitle}
            >
              {icon.onClick && (
                <Icon
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  name={icon.iconName}
                  color={icon.iconColor}
                  onClickCapture={icon.onClick}
                ></Icon>
              )}
            </span>
          ))}
          <Icon
            name="ChevronDown"
            className={`w-5 h-5 transition-transform duration-200 ml-5 ${
              isOpen ? "transform rotate-180" : ""
            }`}
          ></Icon>
        </div>
      </button>
      <div
        className={`overflow-hidden transition-max-height duration-500 ease-in-out ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-4 py-2 bg-purple-100 text-purple-900 rounded-lg mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
