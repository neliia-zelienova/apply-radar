import { useApplicationContext } from "../../context/applications-context";
import type { ApplicationData } from "../../types/applications";
import { ApplicationForm } from "../list/application-form";
import { ApplicationItem } from "../list/application-item";
import { ListHeader } from "../list/list-header";

export const Content = () => {
  const {
    newAppFormVisible,
    hideNewAppForm,
    createApplication,
    updateApplication,
    archiveApplication,
    deleteApplication,
    applications,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
  } = useApplicationContext();

  const createNewApp = (application: ApplicationData) => {
    createApplication(application);
    hideNewAppForm();
  };

  return (
    <div className="pt-[118px] flex flex-col gap-3">
      <ListHeader
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />
      {newAppFormVisible && (
        <ApplicationForm onSave={createNewApp} onCancel={hideNewAppForm} />
      )}
      {applications.map((app) => (
        <ApplicationItem
          key={app.id}
          app={app}
          updateApp={updateApplication}
          archiveApp={archiveApplication}
          deleteApp={deleteApplication}
        />
      ))}
    </div>
  );
};
