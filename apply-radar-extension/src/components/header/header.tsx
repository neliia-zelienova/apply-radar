import { Plus } from "lucide-react";
import { useApplicationContext } from "../../context/applications-context";

export const Header = () => {
  const { showNewAppForm } = useApplicationContext();
  return (
    <div className="fixed z-10 top-0 left-0 w-full p-4 bg-stone-50 dark:bg-teal-600 flex flex-col items-start gap-2 shadow-sm shadow-teal-100/30">
      <div className="flex flex-row gap-2 items-center justify-center">
        <img src="/logo.svg" alt="Logo" className="h-10" />
        <h1 className="w-full text-sm font-normal font-momo-trust">
          Every application. Always on radar
        </h1>
        <label
          className="Label"
          htmlFor="airplane-mode"
          style={{ paddingRight: 15 }}
        >
          Theme
        </label>
      </div>
      <button
        className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-sky-900 flex items-center hover:bg-gray-100 hover:border-blue-950 hover:shadow-md hover:shadow-blue-950/10 transition-colors ease-linear duration-150 cursor-pointer"
        onClick={showNewAppForm}
      >
        <Plus className="inline h-4 w-4 mr-2" />
        Add new application manually
      </button>
    </div>
  );
};
