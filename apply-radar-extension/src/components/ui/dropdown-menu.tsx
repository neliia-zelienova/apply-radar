import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import * as React from "react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const DropdownMenuContent = React.forwardRef<
	HTMLDivElement,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ children, ...props }, forwardedRef) => {
		return (
			<DropdownMenuPrimitive.Portal>
				<DropdownMenuPrimitive.Content {...props} ref={forwardedRef}>
					{children}
					<DropdownMenuPrimitive.Arrow />
				</DropdownMenuPrimitive.Content>
			</DropdownMenuPrimitive.Portal>
		);
	},
);

export const DropdownMenuLabel = DropdownMenuPrimitive.Label;
export const DropdownMenuItem = DropdownMenuPrimitive.Item;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;

export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;