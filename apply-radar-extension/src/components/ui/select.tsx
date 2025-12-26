import * as Select from "@radix-ui/react-select";
import * as React from "react";

export const SelectRoot = Select.Root;
export const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Select.Trigger>
>(({ children, ...props }) => {
  const defaultTriggerClasses =
    "flex items-center justify-between focus:outline-none";
  const classNameCombined = [defaultTriggerClasses, (props as any).className]
    .filter(Boolean)
    .join(" ");
  return (
    <Select.Trigger {...props} className={classNameCombined}>
      {children}
    </Select.Trigger>
  );
});

export const SelectValue = Select.Value;
export const SelectIcon = Select.Icon;
export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Select.Content>
>(({ children, ...props }, forwardedRef) => {
  const defaultContentClasses =
    "flex flex-col bg-white gap-2 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md p-2";
  const classNameCombined = [defaultContentClasses, (props as any).className]
    .filter(Boolean)
    .join(" ");
  return (
    <Select.Portal>
      <Select.Content
        position={(props as any).position ?? "popper"}
        side={(props as any).side ?? "bottom"}
        align={(props as any).align ?? "start"}
        sideOffset={(props as any).sideOffset ?? 6}
        {...props}
        ref={forwardedRef}
        className={classNameCombined}
      >
        {children}
        <Select.Arrow />
      </Select.Content>
    </Select.Portal>
  );
});
export const SelectViewport = Select.Viewport;
export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Select.Item>
>(({ children, ...props }, forwardedRef) => {
  const defaultItemClasses =
    "grid grid-cols-[auto_1fr] items-center gap-2 hover:bg-teal-300/20 border-none outline-none p-2 rounded-md cursor-pointer";
  const classNameCombined = [defaultItemClasses, (props as any).className]
    .filter(Boolean)
    .join(" ");
  return (
    <Select.Item {...props} ref={forwardedRef} className={classNameCombined}>
      <SelectItemText>{children}</SelectItemText>
    </Select.Item>
  );
});
export const SelectItemText = Select.ItemText;
export const SelectScrollUpButton = Select.ScrollUpButton;
export const SelectScrollDownButton = Select.ScrollDownButton;
export const SelectSeparator = Select.Separator;

SelectContent.displayName = "SelectContent";
SelectItem.displayName = "SelectItem";
SelectScrollUpButton.displayName = "SelectScrollUpButton";
SelectScrollDownButton.displayName = "SelectScrollDownButton";
SelectSeparator.displayName = "SelectSeparator";
SelectTrigger.displayName = "SelectTrigger";
