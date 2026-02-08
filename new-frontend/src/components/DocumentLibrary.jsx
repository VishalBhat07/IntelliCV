import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { uploadAPI } from "../services/api";

const DocumentLibrary = ({ userId, onSelectionChange, refreshTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch documents on mount and when refreshTrigger changes
  useEffect(() => {
    if (userId) {
      fetchDocuments();
    }
  }, [userId, refreshTrigger]);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(Array.from(selectedIds));
  }, [selectedIds, onSelectionChange]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await uploadAPI.listDocuments(userId);
      // Filter out Job Description documents - only show Certificates, Project, Education, Miscellaneous
      const docs = (data.documents || []).filter(
        (doc) => doc.fileType !== "JobDescription" && doc.fileType !== "Job Description"
      );
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      toast.error("Failed to load document library");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (docId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(documents.map((d) => d.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleDelete = async (doc) => {
    try {
      await uploadAPI.deleteDocument(doc.id, userId);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
      toast.success(`Deleted ${doc.fileName}`);
    } catch (err) {
      console.error("Failed to delete document:", err);
      toast.error("Failed to delete document");
    }
    setDeleteConfirm(null);
  };

  const openPreview = (doc) => {
    const url = uploadAPI.getDocumentUrl(doc.mongoFileId);
    window.open(url, "_blank");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSize = (bytes) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Certificates":
        return { icon: "workspace_premium", color: "text-amber-500" };
      case "Project":
        return { icon: "folder_open", color: "text-blue-500" };
      case "Education":
        return { icon: "school", color: "text-purple-500" };
      default:
        return { icon: "description", color: "text-green-500" };
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 px-3 py-4 rounded-l-xl transition-all duration-300 ${
          isOpen
            ? "bg-slate-700 text-white"
            : "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
        }`}
        title="Document Library"
      >
        <span className="material-symbols-outlined text-xl">
          {isOpen ? "chevron_right" : "folder_open"}
        </span>
        {!isOpen && (
          <span className="text-xs font-bold uppercase tracking-wide hidden md:inline">
            Library
          </span>
        )}
      </button>

      {/* Sidebar Panel - Reduced height, centered */}
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 h-[70vh] max-h-[600px] w-80 md:w-96 bg-[#1E293B] border border-white/10 rounded-l-2xl shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1E293B] border-b border-white/10 p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">
                folder_open
              </span>
              Document Library
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAll}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              Clear
            </button>
            <span className="ml-auto text-slate-400">
              {selectedIds.size} selected
            </span>
          </div>
        </div>

        {/* Document List */}
        <div className="overflow-y-auto h-[calc(100%-130px)] p-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-3xl animate-spin">
                progress_activity
              </span>
              <p className="mt-2 text-sm">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2">
                folder_off
              </span>
              <p className="text-sm">No documents uploaded yet</p>
            </div>
          ) : (
            documents.map((doc) => {
              const { icon, color } = getTypeIcon(doc.fileType);
              const isSelected = selectedIds.has(doc.id);

              return (
                <div
                  key={doc.id}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                  }`}
                  onClick={() => toggleSelection(doc.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-blue-500 border-blue-500"
                          : "border-slate-500"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-white text-sm">
                          check
                        </span>
                      )}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 ${color}`}
                    >
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {doc.fileType} • {formatSize(doc.fileSize)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDate(doc.uploadDate)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreview(doc);
                        }}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-colors"
                        title="Preview"
                      >
                        <span className="material-symbols-outlined text-lg">
                          visibility
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(doc);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 bg-[#1E293B]">
          <p className="text-xs text-slate-400 text-center">
            Selected documents will be used for resume generation
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500">
                  delete
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">Delete Document</h3>
            </div>
            <p className="text-slate-300 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-white">
                {deleteConfirm.fileName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentLibrary;
