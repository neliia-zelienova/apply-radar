import * as React from "react";
import * as RadixCheckbox from "@radix-ui/react-checkbox";

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel?: string;
  className?: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  ariaLabel,
  className,
}) => {
  return (
    <RadixCheckbox.Root
      checked={checked}
      onCheckedChange={(val) => onCheckedChange(Boolean(val))}
      aria-label={ariaLabel}
      className={`h-4 w-4 rounded-sm border border-white/30 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500 flex items-center justify-center ${
        className ?? ""
      }`}
    >
      <RadixCheckbox.Indicator>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 6.5L5 8.5L9 4.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
};
