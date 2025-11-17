import { useState } from 'react';
import './App.css';
import { Content } from './components/content/content';
import { Header } from './components/header/header';
import { useApplications } from './hooks/use-applications';
import { ApplicationsContext } from './context/applications-context';

function App() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [newAppFormVisible, setNewAppFormVisible] = useState(false);
  const { applications, 
    total, 
    createApplication,
    deleteApplication,
    archiveApplication,
    updateApplication 
  } = useApplications({ search, filterStatus });

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
    updateApplication 
  }

  return (
    <ApplicationsContext.Provider value={contextInput}>
      {/** Header */}
      <Header />
      {/** Content */}
      <Content />
    </ApplicationsContext.Provider>
  )
}

export default App
