import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { uploadAPI } from "../../services/api";

// File types matching the old frontend
const FILE_TYPES = ["Certificates", "Project", "Education", "Miscellaneous"];

const DocumentsStep = ({ data, onUpdate, onNext, onBack }) => {
  const [documents, setDocuments] = useState(data || []);
  const [uploading, setUploading] = useState(null);
  const [docType, setDocType] = useState(FILE_TYPES[0]);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload PDF, DOCX, or TXT files only");
      return;
    }

    // Upload to backend
    setUploading({
      name: file.name,
      progress: 0,
      type: docType,
    });

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.user_id) {
        toast.error("User not found. Please login again.");
        setUploading(null);
        return;
      }

      const response = await uploadAPI.uploadFiles(
        user.user_id,
        [file],
        docType,
        (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setUploading((prev) => (prev ? { ...prev, progress: percent } : null));
        }
      );

      // Add uploaded files to documents list
      const uploadedFiles = (response.files || []).map((f) => ({
        id: f._id || Date.now(),
        name: f.file_name || file.name,
        type: f.file_type || docType,
        size: formatFileSize(file.size),
        uploadedAt: "just now",
      }));

      const updated = [...documents, ...uploadedFiles];
      setDocuments(updated);
      onUpdate(updated);
      setUploading(null);
      toast.success("Document uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploading(null);
      toast.error(
        error.response?.data?.msg || "Upload failed. Please try again."
      );
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeDocument = (id) => {
    const updated = documents.filter((doc) => doc.id !== id);
    setDocuments(updated);
    onUpdate(updated);
    toast.success("Document removed");
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "Certificates":
        return { icon: "workspace_premium", color: "amber" };
      case "Project":
        return { icon: "folder_open", color: "blue" };
      case "Education":
        return { icon: "school", color: "purple" };
      case "Miscellaneous":
        return { icon: "description", color: "green" };
      default:
        return { icon: "description", color: "gray" };
    }
  };

  const getTypeLabel = (type) => {
    // Since we're now using the exact type names, just return the type
    return type || "Other";
  };

  return (
    <div className="w-full max-w-[850px] flex flex-col gap-8">
      {/* Progress Header */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <span className="text-sm font-bold text-blue-500 tracking-wider uppercase">
            Step 2 of 4
          </span>
          <span className="text-xs font-semibold text-slate-400">
            50% Completed
          </span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 w-1/2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="glass-card rounded-2xl p-6 md:p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

        {/* Title */}
        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-white">
            Upload Documents
          </h1>
          <p className="text-slate-400 text-base font-normal max-w-2xl">
            Import your existing resume, cover letter, or portfolio to auto-fill
            your profile.
            <span className="block text-sm mt-2 text-slate-500 font-medium">
              Supported formats: PDF, DOCX, TXT. Max size: 5MB.
            </span>
          </p>
        </div>

        <div className="h-px w-full bg-slate-700/50"></div>

        <div className="flex flex-col gap-8 relative z-10">
          {/* Document Type Selector */}
          <div className="flex flex-col gap-3">
            <label
              className="text-sm font-bold text-slate-300 uppercase tracking-wide"
              htmlFor="doc-type"
            >
              Document Type
            </label>
            <div className="relative group">
              <select
                className="w-full appearance-none rounded-xl bg-slate-900/50 border border-slate-600 text-white py-4 px-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all cursor-pointer text-base hover:border-slate-500"
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                {FILE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-dashed border-slate-600 bg-slate-800/20 hover:bg-slate-800/40 hover:border-blue-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] transition-all duration-300 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <input
              ref={fileInputRef}
              className="hidden"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
            />
            <div className="flex flex-col items-center gap-5 text-center z-10 pointer-events-none transform group-hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg shadow-black/20 border border-slate-700 group-hover:border-blue-500/30 group-hover:shadow-blue-500/10 transition-all">
                <span className="material-symbols-outlined text-4xl text-blue-500 group-hover:text-blue-400 transition-colors">
                  cloud_upload
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-xl font-bold text-white">
                  Drag & drop files here
                </p>
                <p className="text-sm text-slate-400">
                  or{" "}
                  <span className="text-blue-500 font-bold hover:underline cursor-pointer">
                    Browse
                  </span>{" "}
                  from your computer
                </p>
              </div>
            </div>
          </div>

          {/* Uploading Progress */}
          {uploading && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Uploading...
                </h3>
              </div>
              <div className="flex items-center gap-4 bg-slate-800/40 border border-slate-700 p-4 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 flex items-center justify-center bg-slate-700/50 rounded-lg text-slate-300 border border-slate-600/50">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-white truncate pr-4">
                      {uploading.name}
                    </span>
                    <span className="font-mono text-xs text-blue-500 font-bold">
                      {uploading.progress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-200"
                      style={{ width: `${uploading.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Documents */}
          {documents.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Uploaded Documents
              </h3>
              {documents.map((doc) => {
                const { icon, color } = getFileIcon(doc.type);
                return (
                  <div
                    key={doc.id}
                    className="group flex items-center gap-4 bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl hover:border-slate-600 hover:bg-slate-800/60 transition-all duration-200"
                  >
                    <div
                      className={`w-12 h-12 flex items-center justify-center bg-${color}-500/10 rounded-lg text-${color}-500 border border-${color}-500/20 group-hover:border-${color}-500/30 transition-colors`}
                    >
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="font-semibold text-white truncate text-sm sm:text-base">
                          {doc.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-300 uppercase tracking-wide w-fit border border-slate-600">
                          {getTypeLabel(doc.type)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {doc.size} • Uploaded {doc.uploadedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="text-slate-400 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-xl">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 pb-12 px-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-300 font-bold text-sm hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          className="group flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
        >
          <span>Next: Job Description</span>
          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};

export default DocumentsStep;
