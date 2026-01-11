import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import classNames from "classnames";

/**
 * Popover components built on top of Radix UI Popover
 *
 * Usage:
 * <Popover>
 *   <PopoverTrigger>Open</PopoverTrigger>
 *   <PopoverContent>Content here</PopoverContent>
 * </Popover>
 */

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export interface PopoverContentProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  /**
   * Add a small arrow pointing to the trigger
   */
  withArrow?: boolean;
}

export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    { className, withArrow = true, sideOffset = 8, children, ...props },
    ref
  ) => {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={classNames(
            // Panel base styles (Tailwind v4 compatible classes)
            "z-50 rounded-md border border-gray-200 bg-white p-3 shadow-lg outline-none",
            // Motion & placement animations
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
            "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
            // Typography fallback
            "text-gray-900",
            className
          )}
          {...props}
        >
          {withArrow && (
            <PopoverPrimitive.Arrow className="fill-white stroke-gray-200" />
          )}
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    );
  }
);

PopoverContent.displayName = "PopoverContent";
