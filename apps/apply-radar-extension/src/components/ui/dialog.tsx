import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import classNames from "classnames";

/**
 * Dialog components built on top of Radix UI Dialog
 *
 * Usage:
 * <Dialog>
 *   <DialogTrigger>Open</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Title</DialogTitle>
 *       <DialogDescription>Description</DialogDescription>
 *     </DialogHeader>
 *     ...body...
 *     <DialogFooter>
 *       <DialogClose asChild>
 *         <button>Close</button>
 *       </DialogClose>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export const DialogPortal = ({ children }: { children: React.ReactNode }) => (
  <DialogPrimitive.Portal>{children}</DialogPrimitive.Portal>
);

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {}

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <DialogPortal>
      <DialogPrimitive.Overlay
        className={classNames(
          "fixed inset-0 z-[100] bg-black/40 dark:bg-black/60",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        )}
      />
      <DialogPrimitive.Content
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
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

DialogContent.displayName = "DialogContent";

export const DialogHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={classNames("mb-4", className)}>{children}</div>;

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
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

DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
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

DialogDescription.displayName = "DialogDescription";

export const DialogFooter = ({
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
