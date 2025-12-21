import React, { useEffect, useRef, useState } from "react";
import {
  Download,
  RefreshCw,
  FileText,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Undo2,
  Redo2,
  Eraser,
} from "lucide-react";

export default function GeneratedResumePage({ resume, onBack, onRestart }) {
  const [downloading, setDownloading] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const editorRef = useRef(null);
  const selectionRef = useRef(null);

  const snapshotSelection = () => {
    const selection = window.getSelection();
    if (
      !selection ||
      selection.rangeCount === 0 ||
      !editorRef.current ||
      !editorRef.current.contains(selection.anchorNode)
    ) {
      return;
    }

    selectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const normalizeListStyles = () => {
    if (!editorRef.current) {
      return;
    }

    editorRef.current.querySelectorAll("ul").forEach((list) => {
      list.classList.add("list-disc", "pl-6", "space-y-1");
    });

    editorRef.current.querySelectorAll("ol").forEach((list) => {
      list.classList.add("list-decimal", "pl-6", "space-y-1");
    });
  };

  const waitForNextFrame = () =>
    new Promise((resolve) => {
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        window.requestAnimationFrame(resolve);
      } else {
        setTimeout(resolve, 0);
      }
    });

  useEffect(() => {
    const initialContent = resume?.htmlContent
      ? resume.htmlContent
      : resume?.text
      ? resume.text.replace(/\n/g, "<br />")
      : "";

    setEditorContent(initialContent);

    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
    snapshotSelection();
    normalizeListStyles();
  }, [resume]);

  useEffect(() => {
    const handleSelectionChange = () => {
      snapshotSelection();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const focusEditor = () => {
    if (editorRef.current) {
      try {
        editorRef.current.focus({ preventScroll: true });
      } catch (err) {
        editorRef.current.focus();
      }
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !selectionRef.current) {
      return;
    }
    selection.removeAllRanges();
    selection.addRange(selectionRef.current);
  };

  const applyFormat = (command, value = null) => {
    if (selectionRef.current) {
      focusEditor();
      restoreSelection();
    } else {
      focusEditor();
    }

    document.execCommand(command, false, value);

    if (editorRef.current) {
      normalizeListStyles();
      setEditorContent(editorRef.current.innerHTML);
      snapshotSelection();
    }
  };

  const handleLink = () => {
    const url = window.prompt("Enter the URL");
    if (url) {
      applyFormat("createLink", url);
    }
  };

  const handleInput = (event) => {
    setEditorContent(event.currentTarget.innerHTML);
    snapshotSelection();
    normalizeListStyles();
  };

  // Generate PDF using html2pdf
  const generatePDF = async () => {
    setDownloading(true);
    setIsExporting(true);
    try {
      await waitForNextFrame();
      const html2pdf = (await import("html2pdf.js")).default;

      // Export the edited resume content
      const element = editorRef.current;
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
      setIsExporting(false);
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
        <div className="max-w-6xl mx-auto ">
          {/* Resume Content Preview */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-12 shadow-inner min-h-[800px]">
            {editorContent ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 p-3 overflow-x-auto flex-nowrap whitespace-nowrap sticky top-0 z-10">
                  <button
                    type="button"
                    onClick={() => applyFormat("undo")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("redo")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <span className="h-6 w-px bg-gray-300" />
                  <button
                    type="button"
                    onClick={() => applyFormat("bold")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("italic")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("underline")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("strikeThrough")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLink}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Add link"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("unlink")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Remove link"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                  <span className="h-6 w-px bg-gray-300" />
                  <button
                    type="button"
                    onClick={() => applyFormat("insertUnorderedList")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Bullet list"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("insertOrderedList")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Numbered list"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <span className="h-6 w-px bg-gray-300" />
                  <button
                    type="button"
                    onClick={() => applyFormat("justifyLeft")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Align left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("justifyCenter")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Align center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("justifyRight")}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-100"
                    title="Align right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg">
                  <div
                    ref={editorRef}
                    className={`resume-content prose prose-sm max-w-none focus:outline-none min-h-[600px] p-6 w-full ${
                      isExporting
                        ? "max-h-none overflow-visible"
                        : "max-h-[600px] overflow-y-auto"
                    }`}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={handleInput}
                    onClick={() => {
                      focusEditor();
                      snapshotSelection();
                    }}
                    onKeyUp={() => {
                      snapshotSelection();
                    }}
                  />
                </div>
              </div>
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
