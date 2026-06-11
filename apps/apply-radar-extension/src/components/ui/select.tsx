import { Select } from "radix-ui";
import * as React from "react";

export const SelectRoot = Select.Root;
export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Select.Trigger>
>(({ children, ...props }, forwardedRef) => {
  const defaultTriggerClasses =
    "flex items-center gap-1.5 focus:outline-none";
  const classNameCombined = [defaultTriggerClasses, (props as any).className]
    .filter(Boolean)
    .join(" ");
  return (
    <Select.Trigger {...props} ref={forwardedRef} className={classNameCombined}>
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
    "z-[60] flex flex-col bg-white gap-0.5 dark:bg-[#0f1829] border border-black/10 dark:border-white/10 rounded-[10px] p-1";
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
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.35)", ...(props as any).style }}
      >
        {children}
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
    "flex items-center gap-2 border-none outline-none px-2 py-1.5 rounded-md cursor-pointer text-gray-800 dark:text-slate-200 text-xs font-medium hover:bg-black/[0.04] dark:hover:bg-white/[0.06]";
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
export const SelectGroup = Select.Group;
export const SelectLabel = Select.Label;
export const SelectItemIndicator = Select.ItemIndicator;
export const SelectArrow = Select.Arrow;
export const SelectPortal = Select.Portal;

SelectContent.displayName = "SelectContent";
SelectItem.displayName = "SelectItem";
SelectScrollUpButton.displayName = "SelectScrollUpButton";
SelectScrollDownButton.displayName = "SelectScrollDownButton";
SelectSeparator.displayName = "SelectSeparator";
SelectTrigger.displayName = "SelectTrigger";
SelectGroup.displayName = "SelectGroup";
SelectLabel.displayName = "SelectLabel";
SelectItemIndicator.displayName = "SelectItemIndicator";
SelectArrow.displayName = "SelectArrow";
SelectPortal.displayName = "SelectPortal";
