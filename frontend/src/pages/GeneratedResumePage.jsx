import React, { useState } from "react";
import { Download, RefreshCw, FileText, ArrowLeft } from "lucide-react";

export default function GeneratedResumePage({ resume, onBack, onRestart }) {
  const [downloading, setDownloading] = useState(false);

  // Generate PDF using html2pdf
  const generatePDF = async () => {
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;

      // Get the resume content element
      const element = document.querySelector(".resume-content");
      if (!element) {
        throw new Error("Resume content not found");
      }

      const opt = {
        margin: 10,
        filename: `IntelliCV_Resume_${Date.now()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-indigo-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Resume is Ready!
              </h2>
              <p className="text-gray-600">Preview and download your resume</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generatePDF}
              disabled={downloading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Create New
            </button>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="max-w-4xl mx-auto">
          {/* Resume Content Preview */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12 shadow-inner min-h-[800px]">
            {resume?.htmlContent ? (
              <div
                className="resume-content prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: resume.htmlContent }}
              />
            ) : resume?.text ? (
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                {resume.text}
              </pre>
            ) : (
              <div className="text-center text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>No resume content available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Generation
        </button>
      </div>
    </div>
  );
}
