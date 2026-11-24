import * as React from "react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import classNames from "classnames";

/**
 * AlertDialog components built on top of Radix UI AlertDialog
 *
 * Usage:
 * <AlertDialog>
 *   <AlertDialogTrigger>Delete</AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
 *       <AlertDialogDescription>
 *         This action cannot be undone.
 *       </AlertDialogDescription>
 *     </AlertDialogHeader>
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction>Continue</AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 */

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;
export const AlertDialogAction = AlertDialogPrimitive.Action;

export const AlertDialogPortal = ({
  children,
}: {
  children: React.ReactNode;
}) => <AlertDialogPrimitive.Portal>{children}</AlertDialogPrimitive.Portal>;

export interface AlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {}

export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <AlertDialogPortal>
      <AlertDialogPrimitive.Overlay
        className={classNames(
          // Above the regular Dialog (z-100/110): a confirmation can open on top of a form.
          // Darker and blurred, so it clearly sits above that form.
          "fixed inset-0 z-[120] bg-black/50 backdrop-blur-[2px] dark:bg-black/70",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        )}
      />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={classNames(
          // Narrower than the regular Dialog (max-w-md) so a confirmation reads as a separate, smaller step.
          "fixed left-1/2 top-1/2 z-[130] w-[85vw] max-w-[360px] -translate-x-1/2 -translate-y-1/2",
          "max-h-[calc(100vh-48px)] overflow-y-auto",
          "rounded-2xl border border-black/8 bg-white p-5 shadow-2xl outline-none",
          // Own text color, so labels and inputs don't depend on the page's default.
          "text-gray-900",
          // Dark mode variants
          // A step lighter than the form dialog behind it.
          "dark:border-white/15 dark:bg-[#18233a] dark:text-slate-100 dark:shadow-black/60",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  );
});

AlertDialogContent.displayName = "AlertDialogContent";

export type AlertDialogTone = "default" | "danger" | "warning";

const ICON_TONES: Record<AlertDialogTone, string> = {
  default: "bg-teal-500/15 text-teal-600 dark:text-teal-300",
  danger: "bg-red-500/15 text-red-600 dark:text-red-300",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
};

/** Title + description; with `icon`, shown in a tinted circle to the left. */
export const AlertDialogHeader = ({
  children,
  className,
  icon,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  tone?: AlertDialogTone;
}) => (
  <div className={classNames("flex items-start gap-3", className)}>
    {icon && (
      <span
        aria-hidden
        className={classNames(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          ICON_TONES[tone]
        )}
      >
        {icon}
      </span>
    )}
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

export const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={classNames(
      "text-base font-semibold leading-6 text-gray-900",
      // Dark mode variant
      "dark:text-gray-100",
      className
    )}
    {...props}
  />
));

AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={classNames(
      "mt-1 text-sm leading-5 text-gray-600",
      // Dark mode variant
      "dark:text-gray-300",
      className
    )}
    {...props}
  />
));

AlertDialogDescription.displayName = "AlertDialogDescription";

export const AlertDialogFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={classNames(
      // Buttons share the width and stay on one line.
      "mt-5 flex items-center gap-2 [&>*]:flex-1 [&>*]:whitespace-nowrap",
      className
    )}
  >
    {children}
  </div>
);
