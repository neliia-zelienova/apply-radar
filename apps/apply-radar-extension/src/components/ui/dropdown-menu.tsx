import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as React from "react";

export const DropdownMenuRoot = DropdownMenu.Root;
export const DropdownMenuTrigger = DropdownMenu.Trigger;
export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        {...props}
        ref={forwardedRef}
        className={["z-50", className].filter(Boolean).join(" ")}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
});
export const DropdownMenuLabel = DropdownMenu.Label;
export const DropdownMenuItem = DropdownMenu.Item;
export const DropdownMenuGroup = DropdownMenu.Group;

DropdownMenuContent.displayName = "DropdownMenuContent";
