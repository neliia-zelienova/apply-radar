import { useState } from "react";
import LoginPage from "./components/login/LoginPage";
import "./App.css";
import { Content } from "./components/content/content";
import { Header } from "./components/header/header";
import { useApplications } from "./hooks/use-applications";
import { ApplicationsContext } from "./context/applications-context";
import { AuthContext } from "./context/auth-context";
import { useAuth } from "./hooks/use-auth";

function App() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState<
    "companyName" | "date" | "status" | "favorite"
  >("date"); // Currently unused
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const {
    applications,
    total,
    createApplication,
    deleteApplication,
    archiveApplication,
    updateApplication,
  } = useApplications({ search, filterStatus, sortBy, sortOrder });

  const {
    authType,
    userId,
    email,
    name,
    picture,
    setAuthType,
    getJwt,
    signInWithGoogle,
  } = useAuth();

  const contextInput = {
    applications,
    total,
    search,
    setSearch,
    setFilterStatus,
    createApplication,
    deleteApplication,
    archiveApplication,
    updateApplication,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
  };

  const authContextInput = {
    authType,
    userId,
    email,
    name,
    picture,
    setAuthType,
    getJwt,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={authContextInput}>
      <ApplicationsContext.Provider value={contextInput}>
        <Header />
        {authType ? <Content /> : <LoginPage />}
      </ApplicationsContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
