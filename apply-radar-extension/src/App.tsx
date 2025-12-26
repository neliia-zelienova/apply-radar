import { useState } from "react";
import "./App.css";
import { Content } from "./components/content/content";
import { Header } from "./components/header/header";
import { useApplications } from "./hooks/use-applications";
import { ApplicationsContext } from "./context/applications-context";

function App() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"name" | "date" | "status" | "favorite">(
    "date"
  ); // Currently unused
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [newAppFormVisible, setNewAppFormVisible] = useState(false);
  const {
    applications,
    total,
    createApplication,
    deleteApplication,
    archiveApplication,
    updateApplication,
  } = useApplications({ search, filterStatus, sortBy, sortOrder });

  const contextInput = {
    applications,
    total,
    setSearch,
    setFilterStatus,
    newAppFormVisible,
    showNewAppForm: () => setNewAppFormVisible(true),
    hideNewAppForm: () => setNewAppFormVisible(false),
    createApplication,
    deleteApplication,
    archiveApplication,
    updateApplication,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
  };

  return (
    <ApplicationsContext.Provider value={contextInput}>
      {/** Header */}
      <Header />
      {/** Content */}
      <Content />
    </ApplicationsContext.Provider>
  );
}

export default App;
