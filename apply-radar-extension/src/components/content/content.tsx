import { useApplicationContext } from "../../context/applications-context";
import type { ApplicationData } from "../../types/applications";
import { ApplicationForm } from "../list/application-form";
import { ApplicationItem } from "../list/application-item";

export const Content = () => {
    const { newAppFormVisible, hideNewAppForm, createApplication, updateApplication, archiveApplication, deleteApplication, applications } = useApplicationContext();

    const createNewApp = (application: ApplicationData) => {
        createApplication(application);
        hideNewAppForm();
    };

    return (
        <div className="pt-[118px] flex flex-col gap-3">
            {newAppFormVisible && <ApplicationForm onSave={createNewApp} onCancel={hideNewAppForm} />}
            {applications.map((app) => (
                <ApplicationItem key={app.id} app={app} updateApp={updateApplication} archiveApp={archiveApplication} deleteApp={deleteApplication} />
            ))}
        </div>
    );
};