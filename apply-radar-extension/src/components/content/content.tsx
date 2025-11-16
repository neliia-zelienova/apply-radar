import { useApplicationContext } from "../../context/applications-context";
import { ApplicationItem } from "../list/application-item";

export const Content = () => {
    const { showNewAppForm, applications } = useApplicationContext();
    return (
        <div className="pt-[118px]">
            {showNewAppForm && <ApplicationItem onSaveChanges={() => {}} />}
            {applications.map((app, index) => (
                <ApplicationItem key={index} app={app} onSaveChanges={() => {}} />
            ))}
        </div>
    );
}