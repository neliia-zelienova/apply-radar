import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
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
          "fixed inset-0 z-[100] bg-black/40 dark:bg-black/60",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        )}
      />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={classNames(
          "fixed left-1/2 top-1/2 z-[110] w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2",
          "rounded-2xl border border-black/8 bg-white p-6 shadow-2xl outline-none",
          // Dark mode variants
          "dark:border-white/10 dark:bg-[#0f1829]",
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

export const AlertDialogHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={classNames("mb-4", className)}>{children}</div>;

export const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={classNames(
      "text-lg font-semibold text-gray-900",
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
      "mt-1 text-sm text-gray-600",
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
      "mt-6 flex items-center justify-end gap-2",
      className
    )}
  >
    {children}
  </div>
);
