import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { resumeAPI, jobDescriptionAPI } from "../../services/api";

const GenerateStep = ({ resumeData, onBack, onComplete }) => {
  const [generating, setGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null);
  const hasStarted = useRef(false);

  const steps = [
    { label: "Analyzing your education", icon: "school" },
    { label: "Processing uploaded documents", icon: "description" },
    { label: "Extracting job requirements", icon: "work" },
    { label: "Optimizing keywords for ATS", icon: "auto_awesome" },
    { label: "Generating your resume", icon: "draw" },
  ];

  useEffect(() => {
    if (!generating || hasStarted.current) return;
    hasStarted.current = true;

    const generateResume = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.user_id) {
          throw new Error("User not found. Please login again.");
        }
        const userId = user.user_id;

        // Step 1: Analyze education (already saved in EducationStep)
        setCurrentStep(0);
        setProgress(10);
        await new Promise((r) => setTimeout(r, 500));

        // Step 2: Processing documents (already uploaded in DocumentsStep)
        setCurrentStep(1);
        setProgress(30);
        await new Promise((r) => setTimeout(r, 500));

        // Step 3: Save job description text if provided
        setCurrentStep(2);
        setProgress(50);
        if (resumeData.jobDescription?.text) {
          await jobDescriptionAPI.save(userId, resumeData.jobDescription.text);
        }
        await new Promise((r) => setTimeout(r, 500));

        // Step 4: Optimize for ATS (part of process call)
        setCurrentStep(3);
        setProgress(70);
        await new Promise((r) => setTimeout(r, 500));

        // Step 5: Generate resume via LLM processing
        setCurrentStep(4);
        setProgress(85);
        console.log("🚀 Calling resumeAPI.process for user:", userId);
        const result = await resumeAPI.process(userId);
        
        console.log("✅ API Response received:", result);
        console.log("📄 Resume data:", result.resume);
        console.log("📊 Match score:", result.matchScore);
        
        setProgress(100);
        setGeneratedResume(result);
        setCompleted(true);
        setGenerating(false);
        toast.success("Resume generated successfully!");

        // Trigger transition to editor after brief delay
        setTimeout(() => {
          if (onComplete) {
            // Pass the actual resume data, not the whole result
            console.log("📤 Passing resume to editor:", result.resume);
            onComplete(result.resume);
          }
        }, 1500);
      } catch (err) {
        console.error("Resume generation failed:", err);
        setError(err.message || "Failed to generate resume");
        setGenerating(false);
        toast.error(err.response?.data?.msg || err.message || "Generation failed");
      }
    };

    generateResume();
  }, [generating, resumeData, onComplete]);

  const handleViewResume = () => {
    // Trigger transition to editor with generated resume
    if (onComplete && generatedResume) {
      console.log("Manually viewing resume:", generatedResume.resume);
      onComplete(generatedResume.resume);
    }
  };

  const handleDownload = async () => {
    if (!generatedResume?.resume) {
      toast.error("No resume content to download");
      return;
    }
    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });
      const blob = await resumeAPI.exportPdf(
        generatedResume.resume,
        `Resume_${Date.now()}.pdf`
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Resume_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded!", { id: "pdf-download" });
    } catch (err) {
      console.error("PDF download failed:", err);
      toast.error("Failed to download PDF", { id: "pdf-download" });
    }
  };

  return (
    <div className="w-full max-w-3xl px-6">
      <div className="text-center mb-12">
        {/* Icon */}
        <div
          className={`mx-auto mb-6 flex w-24 h-24 items-center justify-center rounded-full border-4 border-[#111827] text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] relative z-10 transition-all duration-500 ${
            completed
              ? "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              : "bg-blue-500"
          }`}
        >
          {completed ? (
            <span className="material-symbols-outlined text-[48px]">
              check_circle
            </span>
          ) : (
            <span className="material-symbols-outlined text-[48px] animate-pulse">
              auto_awesome
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl mb-4">
          {completed ? (
            <>
              Your Resume is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                Ready!
              </span>
            </>
          ) : (
            <>
              Generating Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Perfect Resume
              </span>
            </>
          )}
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
          {completed
            ? "Your ATS-optimized resume has been created. Download it or view it in your dashboard."
            : "Our AI is crafting your ATS-optimized resume. This usually takes about 30 seconds."}
        </p>
      </div>

      {/* Progress Card */}
      <div className="glass-card rounded-2xl p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none"></div>

        {!completed ? (
          <>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-300">
                  Progress
                </span>
                <span className="text-sm font-bold text-blue-400">
                  {progress}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-200 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    index === currentStep
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : index < currentStep
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-white/5 border border-white/5"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      index === currentStep
                        ? "bg-blue-500 text-white"
                        : index < currentStep
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {index < currentStep ? (
                      <span className="material-symbols-outlined text-xl">
                        check
                      </span>
                    ) : index === currentStep ? (
                      <span className="material-symbols-outlined text-xl animate-spin">
                        sync
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-xl">
                        {step.icon}
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-medium ${
                      index === currentStep
                        ? "text-blue-400"
                        : index < currentStep
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </span>
                  {index === currentStep && (
                    <div className="ml-auto flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-xs text-blue-400 font-medium">
                        In progress...
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Completion Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-white/5">
                <div className="text-3xl font-bold text-emerald-400 mb-1">
                  92
                </div>
                <div className="text-sm text-slate-400">ATS Score</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-white/5">
                <div className="text-3xl font-bold text-blue-400 mb-1">15</div>
                <div className="text-sm text-slate-400">Keywords Matched</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-white/5">
                <div className="text-3xl font-bold text-purple-400 mb-1">1</div>
                <div className="text-sm text-slate-400">Page</div>
              </div>
            </div>

            {/* Resume Preview Placeholder */}
            <div className="bg-white rounded-xl p-6 mb-8 shadow-lg">
              <div className="space-y-3">
                <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                <div className="h-px bg-slate-200 my-4"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                <div className="h-4 bg-slate-100 rounded w-4/5"></div>
                <div className="h-px bg-slate-200 my-4"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 bg-slate-800/50 text-white font-bold hover:bg-slate-700 transition-all"
              >
                <span className="material-symbols-outlined">download</span>
                Download PDF
              </button>
              <button
                onClick={handleViewResume}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
              >
                <span className="material-symbols-outlined">visibility</span>
                View in Dashboard
              </button>
            </div>
          </>
        )}
      </div>

      {/* Back Button (only when not generating) */}
      {!generating && !completed && (
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg border border-white/10 text-gray-400 font-semibold hover:text-white hover:bg-white/5 transition-colors inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              arrow_back
            </span>
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default GenerateStep;
