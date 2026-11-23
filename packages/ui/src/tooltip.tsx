import { Tooltip } from "radix-ui";
import classNames from "classnames";

const TooltipProvider = Tooltip.Provider;
const TooltipRoot = (props: Tooltip.TooltipProps) => (
  <Tooltip.Root delayDuration={0} {...props}>
    {props.children}
  </Tooltip.Root>
);
const TooltipTrigger = Tooltip.Trigger;
const TooltipContent = ({
  className,
  sideOffset = 6,
  children,
  ...props
}: Tooltip.TooltipContentProps) => (
  // Portal so the tooltip isn't clipped by scrolling lists/cards.
  <Tooltip.Portal>
    <Tooltip.Content
      sideOffset={sideOffset}
      collisionPadding={8}
      className={classNames(
        // Small, like the card's secondary text — not the page's 16px default.
        "z-[200] max-w-64 rounded-md px-2 py-1 text-xs font-medium leading-snug shadow-md",
        "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900",
        className,
      )}
      {...props}
    >
      {children}
    </Tooltip.Content>
  </Tooltip.Portal>
);
const TooltipArrow = Tooltip.Arrow;

export {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
};
