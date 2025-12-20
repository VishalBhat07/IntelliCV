import React, { useState } from "react";
import axios from "axios";
import {
  Sparkles,
  FileText,
  CheckCircle,
  ArrowLeft,
  Wand2,
} from "lucide-react";

export default function GenerateResume({
  userId,
  educationData,
  jobDescription,
  onComplete,
  onBack,
}) {
  const [status, setStatus] = useState("idle"); // idle, processing, success, error
  const [message, setMessage] = useState("Saving your information...");
  const [progress, setProgress] = useState(0);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const statusMessages = [
    "Preparing your data...",
    "Exporting documents from database...",
    "Extracting text from PDFs and documents...",
    "Sending data to Gemini AI for analysis...",
    "AI is generating database queries...",
    "Populating database with extracted information...",
    "Fetching all your data from database...",
    "Generating optimized resume with Gemini AI...",
    "Finalizing your resume...",
  ];

  // Function to start resume generation
  const handleGenerateResume = async () => {
    setStatus("processing");
    setProgress(0);

    let currentStep = 0;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 10, 95);
        return newProgress;
      });

      if (currentStep < statusMessages.length) {
        setMessage(statusMessages[currentStep]);
        currentStep++;
      }
    }, 2000);

    // Call backend to process everything
    const generateResume = async () => {
      try {
        console.log("🚀 Starting resume generation for user:", userId);

        // Step 1: Save education data to backend
        if (educationData && educationData.length > 0) {
          console.log("📚 Saving education data...");
          const educationUrl = `${BACKEND_URL.replace(
            /\/$/,
            ""
          )}/api/education`;
          await axios.post(educationUrl, {
            user_id: userId,
            education: educationData,
          });
          console.log("✅ Education data saved");
        }

        // Step 2: Save job description to backend
        if (jobDescription && jobDescription.trim()) {
          console.log("💼 Saving job description...");
          const jobUrl = `${BACKEND_URL.replace(
            /\/$/,
            ""
          )}/api/job-description`;
          await axios.post(jobUrl, {
            user_id: userId,
            description: jobDescription,
          });
          console.log("✅ Job description saved");
        }

        // Step 3: Complete processing - exports documents, extracts text, generates queries, populates DB, and creates resume
        console.log("⚙️ Starting document processing...");
        const processUrl = `${BACKEND_URL.replace(
          /\/$/,
          ""
        )}/api/upload/process`;
        const response = await axios.post(processUrl, { user_id: userId });
        const result = response.data;

        console.log("✅ Processing complete:", result);

        if (!result.resume || !result.resume.html) {
          throw new Error(
            "Resume HTML not found in response. Please ensure documents are uploaded."
          );
        }

        clearInterval(progressInterval);
        setProgress(100);
        setMessage("Resume generated successfully!");
        setStatus("success");

        // Pass the generated resume to the next step
        setTimeout(() => {
          onComplete({
            text: result.resume.html,
            htmlContent: result.resume.html,
            match_score: result.resume.matchScore || 0,
            steps: result.steps,
          });
        }, 1500);
      } catch (err) {
        console.error("❌ Resume generation error:", err);
        console.error("Error details:", {
          message: err.message,
          response: err?.response?.data,
          status: err?.response?.status,
        });

        clearInterval(progressInterval);
        setStatus("error");

        // More detailed error message
        let errorMsg = "Failed to generate resume";
        if (err?.response?.data?.msg) {
          errorMsg = err.response.data.msg;
        } else if (err?.response?.data?.error) {
          errorMsg = err.response.data.error;
        } else if (err.message) {
          errorMsg = err.message;
        }

        setMessage(errorMsg);
      }
    };

    await generateResume();
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-12 max-w-2xl w-full">
        {status === "idle" && (
          <div className="text-center">
            {/* Ready to Generate Icon */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Wand2 className="w-16 h-16 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Generate Your Resume
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We have all your information. Click the button below to generate
              your AI-powered resume!
            </p>

            {/* Summary of what will be processed */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">
                What we'll include:
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>{educationData?.length || 0} Education entries</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Uploaded documents (certificates, projects)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>
                    {jobDescription
                      ? "Job description provided"
                      : "General resume (no specific job)"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateResume}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 flex items-center gap-3 mx-auto text-lg shadow-lg transform transition hover:scale-105"
            >
              <Sparkles className="w-6 h-6" />
              Generate Resume
            </button>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="mt-6 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Job Description
            </button>
          </div>
        )}

        {status === "processing" && (
          <div className="text-center">
            {/* Animated Icon */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Generating Your Resume
            </h2>
            <p className="text-lg text-gray-600 mb-8">{message}</p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">{progress}% Complete</p>

            {/* Processing Steps Animation */}
            <div className="mt-12 flex justify-center space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success!</h2>
            <p className="text-lg text-gray-600">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <FileText className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-lg text-gray-600 mb-8">{message}</p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
