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
  const apiDoneRef = useRef(false);
  const apiResultRef = useRef(null);
  const apiErrorRef = useRef(null);

  const steps = [
    { label: "Analyzing your profile", icon: "person_search", duration: 3000 },
    { label: "Processing education details", icon: "school", duration: 3500 },
    {
      label: "Scanning uploaded documents",
      icon: "description",
      duration: 4000,
    },
    {
      label: "Extracting skills & achievements",
      icon: "psychology",
      duration: 5000,
    },
    { label: "Analyzing job requirements", icon: "work", duration: 5000 },
    {
      label: "Matching keywords for ATS",
      icon: "auto_awesome",
      duration: 5500,
    },
    { label: "Crafting resume sections", icon: "draw", duration: 6000 },
    { label: "Polishing & finalizing", icon: "verified", duration: 8000 },
  ];

  // Progress targets for each step (when that step becomes active)
  const stepProgressTargets = [5, 14, 25, 38, 50, 64, 78, 90];

  useEffect(() => {
    if (!generating || hasStarted.current) return;
    hasStarted.current = true;

    // --- Fire off the actual API call immediately in background ---
    const runApiCall = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user?.user_id) {
          throw new Error("User not found. Please login again.");
        }
        const userId = user.user_id;

        const selectedDocIds =
          resumeData.documents?.selectedLibraryDocIds || [];
        console.log("📋 Selected library doc IDs:", selectedDocIds);

        // Save job description if provided
        if (resumeData.jobDescription?.text) {
          await jobDescriptionAPI.save(userId, resumeData.jobDescription.text);
        }

        // Generate resume via LLM processing
        console.log("🚀 Calling resumeAPI.process for user:", userId);
        console.log(
          "📌 With selected doc IDs:",
          selectedDocIds.length > 0 ? selectedDocIds : "all documents",
        );
        const result = await resumeAPI.process(
          userId,
          selectedDocIds.length > 0 ? selectedDocIds : null,
        );

        console.log("✅ API Response received:", result);
        console.log("📄 Resume data:", result.resume);
        console.log("📊 Match score:", result.matchScore);

        apiResultRef.current = result;
        apiDoneRef.current = true;
      } catch (err) {
        console.error("Resume generation failed:", err);
        apiErrorRef.current = err;
        apiDoneRef.current = true;
      }
    };

    runApiCall();

    // --- Animate steps independently with smooth progress ---
    const animateSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);

        const startProgress = i === 0 ? 0 : stepProgressTargets[i - 1];
        const endProgress = stepProgressTargets[i];
        const duration = steps[i].duration;
        const incrementInterval = 150; // update every 150ms
        const totalTicks = Math.floor(duration / incrementInterval);
        const progressPerTick = (endProgress - startProgress) / totalTicks;

        // Smoothly increment progress within this step
        for (let tick = 0; tick < totalTicks; tick++) {
          // If API is already done, accelerate to finish
          if (apiDoneRef.current) {
            // Quick-finish remaining steps
            for (let j = i; j < steps.length; j++) {
              setCurrentStep(j);
              setProgress(stepProgressTargets[j]);
              await new Promise((r) => setTimeout(r, 200));
            }
            // Finish up
            finishGeneration();
            return;
          }
          setProgress(Math.round(startProgress + progressPerTick * (tick + 1)));
          await new Promise((r) => setTimeout(r, incrementInterval));
        }
      }

      // All steps animated but API not done yet — hold at 92% with slow creep
      let holdProgress = 92;
      const creepInterval = setInterval(() => {
        if (apiDoneRef.current) {
          clearInterval(creepInterval);
          finishGeneration();
          return;
        }
        // Slowly creep toward 98% but never reach it
        holdProgress = Math.min(holdProgress + 0.3, 98);
        setProgress(Math.round(holdProgress));
      }, 500);
    };

    const finishGeneration = () => {
      if (apiErrorRef.current) {
        const err = apiErrorRef.current;
        setError(err.message || "Failed to generate resume");
        setGenerating(false);
        toast.error(
          err.response?.data?.msg || err.message || "Generation failed",
        );
        return;
      }

      const result = apiResultRef.current;
      setProgress(100);
      setCurrentStep(steps.length); // all steps done
      setGeneratedResume(result);
      setCompleted(true);
      setGenerating(false);
      toast.success("Resume generated successfully!");

      setTimeout(() => {
        if (onComplete) {
          console.log("📤 Passing resume to editor:", result.resume);
          onComplete(result.resume);
        }
      }, 1500);
    };

    animateSteps();
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
        `Resume_${Date.now()}.pdf`,
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
            : "Our AI is crafting your ATS-optimized resume. This may take up to a minute."}
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
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
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
