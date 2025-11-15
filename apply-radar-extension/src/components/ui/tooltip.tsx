import { Tooltip } from "radix-ui";

const TooltipProvider = Tooltip.Provider;
const TooltipRoot = (props: Tooltip.TooltipProps) => <Tooltip.Root delayDuration={0} {...props}>{props.children}</Tooltip.Root>;
const TooltipTrigger = Tooltip.Trigger;
const TooltipContent = (props: Tooltip.TooltipContentProps) => <Tooltip.Content className="bg-gray-800 text-white rounded p-2 shadow-md dark:bg-gray-300 dark:text-gray-800" {...props} >{props.children}</Tooltip.Content>;
const TooltipArrow = Tooltip.Arrow;

export {
    TooltipProvider,
    TooltipRoot,
    TooltipTrigger,
    TooltipContent,
    TooltipArrow,
};