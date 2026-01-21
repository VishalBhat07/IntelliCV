import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EducationStep from "./resume-studio/EducationStep";
import DocumentsStep from "./resume-studio/DocumentsStep";
import JobDescriptionStep from "./resume-studio/JobDescriptionStep";
import GenerateStep from "./resume-studio/GenerateStep";
import ResumeEditor from "./resume-studio/ResumeEditor";
import CurtainTransition from "../components/CurtainTransition";
import { resumeAPI } from "../services/api";
import toast from "react-hot-toast";

const ResumeStudio = () => {
  const navigate = useNavigate();
  const { resumeId } = useParams();
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [showCurtain, setShowCurtain] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [resumeData, setResumeData] = useState({
    education: [],
    documents: [],
    jobDescription: { text: "", file: null },
  });
  const [generatedResume, setGeneratedResume] = useState(null);
  const [existingResumeId, setExistingResumeId] = useState(null);

  // Load existing resume if resumeId is provided
  useEffect(() => {
    if (resumeId) {
      loadExistingResume(resumeId);
    }
  }, [resumeId]);

  const loadExistingResume = async (id) => {
    try {
      setLoadingExisting(true);
      const data = await resumeAPI.getById(id);
      if (data.resume) {
        console.log("📥 Loaded existing resume:", data.resume);
        setGeneratedResume(data.resume);
        setExistingResumeId(data.resume.resume_id);
        // Skip the wizard and go directly to editor
        setShowEditor(true);
      }
    } catch (error) {
      console.error("Failed to load resume:", error);
      toast.error("Failed to load resume");
      navigate("/dashboard");
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const steps = [
    { number: 1, label: "Education", icon: "school" },
    { number: 2, label: "Upload", icon: "cloud_upload" },
    { number: 3, label: "Job Description", icon: "work" },
    { number: 4, label: "Generate", icon: "auto_awesome" },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate("/dashboard");
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const updateEducation = (data) => {
    setResumeData((prev) => ({ ...prev, education: data }));
  };

  const updateDocuments = (data) => {
    setResumeData((prev) => ({ ...prev, documents: data }));
  };

  const updateJobDescription = (data) => {
    setResumeData((prev) => ({ ...prev, jobDescription: data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <EducationStep
            data={resumeData.education}
            onUpdate={updateEducation}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <DocumentsStep
            data={resumeData.documents}
            onUpdate={updateDocuments}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <JobDescriptionStep
            data={resumeData.jobDescription}
            onUpdate={updateJobDescription}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <GenerateStep
            resumeData={resumeData}
            onBack={handleBack}
            onComplete={handleGenerationComplete}
          />
        );
      default:
        return null;
    }
  };

  const handleGenerationComplete = (generatedResumeData) => {
    // Store the generated resume data
    console.log(
      "📥 ResumeStudio received generated resume:",
      generatedResumeData,
    );
    setGeneratedResume(generatedResumeData);
    // Show curtain animation
    setShowCurtain(true);
  };

  const handleCurtainComplete = () => {
    // After curtain closes, switch to editor and reopen curtain
    setShowEditor(true);
    setTimeout(() => {
      setShowCurtain(false);
    }, 50);
  };

  // If showing editor, render it directly
  if (showEditor) {
    return (
      <>
        <ResumeEditor
          resumeData={generatedResume}
          resumeId={existingResumeId}
        />
        <CurtainTransition
          isOpen={!showCurtain}
          onComplete={handleCurtainComplete}
        />
      </>
    );
  }

  // Show loading state when loading existing resume
  if (loadingExisting) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F172A]">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined animate-spin text-4xl text-blue-500">
            progress_activity
          </span>
          <p className="text-white">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0F172A] to-[#0F172A]">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md px-4 sm:px-10 py-3">
          <Link to="/dashboard" className="flex items-center gap-4 text-white">
            <div className="w-8 h-8 flex items-center justify-center text-blue-500">
              <span className="material-symbols-outlined text-3xl">resume</span>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              Resume Studio
            </h2>
          </Link>

          {/* Step Navigation */}
          <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/5">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                {index > 0 && <div className="w-px h-4 bg-white/10 mx-1"></div>}
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                    currentStep === step.number
                      ? "bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/25"
                      : currentStep > step.number
                        ? "text-emerald-400"
                        : "text-slate-400 opacity-60"
                  }`}
                >
                  <span
                    className={`flex w-5 h-5 items-center justify-center rounded-full text-[10px] ${
                      currentStep > step.number
                        ? "bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500/30"
                        : currentStep === step.number
                          ? "bg-white text-blue-500 font-bold"
                          : "bg-white/10 text-white"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <span className="material-symbols-outlined text-[14px]">
                        check
                      </span>
                    ) : (
                      step.number
                    )}
                  </span>
                  <span className="text-sm font-medium">{step.label}</span>
                </div>
              </div>
            ))}
          </nav>

          <div className="flex flex-1 justify-end gap-4 sm:gap-8 items-center">
            <div className="hidden sm:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-slate-300 text-sm font-medium leading-normal hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <a
                href="#"
                className="text-slate-300 text-sm font-medium leading-normal hover:text-white transition-colors"
              >
                Templates
              </a>
              <a
                href="#"
                className="text-slate-300 text-sm font-medium leading-normal hover:text-white transition-colors"
              >
                Support
              </a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="flex w-9 h-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-300 transition-colors border border-white/5"
              >
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
              </button>
              <div
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 ring-2 ring-[#0F172A] cursor-pointer flex items-center justify-center text-white font-bold text-sm"
                title={user?.email}
              >
                {user?.first_name?.charAt(0)}
                {user?.last_name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Step Indicator */}
        <div className="md:hidden px-4 py-3 border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-500 text-xs font-bold uppercase tracking-wider">
              Step {currentStep} of 4
            </span>
            <span className="text-slate-400 text-xs">
              {currentStep * 25}% Complete
            </span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${currentStep * 25}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-start py-6 sm:py-10 px-4 sm:px-8">
          {renderStep()}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-[#0F172A] py-6 mt-auto">
          <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2024 IntelliCV Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-gray-300 transition-colors" href="#">
                Privacy Policy
              </a>
              <a className="hover:text-gray-300 transition-colors" href="#">
                Terms of Service
              </a>
              <a className="hover:text-gray-300 transition-colors" href="#">
                Help Center
              </a>
            </div>
          </div>
        </footer>

        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] bg-emerald-500/5 rounded-full blur-[140px] opacity-40"></div>
        </div>
      </div>

      {/* Curtain Transition - only show when triggered */}
      {showCurtain && (
        <CurtainTransition isOpen={false} onComplete={handleCurtainComplete} />
      )}
    </>
  );
};

export default ResumeStudio;
