import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { EllipsisVertical } from "lucide-react"

interface ItemContextMenuProps {
    itemId: string;
    options: Array<{
        label: string;
        icon: React.ReactNode;
        action: (itemId: string) => void;
    }>;
}

export const ItemContextMenu = ({itemId, options}: ItemContextMenuProps) => {
    return <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <button className="mx-auto cursor-pointer rounded-md p-3 hover:bg-teal-300/20">
                <EllipsisVertical className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200" />
            </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="flex flex-col bg-white gap-2 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-md p-2">
                    {options.map((option) => (
                    <DropdownMenuItem
                        key={`context-menu-item-${option.label}`}
                        className="grid grid-cols-[auto_1fr] items-center gap-2 hover:bg-teal-300/20 border-none outline-none p-2 rounded-md cursor-pointer"
                        onClick={() => option.action(itemId)}
                    >
                        {React.isValidElement(option.icon)
                            ? React.cloneElement(option.icon as React.ReactElement<any, any>, {
                                    className: `h-4 w-4 text-gray-500 dark:text-gray-200`,
                                    "aria-hidden": true,
                                })
                            : option.icon}
                        <span className="text-sm">{option.label}</span>
                    </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
    </DropdownMenu>
}