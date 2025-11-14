import React, { useState } from "react";
import { Briefcase } from "lucide-react";

export default function JobDescriptionPage({ onNext, initialText = "" }) {
  const [jdText, setJdText] = useState(initialText);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const submit = () => {
    // if user pasted text, use it
    if (jdText.trim()) return onNext(jdText.trim());

    // if a file was uploaded, proceed using filename as reference
    if (uploadedFileName && !jdText.trim()) {
      return onNext(`Uploaded file: ${uploadedFileName}`);
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
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (!f) return;
                    // start simulated upload (same UX as UploadDocuments)
                    setUploadedFileName(f.name);
                    setJdText(""); // do not preview uploaded file
                    setUploading(true);
                    setProgress(0);

                    const interval = setInterval(() => {
                      setProgress((p) => {
                        if (p >= 90) {
                          clearInterval(interval);
                          setTimeout(() => {
                            setUploading(false);
                            setProgress(0);
                          }, 400);
                          return 100;
                        }
                        return p + 10;
                      });
                    }, 150);
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
            <p className="text-xs text-gray-500 mt-2">
              Supported: .pdf, .doc, .docx, .txt — text files will be
              auto-loaded when possible.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={submit}
            disabled={uploading || (!jdText.trim() && !uploadedFileName)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Briefcase className="w-5 h-5" />
            Analyze & Match
          </button>
        </div>
      </div>
    </div>
  );
}
