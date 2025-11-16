import { useApplicationContext } from "../../context/applications-context";
import { ApplicationItem } from "../list/application-item";

export const Content = () => {
    const { newAppFormVisible, createApplication, updateApplication, archiveApplication, deleteApplication, applications } = useApplicationContext();

    return (
        <div className="pt-[118px] flex flex-col gap-3">
            {newAppFormVisible && <ApplicationItem createApp={createApplication} />}
            {applications.map((app) => (
                <ApplicationItem key={app.id} app={app} updateApp={updateApplication} archiveApp={archiveApplication} deleteApp={deleteApplication} />
            ))}
        </div>
    );
};