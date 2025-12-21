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
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full border-2 border-indigo-100">
        {status === "idle" && (
          <div className="text-center">
            {/* Ready to Generate Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-all duration-300">
                <Wand2 className="w-12 h-12 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Ready to Generate Your Resume
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We have all your information. Click the button below to generate
              your AI-powered resume!
            </p>

            {/* Summary of what will be processed */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 text-left border-2 border-indigo-100">
              <h3 className="font-bold text-gray-900 mb-4 text-xl">
                What we'll include:
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-lg">
                    {educationData?.length || 0} Education entries
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-lg">
                    Uploaded documents (certificates, projects)
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-lg">
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
              className="px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl flex items-center gap-3 mx-auto text-lg transform transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-6 h-6" />
              Generate Resume
            </button>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="mt-6 px-8 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 hover:border-indigo-300 flex items-center gap-2 mx-auto transition-all duration-300"
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
              <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                <Sparkles className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>

            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Generating Your Resume
            </h2>
            <p className="text-lg text-gray-600 mb-8">{message}</p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out shadow-md"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-base text-gray-600 font-semibold">
              {progress}% Complete
            </p>

            {/* Processing Steps Animation */}
            <div className="mt-12 flex justify-center space-x-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full animate-bounce shadow-lg"
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
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Success!
            </h2>
            <p className="text-lg text-gray-600">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <FileText className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-lg text-gray-600 mb-8">{message}</p>
            <button
              onClick={onBack}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-2xl flex items-center gap-2 mx-auto transition-all duration-300 transform hover:scale-105"
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
