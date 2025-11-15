import React, { useState, useEffect } from "react";
import axios from "axios";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import LoginPage from "./pages/LoginPage";
import UploadDocuments from "./pages/UploadDocuments";
import JobDescriptionPage from "./pages/JobDescriptionPage";
import GeneratedResumePage from "./pages/GeneratedResumePage";

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("upload");
  const [documents, setDocuments] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // theme: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    // apply theme by toggling `dark` class on documentElement
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogin = async (userData) => {
    try {
      const res = await axios.post(BACKEND_URL + "/api/auth/login", userData);
      console.log(res.data.user);
      localStorage.setItem("token", res.data.token);
      if (res.status == 200) {
        setCurrentPage("upload");
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
      console.log("Error logging in: ", err);
    }
  };

  // deduplicate on upload by file name
  const handleUpload = (newDocs) => {
    if (!newDocs || newDocs.length === 0) return;
    setDocuments((prev) => {
      const existingNames = new Set(prev.map((d) => d.name));
      const filtered = newDocs.filter((nd) => !existingNames.has(nd.name));
      // add newest first
      if (filtered.length === 0) return prev;
      return [...filtered, ...prev];
    });
  };

  const handleJobDesc = (jd) => {
    setJobDescription(jd);
    setCurrentPage("resume");
  };

  if (!user) return <LoginPage onLogin={handleLogin} />;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      <Sidebar
        user={user}
        current={currentPage}
        setCurrent={setCurrentPage}
        collapsed={sidebarCollapsed}
      />

      <div className="flex-1 flex flex-col">
        <Topbar
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          theme={theme}
          setTheme={setTheme}
        />

        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-8">
            {currentPage === "upload" && (
              <UploadDocuments
                user={user}
                documents={documents}
                onUpload={handleUpload}
                onGoToJob={() => setCurrentPage("job")}
              />
            )}
            {currentPage === "job" && (
              <JobDescriptionPage
                onNext={handleJobDesc}
                initialText={jobDescription}
              />
            )}
            {currentPage === "resume" && (
              <GeneratedResumePage jobDescription={jobDescription} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
