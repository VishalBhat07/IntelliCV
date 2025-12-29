import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
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
  const editorRef = useRef(null);
  const selectionRef = useRef(null);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

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

  const downloadPDF = async () => {
    if (!editorRef.current) {
      alert("Resume content not found");
      return;
    }

    const html = editorRef.current.innerHTML;
    if (!html || !html.trim()) {
      alert("Resume content is empty");
      return;
    }

    const url = `${BACKEND_URL.replace(/\/$/, "")}/api/export-pdf`;
    const fileName = `IntelliCV_Resume_${Date.now()}.pdf`;

    setDownloading(true);

    try {
      await waitForNextFrame();

      const response = await axios.post(
        url,
        { html, fileName },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 4000);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Your Resume is Ready!
              </h2>
              <p className="text-gray-400">Preview and download your resume</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {downloading ? "Downloading..." : "Download PDF"}
            </button>
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Create New
            </button>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8">
        <div className="max-w-6xl mx-auto ">
          {/* Resume Content Preview */}
          <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-lg p-12 shadow-inner min-h-[800px]">
            {editorContent ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm p-3 overflow-x-auto flex-nowrap whitespace-nowrap sticky top-0 z-10">
                  <button
                    type="button"
                    onClick={() => applyFormat("undo")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("redo")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Redo"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                  <span className="h-6 w-px bg-white/20" />
                  <button
                    type="button"
                    onClick={() => applyFormat("bold")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("italic")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("underline")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Underline"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("strikeThrough")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLink}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Add link"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("unlink")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Remove link"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                  <span className="h-6 w-px bg-white/20" />
                  <button
                    type="button"
                    onClick={() => applyFormat("insertUnorderedList")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Bullet list"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("insertOrderedList")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Numbered list"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <span className="h-6 w-px bg-white/20" />
                  <button
                    type="button"
                    onClick={() => applyFormat("justifyLeft")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Align left"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("justifyCenter")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Align center"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat("justifyRight")}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 text-white"
                    title="Align right"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="border border-white/20 rounded-lg bg-white shadow-lg">
                  <div
                    ref={editorRef}
                    className="resume-content prose prose-sm max-w-none focus:outline-none min-h-[600px] p-6 w-full max-h-[600px] overflow-y-auto text-gray-900"
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
              <div className="text-center text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
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
          className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg font-semibold hover:bg-white/20 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Generation
        </button>
      </div>
    </div>
  );
}
