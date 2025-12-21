import React, { useState } from "react";
import axios from "axios";
import {
  Upload,
  FileText,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

const FILE_TYPES = ["Certificates", "Project", "Education", "Miscellaneous"];

export default function UploadDocuments({
  documents = [],
  onUpload,
  onNext,
  onBack,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileType, setFileType] = useState(FILE_TYPES[0]);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    const userId = window.localStorage.getItem("user_id") || "1";
    fd.append("user_id", userId);
    fd.append("file_type", fileType);
    Array.from(files).forEach((f) => fd.append("files", f));

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
        const data = resp.data;
        const uploaded = (data.files || []).map((f) => ({
          name: f.file_name,
          type: f.file_type || fileType,
          size: "-",
          uploadDate: new Date().toLocaleDateString(),
        }));
        onUpload && onUpload(uploaded);
      })
      .catch((err) => {
        setUploading(false);
        setProgress(0);
        const resp = err?.response;
        const respData = resp?.data;
        console.error("Upload error response:", respData || err.message, resp);
        const msg =
          (respData && (respData.msg || respData.error)) ||
          err.message ||
          "Upload failed";
        alert(`Upload failed: ${msg}`);
      });
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-indigo-100">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Upload Documents
              </h2>
              <p className="text-gray-600 mt-2 text-lg">
                Upload certificates, project descriptions, and other relevant
                documents
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select document type
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value)}
                disabled={uploading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {FILE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={onDrag}
              onDragLeave={onDrag}
              onDragOver={onDrag}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 scale-105"
                  : "border-indigo-300 bg-gradient-to-br from-gray-50 to-indigo-50"
              }`}
            >
              <Upload
                className={`w-16 h-16 mx-auto mb-4 ${
                  dragActive ? "text-indigo-600" : "text-gray-400"
                }`}
              />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag & drop files here
              </p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <label className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700 font-medium">
                Browse Files
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-4">
                Supported formats: PDF, DOC, DOCX, TXT
              </p>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-indigo-900">
                    Uploading...
                  </span>
                  <span className="text-sm font-medium text-indigo-900">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Documents List */}
        {documents.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Uploaded Documents ({documents.length})
            </h3>
            <div className="space-y-3">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.type} • {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={onNext}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2"
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
