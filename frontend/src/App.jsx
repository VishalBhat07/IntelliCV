import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/Register";
import UploadDocuments from "./pages/UploadDocuments";
import JobDescriptionPage from "./pages/JobDescriptionPage";
import GeneratedResumePage from "./pages/GeneratedResumePage";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'
  const [currentPage, setCurrentPage] = useState("upload");
  const [documents, setDocuments] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // theme removed: app uses system/default styling only

  const handleLogin = async (userData) => {
    try {
      const res = await axios.post(BACKEND_URL + "/api/auth/login", userData);
      console.log(res.data.user);
      localStorage.setItem("token", res.data.token);
      if (res.data?.user?.user_id != null) {
        localStorage.setItem("user_id", String(res.data.user.user_id));
      }
      toast.success("Login successful");
      if (res.status == 200) {
        setCurrentPage("upload");
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
      const msg = err?.response?.data?.msg || err.message || "Login failed";
      toast.error(msg);
      console.log("Error logging in: ", err);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const res = await axios.post(
        BACKEND_URL + "/api/auth/register",
        userData
      );
      // backend returns user and message; after registration we login the user
      if (res.status === 200 || res.status === 201) {
        toast.success("Registered successfully");
        // Try logging in to obtain token
        await handleLogin({
          email: userData.email,
          password: userData.password,
        });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.msg || err.message || "Registration failed";
      toast.error(msg);
      console.log("Error registering: ", err);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    setUser(null);
    setAuthMode("login");
    setCurrentPage("upload");
    setDocuments([]);
  };

  if (!user) {
    if (authMode === "register") {
      return (
        <>
          <Toaster position="top-right" />
          <RegisterPage
            onRegister={handleRegister}
            onShowLogin={() => setAuthMode("login")}
          />
        </>
      );
    }

    return (
      <>
        <Toaster position="top-right" />
        <LoginPage
          onLogin={handleLogin}
          onShowRegister={() => setAuthMode("register")}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-slate-900">
      <Toaster position="top-right" />
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
          onLogout={handleLogout}
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
                onUploadDocument={handleUpload}
                documents={documents}
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
