import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function GeneratedResumePage({ jobDescription = "" }) {
  const [generating, setGenerating] = useState(false);

  const resumeContent = `
JOHN DOE
Software Engineer | john.doe@email.com | +1-234-567-8900

SUMMARY
Experienced software engineer with 5+ years in full-stack development, specializing in React, Node.js, and cloud technologies.

SKILLS
• Frontend: React, TypeScript, Tailwind CSS
• Backend: Node.js, Python, FastAPI
• Database: MongoDB, MySQL, PostgreSQL
• Cloud: AWS, Docker, Kubernetes

EXPERIENCE
Senior Software Engineer | Tech Corp | 2021 - Present
• Led development of microservices architecture
• Improved application performance by 40%

Software Engineer | StartupXYZ | 2019 - 2021
• Built responsive web applications
• Collaborated with cross-functional teams
  ${
    jobDescription
      ? `

JOB DESCRIPTION
${jobDescription}`
      : ""
  }
  `;

  // Generate PDF using jspdf (lightweight)
  const generatePDF = async (filename = "resume.pdf") => {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const lines = resumeContent.split("\n");
      const margin = 40;
      let y = 40;
      pdf.setFont("Courier");
      pdf.setFontSize(10);
      lines.forEach((line) => {
        if (y > 800) {
          pdf.addPage();
          y = 40;
        }
        pdf.text(line, margin, y);
        y += 12;
      });
      pdf.save(filename);
    } catch (err) {
      console.error(err);
      alert(
        "PDF generation requires the `jspdf` package. Run `npm install jspdf` and try again."
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Generated Resume
          </h2>

          <div className="relative">
            <button  
              disabled={generating}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-300 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border rounded shadow-md z-10">
                <button
                  onClick={() => generatePDF("resume.pdf")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Download as PDF
                </button>
              </div>
              )}
              
            </button>

            {/* {showOptions && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border rounded shadow-md z-10">
                <button
                  onClick={() => generatePDF("resume.pdf")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  Download as PDF
                </button>
              </div>
            )} */}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-lg p-8 shadow-inner">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-slate-100">
            {resumeContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
