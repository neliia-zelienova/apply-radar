import { Plus } from "lucide-react"
import { useApplicationContext } from "../../context/applications-context";
import { SwitchRoot, SwitchThumb } from "../ui/switch";

export const Header = () => {
    const { setShowNewAppForm } = useApplicationContext();
    return (
        <div className="fixed z-10 top-0 left-0 w-full p-4 bg-stone-50 dark:bg-teal-600 flex flex-col items-start gap-2 shadow-sm ring-teal-100">
            <div className="flex flex-row gap-2 items-center justify-center">
                <img src="/logo.svg" alt="Logo" className='h-10' />
                <h1 className='w-full text-sm font-normal font-momo-trust'>Every application. Always on radar</h1>
                    <label
                        className="Label"
                        htmlFor="airplane-mode"
                        style={{ paddingRight: 15 }}
                    >
                        Theme
                    </label>
                <SwitchRoot>
                    <SwitchThumb className="block w-5 h-5 bg-white rounded-full shadow-lg translate-x-0 data-[state=checked]:translate-x-5 transition-transform duration-200 ease-in-out" />
                </SwitchRoot>
            </div>
            <button className='px-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-sky-900 flex items-center hover:bg-gray-100 hover:border-emerald-300 transition-colors ease-linear duration-150 cursor-pointer' onClick={setShowNewAppForm}>
                <Plus className='inline h-4 w-4 mr-2' />
                Add new application manually
            </button>
        </div>
    )
}