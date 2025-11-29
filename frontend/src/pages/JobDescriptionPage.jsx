import React, { useMemo, useState } from "react";
import axios from "axios";
import { Briefcase, FileText, CheckCircle } from "lucide-react";

export default function JobDescriptionPage({
  onNext,
  initialText = "",
  onUploadDocument,
  documents = [],
}) {
  const [jdText, setJdText] = useState(initialText);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [exportError, setExportError] = useState("");

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const jobDocuments = useMemo(
    () => documents.filter((doc) => doc.type === "JobDescription"),
    [documents]
  );

  const submit = async () => {
    if (uploading || exporting) return;

    const trimmed = jdText.trim();
    if (!trimmed && !uploadedFileName) return;

    const userId = window.localStorage.getItem("user_id") || "";
    if (!userId) {
      setExportError("No user ID available for export");
      return;
    }

    setExportError("");
    setExportStatus("");
    setExporting(true);

    const exportUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/upload/export`;

    let exportFailed = false;

    try {
      const { data } = await axios.post(exportUrl, { user_id: userId });
      const msg = data?.msg || "Documents exported";
      const dir = data?.baseDir || data?.directory;
      setExportStatus(dir ? `${msg}. Saved to ${dir}` : msg);
    } catch (err) {
      console.error("Failed to export documents", err);
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to export documents";
      setExportError(msg);
      exportFailed = true;
    } finally {
      setExporting(false);
    }

    if (exportFailed) return;

    if (trimmed) {
      onNext(trimmed);
    } else if (uploadedFileName) {
      onNext(`Uploaded file: ${uploadedFileName}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Enter Job Description
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste the job description below
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Paste the complete job description here..."
          />

          <div className="mt-3">
            <label className="text-sm font-medium text-gray-700 mb-1 inline-block">
              Or upload a file
            </label>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer hover:bg-indigo-700">
                Upload file
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const fileList = Array.from(e.target.files || []);
                    if (!fileList.length) return;
                    setUploadError("");
                    setUploadedFileName(
                      fileList.length === 1
                        ? fileList[0].name
                        : `${fileList.length} files selected`
                    );
                    setJdText("");
                    setUploading(true);
                    setProgress(0);

                    const fd = new FormData();
                    const userId =
                      window.localStorage.getItem("user_id") || "1";
                    fd.append("user_id", userId);
                    fd.append("file_type", "JobDescription");
                    fileList.forEach((file) => fd.append("files", file));

                    const url = `${BACKEND_URL.replace(/\/$/, "")}/api/upload`;
                    axios
                      .post(url, fd, {
                        onUploadProgress: (evt) => {
                          if (evt.lengthComputable) {
                            const pct = Math.round(
                              (evt.loaded / evt.total) * 100
                            );
                            setProgress(pct);
                          }
                        },
                      })
                      .then((resp) => {
                        setUploading(false);
                        setProgress(0);
                        const uploaded = (resp.data?.files || []).map(
                          (item) => ({
                            name: item.file_name,
                            type: item.file_type || "JobDescription",
                            size: "-",
                            uploadDate: new Date().toLocaleDateString(),
                          })
                        );
                        const uploadedName = uploaded[0]?.name;
                        if (uploadedName) {
                          setUploadedFileName(uploadedName);
                        }
                        if (onUploadDocument && uploaded.length > 0) {
                          onUploadDocument(uploaded);
                        }
                      })
                      .catch((err) => {
                        console.error("Job description upload failed", err);
                        const msg =
                          err?.response?.data?.msg ||
                          err?.response?.data?.error ||
                          err.message ||
                          "Upload failed";
                        setUploadError(msg);
                        setUploading(false);
                        setProgress(0);
                        setUploadedFileName("");
                      });
                  }}
                />
              </label>
              {uploadedFileName && (
                <div className="text-sm text-gray-600">{uploadedFileName}</div>
              )}
            </div>
            {uploading && (
              <div className="mt-3">
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
            {uploadError && (
              <p className="text-sm text-red-600 mt-2">{uploadError}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Supported: .pdf, .doc, .docx, .txt — text files will be
              auto-loaded when possible.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={submit}
            disabled={
              uploading || exporting || (!jdText.trim() && !uploadedFileName)
            }
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Briefcase className="w-5 h-5" />
            {exporting ? "Preparing..." : "Analyze & Match"}
          </button>
        </div>
        {(exportStatus || exportError) && (
          <div className="text-sm mt-2">
            {exportStatus && <p className="text-green-600">{exportStatus}</p>}
            {exportError && <p className="text-red-600">{exportError}</p>}
          </div>
        )}
      </div>

      {jobDocuments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Uploaded Job Descriptions
          </h3>
          <div className="space-y-3">
            {jobDocuments.map((doc, idx) => (
              <div
                key={`${doc.name}-${idx}`}
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
