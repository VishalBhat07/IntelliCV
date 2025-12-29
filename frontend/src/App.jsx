import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { CheckCircle } from "lucide-react";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/Register";
import EducationForm from "./pages/EducationForm";
import UploadDocuments from "./pages/UploadDocuments";
import JobDescriptionPage from "./pages/JobDescriptionPage";
import GenerateResume from "./pages/GenerateResume";
import GeneratedResumePage from "./pages/GeneratedResumePage";

// Step-based flow: education → documents → job → generate → preview
const STEPS = ["education", "documents", "job", "generate", "preview"];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [currentStep, setCurrentStep] = useState(0);
  const [educationData, setEducationData] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [jobDescription, setJobDescription] = useState("");
  const [generatedResume, setGeneratedResume] = useState(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const handleLogin = async (userData) => {
    try {
      const res = await axios.post(BACKEND_URL + "/api/auth/login", userData);
      localStorage.setItem("token", res.data.token);
      if (res.data?.user?.user_id != null) {
        localStorage.setItem("user_id", String(res.data.user.user_id));
      }
      toast.success("Login successful");
      if (res.status === 200) {
        setUser(res.data.user);
        setShowLanding(false);
        setCurrentStep(0);
      }
    } catch (err) {
      setUser(null);
      const msg = err?.response?.data?.msg || err.message || "Login failed";
      toast.error(msg);
    }
  };

  const handleRegister = async (userData) => {
    try {
      const res = await axios.post(
        BACKEND_URL + "/api/auth/register",
        userData
      );
      if (res.status === 200 || res.status === 201) {
        toast.success("Registered successfully");
        await handleLogin({
          email: userData.email,
          password: userData.password,
        });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.msg || err.message || "Registration failed";
      toast.error(msg);
    }
  };

  const handleEducationSubmit = (eduData) => {
    setEducationData(eduData);
    setCurrentStep(1);
  };

  const handleDocumentsNext = () => {
    setCurrentStep(2);
  };

  const handleUpload = (newDocs) => {
    if (!newDocs || newDocs.length === 0) return;
    setDocuments((prev) => {
      const existingNames = new Set(prev.map((d) => d.name));
      const filtered = newDocs.filter((nd) => !existingNames.has(nd.name));
      if (filtered.length === 0) return prev;
      return [...filtered, ...prev];
    });
  };

  const handleJobNext = (jd) => {
    setJobDescription(jd);
    setCurrentStep(3);
  };

  const handleGenerationComplete = (resume) => {
    setGeneratedResume(resume);
    setCurrentStep(4);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    setUser(null);
    setShowLanding(true);
    setAuthMode("login");
    setCurrentStep(0);
    setEducationData([]);
    setDocuments([]);
    setJobDescription("");
    setGeneratedResume(null);
  };

  const handleGetStarted = () => {
    setShowLanding(false);
    if (!user) {
      setAuthMode("login");
    }
  };

  // Show landing page if user hasn't clicked get started and isn't logged in
  if (showLanding && !user) {
    return (
      <>
        <Toaster position="top-right" />
        <LandingPage onGetStarted={handleGetStarted} />
      </>
    );
  }

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

  // Step progress indicator
  const stepNames = [
    "Education",
    "Documents",
    "Job Description",
    "Generate",
    "Preview",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-black shadow-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">IC</span>
              </div>
              <h1 className="text-2xl font-bold text-white">IntelliCV</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Welcome, {user.first_name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Progress Stepper */}
        {currentStep < 4 && (
          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              {stepNames.slice(0, 4).map((name, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        idx < currentStep
                          ? "bg-green-500 text-white"
                          : idx === currentStep
                          ? "bg-blue-600 text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {idx < currentStep ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        idx <= currentStep ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {name}
                    </span>
                  </div>
                  {idx < stepNames.length - 2 && (
                    <div
                      className={`flex-1 h-1 mx-4 ${
                        idx < currentStep ? "bg-green-500" : "bg-white/10"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Step Content */}
        {currentStep === 0 && (
          <EducationForm
            onNext={handleEducationSubmit}
            initialData={educationData}
          />
        )}

        {currentStep === 1 && (
          <UploadDocuments
            documents={documents}
            onUpload={handleUpload}
            onNext={handleDocumentsNext}
            onBack={() => setCurrentStep(0)}
          />
        )}

        {currentStep === 2 && (
          <JobDescriptionPage
            onNext={handleJobNext}
            initialText={jobDescription}
            documents={documents}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <GenerateResume
            userId={user.user_id}
            educationData={educationData}
            jobDescription={jobDescription}
            onComplete={handleGenerationComplete}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <GeneratedResumePage
            resume={generatedResume}
            onBack={() => setCurrentStep(3)}
            onRestart={() => setCurrentStep(0)}
          />
        )}
      </main>
    </div>
  );
}
