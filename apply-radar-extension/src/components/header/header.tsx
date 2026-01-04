import { Plus } from "lucide-react";
import { useApplicationContext } from "../../context/applications-context";
import type { ApplicationData } from "../../types/applications";
import { ApplicationForm } from "../list/application-form";

export const Header = () => {
  const { createApplication } = useApplicationContext();

  const createNewApp = (application: ApplicationData) => {
    createApplication(application);
  };

  return (
    <div className="w-full min-h-[30vh] p-4 bg-teal-600 flex flex-col items-start gap-2 shadow-sm shadow-teal-100/30">
      <div className="flex flex-row gap-2 items-center justify-center">
        <img src="/logo.svg" alt="Logo" className="h-10" />
        <h1 className="w-full text-stone-50 text-sm font-normal font-momo-trust">
          Every application. Always on radar
        </h1>
      </div>
      <ApplicationForm
        triggerComponent={
          <button className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm text-sky-900 flex items-center hover:bg-gray-100 hover:border-blue-950 hover:shadow-md hover:shadow-blue-950/10 transition-colors ease-linear duration-150 cursor-pointer">
            <Plus className="inline h-4 w-4 mr-2" />
            Add new application manually
          </button>
        }
        onSave={createNewApp}
      />
    </div>
  );
};
