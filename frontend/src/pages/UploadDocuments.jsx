import React, { useState } from "react";
import axios from "axios";
import { Upload, FileText, CheckCircle } from "lucide-react";

const FILE_TYPES = ["Certificates", "Project", "Education", "Miscellaneous"];

export default function UploadDocuments({
  documents = [],
  onUpload,
  onGoToJob,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileType, setFileType] = useState(FILE_TYPES[0]);

  // backend base URL: prefer Vite env `VITE_BACKEND_URL`, fallback to localhost
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);

    // Build form data
    const fd = new FormData();
    // attempt to get user id from localStorage, fallback to 1
    const userId = window.localStorage.getItem("user_id") || "1";
    fd.append("user_id", userId);
    fd.append("file_type", fileType);
    Array.from(files).forEach((f) => fd.append("files", f));

    // Use axios to upload and track progress
    const url = `${BACKEND_URL.replace(/\/$/, "")}/api/upload`;
    axios
      .post(url, fd, {
        // do NOT set Content-Type header manually; let axios/browser set the
        // correct multipart/form-data boundary so multer can parse files
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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
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

      <div
        className={`bg-white rounded-xl shadow-sm p-6 border-2 border-dashed transition-all ${
          dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
        }`}
        onDragEnter={onDrag}
        onDragOver={onDrag}
        onDragLeave={onDrag}
        onDrop={onDrop}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Upload Documents
        </h2>
        <div className="text-center py-8">
          <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Drag & drop files here
          </h3>
          <p className="text-gray-600 mb-4">or</p>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700">
            <Upload className="w-5 h-5" />
            Choose Files
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </label>
        </div>

        {uploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Uploading...
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={() => onGoToJob && onGoToJob()}
            disabled={uploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next: Job Description
          </button>
        </div>
      </div>

      {documents && documents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Uploaded Documents
          </h3>
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                    </div>
                  </div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
