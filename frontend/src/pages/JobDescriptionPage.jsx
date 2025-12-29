import React, { useState } from "react";
import axios from "axios";
import { Briefcase, ArrowLeft, ArrowRight, Upload } from "lucide-react";

export default function JobDescriptionPage({
  onNext,
  initialText = "",
  documents = [],
  onBack,
}) {
  const [jdText, setJdText] = useState(initialText);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    const userId = window.localStorage.getItem("user_id") || "1";
    fd.append("user_id", userId);
    fd.append("file_type", "JobDescription");
    fd.append("files", file);

    const url = `${BACKEND_URL.replace(/\/$/, "")}/api/upload`;
    axios
      .post(url, fd, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percent = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setProgress(percent);
          }
        },
      })
      .then((resp) => {
        setUploading(false);
        setProgress(0);
        setUploadedFileName(file.name);
      })
      .catch((err) => {
        setUploading(false);
        setProgress(0);
        const msg =
          err?.response?.data?.msg ||
          err?.response?.data?.error ||
          err.message ||
          "Upload failed";
        alert(`Upload failed: ${msg}`);
      });
  };

  const handleSubmit = () => {
    const trimmed = jdText.trim();

    // Check if documents are uploaded first
    const userId = window.localStorage.getItem("user_id");
    if (!userId) {
      alert("User ID not found. Please login again.");
      return;
    }

    // Job description is optional - can proceed without it
    if (!trimmed && !uploadedFileName) {
      const proceed = window.confirm(
        "No job description provided. Your resume will be generated without tailoring to a specific job. Continue?"
      );
      if (!proceed) return;
      onNext(""); // Pass empty string
      return;
    }

    if (trimmed) {
      console.log(
        "✅ Job description entered, proceeding to resume generation"
      );
      onNext(trimmed);
    } else if (uploadedFileName) {
      console.log(
        "✅ Job description file uploaded, proceeding to resume generation"
      );
      onNext(`Uploaded file: ${uploadedFileName}`);
    }
  };

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-black min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl shadow-2xl p-8 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Job Description
              </h2>
              <p className="text-gray-600 mt-2 text-lg">
                Add the job description you're targeting
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Paste the job description below
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="w-full h-64 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent resize-none text-white placeholder-gray-400"
                placeholder="Paste the complete job description here...&#10;&#10;Example:&#10;We are looking for a Software Engineer with experience in...&#10;• 3+ years of experience&#10;• Strong knowledge of JavaScript, React&#10;• Experience with Node.js and databases"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-b from-black via-gray-900 to-black text-gray-400">
                  OR
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Upload a job description file
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border-2 border-dashed border-white/20 text-gray-300 rounded-lg cursor-pointer hover:bg-white/10 hover:border-white/30 font-medium">
                  <Upload className="w-5 h-5" />
                  {uploadedFileName || "Choose File"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              {uploading && (
                <div className="mt-3 bg-white/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      Uploading...
                    </span>
                    <span className="text-sm font-medium text-white">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-semibold hover:bg-white/20 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
