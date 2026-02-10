import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { uploadAPI } from "../../services/api";

const JobDescriptionStep = ({ data, onUpdate, onNext, onBack }) => {
  const [jobText, setJobText] = useState(data?.text || "");
  const [jobFile, setJobFile] = useState(data?.file || null);
  const [charCount, setCharCount] = useState(data?.text?.length || 0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= 5000) {
      setJobText(text);
      setCharCount(text.length);
      onUpdate({ text, file: jobFile });
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 15 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.user_id) {
        toast.error("User not found. Please login again.");
        setUploading(false);
        return;
      }

      // Upload the file with type "JobDescription"
      await uploadAPI.uploadFiles(user.user_id, [file], "JobDescription");

      setJobFile(file);
      onUpdate({ text: jobText, file });
      toast.success("Job description file uploaded!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(
        error.response?.data?.msg || "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.length <= 5000) {
        setJobText(text);
        setCharCount(text.length);
        onUpdate({ text, file: jobFile });
        toast.success("Text pasted from clipboard!");
      } else {
        toast.error("Pasted text exceeds 5000 characters");
      }
    } catch (err) {
      toast.error("Unable to access clipboard");
    }
  };

  return (
    <div className="w-full max-w-4xl px-6">
      {/* Title Section */}
      <div className="text-center mb-12">
        <div className="mx-auto mb-6 flex w-20 h-20 items-center justify-center rounded-full border-4 border-[#111827] bg-blue-500 text-white shadow-[0_0_25px_rgba(59,130,246,0.4)] relative z-10 transition-transform hover:scale-105 duration-300">
          <span className="material-symbols-outlined text-[36px]">work</span>
        </div>
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl mb-4">
          Target{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Job Description
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
          Paste the job description or upload the posting. IntelliCV will
          optimize your resume keywords to match this specific role.
        </p>
      </div>

      {/* Main Card */}
      <div className="glass-card rounded-2xl p-1 shadow-2xl relative overflow-hidden ring-1 ring-white/10 group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="bg-[#1e293b]/60 rounded-xl p-6 sm:p-10 backdrop-blur-md relative z-10">
          {/* File Upload */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-300 ml-1">
                Job Posting File
              </label>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full group/upload cursor-pointer"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-xl opacity-0 group-hover/upload:opacity-100 transition duration-500 blur"></div>
              <div className="relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-600 rounded-xl bg-[#0F172A]/80 hover:bg-[#0F172A] hover:border-blue-500/50 transition-all duration-300">
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="p-3 rounded-full bg-white/5 mb-3 group-hover/upload:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-gray-400 group-hover/upload:text-blue-500 transition-colors text-2xl">
                      cloud_upload
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-gray-400">
                    <span className="font-bold text-white group-hover/upload:text-blue-500 transition-colors">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX, TXT (Max 5MB)
                  </p>
                </div>
              </div>
            </div>
            {jobFile && (
              <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                <span className="material-symbols-outlined text-base">
                  check_circle
                </span>
                <span>{jobFile.name} uploaded</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2 mb-8">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
              Or paste text
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Text Area */}
          <div className="mb-6 relative">
            <div className="flex justify-between items-center mb-3">
              <label
                className="block text-sm font-semibold text-gray-300 ml-1"
                htmlFor="job-text"
              >
                Description Text
              </label>
              <button
                onClick={handlePasteFromClipboard}
                className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-[16px]">
                  content_paste
                </span>
                Paste from clipboard
              </button>
            </div>
            <div className="relative group/input">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/30 to-emerald-500/30 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition duration-500 blur-sm"></div>
              <textarea
                className="relative w-full rounded-xl border border-white/10 bg-[#0F172A] p-5 text-base text-gray-200 placeholder-gray-600 focus:border-transparent focus:ring-0 focus:outline-none transition-all shadow-inner resize-none leading-relaxed"
                id="job-text"
                placeholder="e.g. We are seeking a Product Manager to lead our growth team. The ideal candidate has experience in B2B SaaS..."
                rows="8"
                value={jobText}
                onChange={handleTextChange}
              />
            </div>
            <div className="flex justify-between mt-2 px-1">
              <div
                className={`flex items-center gap-1.5 transition-opacity ${
                  charCount > 0 ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="material-symbols-outlined text-[16px] text-emerald-500">
                  check_circle
                </span>
                <span className="text-xs font-medium text-emerald-400">
                  Ready for analysis
                </span>
              </div>
              <p className="text-xs font-medium text-gray-500">
                {charCount} / 5,000 characters
              </p>
            </div>
          </div>

          {/* AI Tip */}
          <div className="mb-8 flex gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 items-start">
            <div className="flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
              <span className="material-symbols-outlined text-[16px]">
                auto_awesome
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-emerald-100">
                AI Optimization Tip
              </p>
              <p className="text-sm text-emerald-100/70 leading-relaxed">
                Make sure to include the{" "}
                <strong className="text-emerald-200">Responsibilities</strong>{" "}
                and <strong className="text-emerald-200">Qualifications</strong>{" "}
                sections. Our AI model uses these specific blocks to generate
                the most impactful bullet points for your resume.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-white/10 text-gray-400 font-semibold hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2 group/back"
            >
              <span className="material-symbols-outlined text-[18px] group-hover/back:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Back
            </button>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  onUpdate({ text: "", file: null });
                  onNext();
                }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-[#1E293B] border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
              >
                Skip Step
              </button>
              <button
                onClick={onNext}
                className="w-full sm:w-auto flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-8 text-base font-bold shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95 border border-blue-500/50 group/btn"
              >
                <span>Generate Resume</span>
                <span className="material-symbols-outlined text-[20px] group-hover/btn:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDescriptionStep;
