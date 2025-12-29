import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Sparkles,
  FileText,
  CheckCircle,
  ArrowLeft,
  Wand2,
  Download,
  Edit3,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";

export default function GenerateResume({
  userId,
  educationData,
  jobDescription,
  onBack,
}) {
  const [status, setStatus] = useState("idle"); // idle | processing | preview | error
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [resumeHTML, setResumeHTML] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const editorRef = useRef(null);
  const progressTimerRef = useRef(null);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const statusMessages = [
    "Preparing your data...",
    "Exporting documents from database...",
    "Extracting text from PDFs...",
    "Sending data to Gemini AI...",
    "Generating database queries...",
    "Populating database...",
    "Fetching final data...",
    "Generating optimized resume...",
    "Finalizing resume...",
  ];

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // ===================== GENERATE RESUME =====================
  const handleGenerateResume = async () => {
    setStatus("processing");
    setProgress(0);

    let step = 0;

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 95));
      setMessage(statusMessages[step] || "Processing...");
      step++;
    }, 1800);

    try {
      // Save education
      if (educationData?.length) {
        await axios.post(`${BACKEND_URL}/api/education`, {
          user_id: userId,
          education: educationData,
        });
      }

      // Save job description
      if (jobDescription?.trim()) {
        await axios.post(`${BACKEND_URL}/api/job-description`, {
          user_id: userId,
          description: jobDescription,
        });
      }

      // Main processing
      const res = await axios.post(`${BACKEND_URL}/api/upload/process`, {
        user_id: userId,
      });

      if (!res?.data?.resume?.html) {
        throw new Error("Resume HTML not returned");
      }

      clearInterval(progressTimerRef.current);
      setProgress(100);
      setMessage("Resume generated successfully!");

      setResumeHTML(res.data.resume.html);
      setTimeout(() => setStatus("preview"), 600);
    } catch (err) {
      console.error(err);
      clearInterval(progressTimerRef.current);
      setStatus("error");
      setMessage("Failed to generate resume");
    }
  };

  // ===================== DOWNLOAD PDF =====================
  const handleDownloadPDF = async () => {
    try {
      const html = editorRef.current?.innerHTML || resumeHTML;

      const res = await axios.post(
        `${BACKEND_URL}/api/export-pdf`,
        { html },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed", err);
      alert("Failed to download PDF");
    }
  };

  // ===================== FORMATTING COMMANDS =====================
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const formatButtons = [
    { icon: Undo, command: "undo", tooltip: "Undo" },
    { icon: Redo, command: "redo", tooltip: "Redo" },
    { icon: Bold, command: "bold", tooltip: "Bold" },
    { icon: Italic, command: "italic", tooltip: "Italic" },
    { icon: Underline, command: "underline", tooltip: "Underline" },
    { icon: AlignLeft, command: "justifyLeft", tooltip: "Align Left" },
    { icon: AlignCenter, command: "justifyCenter", tooltip: "Align Center" },
    { icon: AlignRight, command: "justifyRight", tooltip: "Align Right" },
    { icon: List, command: "insertUnorderedList", tooltip: "Bullet List" },
    {
      icon: ListOrdered,
      command: "insertOrderedList",
      tooltip: "Numbered List",
    },
  ];

  // ===================== UI =====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-6">
      <div className="max-w-5xl mx-auto bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl shadow-2xl p-10 border border-white/10 backdrop-blur-sm">
        {/* ================= IDLE ================= */}
        {status === "idle" && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <Wand2 className="w-12 h-12 text-white" />
            </div>

            <h2 className="text-4xl font-extrabold text-white mb-4">
              Ready to Generate Your Resume
            </h2>
            <p className="text-gray-400 mb-8 text-lg">
              AI will generate a professional, ATS-friendly resume.
            </p>

            <button
              onClick={handleGenerateResume}
              className="px-12 py-5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all hover:scale-105 inline-flex items-center gap-3 shadow-lg shadow-blue-600/50"
            >
              <Sparkles className="w-6 h-6" />
              Generate Resume
            </button>

            <button
              onClick={onBack}
              className="mt-6 flex items-center gap-2 mx-auto text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        )}

        {/* ================= PROCESSING ================= */}
        {status === "processing" && (
          <div className="text-center">
            <Sparkles className="w-16 h-16 mx-auto text-blue-400 animate-pulse mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Generating Resume
            </h2>
            <p className="text-gray-400 mb-6 text-lg">{message}</p>

            <div className="w-full bg-white/10 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-gray-400 font-semibold">{progress}% complete</p>
          </div>
        )}

        {/* ================= PREVIEW + EDITOR ================= */}
        {status === "preview" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setStatus("idle")}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Regenerate
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing((v) => !v)}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? "Done Editing" : "Edit"}
                </button>

                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>

            {/* ================= FORMATTING TOOLBAR ================= */}
            {isEditing && (
              <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm flex items-center gap-2 flex-wrap">
                {formatButtons.map((btn, idx) => (
                  <button
                    key={idx}
                    onClick={() => formatText(btn.command)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                    title={btn.tooltip}
                  >
                    <btn.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            )}

            <div
              ref={editorRef}
              contentEditable={isEditing}
              suppressContentEditableWarning
              spellCheck="true"
              className={`bg-white border rounded-lg shadow-lg p-8 min-h-[600px] outline-none transition-all ${
                isEditing
                  ? "border-blue-400 ring-2 ring-blue-400/50 cursor-text"
                  : "border-gray-300"
              }`}
              style={{
                lineHeight: "1.6",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "14px",
              }}
              dangerouslySetInnerHTML={{ __html: resumeHTML }}
              onInput={(e) => setResumeHTML(e.currentTarget.innerHTML)}
              onFocus={(e) => {
                if (isEditing && !window.getSelection().rangeCount) {
                  const range = document.createRange();
                  range.selectNodeContents(e.currentTarget);
                  range.collapse(false);
                  const selection = window.getSelection();
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                }
              }}
            />
          </>
        )}

        {/* ================= ERROR ================= */}
        {status === "error" && (
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-3xl font-bold text-red-400 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-400 mb-6">{message}</p>

            <button
              onClick={() => setStatus("idle")}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
