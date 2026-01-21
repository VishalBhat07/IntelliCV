import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { resumeAPI } from "../../services/api";

const ResumeEditor = ({ resumeData, resumeId: existingResumeId }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("edit");
  const [zoom, setZoom] = useState(100);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState(
    existingResumeId || null,
  );
  
  // State for undo functionality and change highlighting
  const [originalResume, setOriginalResume] = useState(null);
  const [canUndo, setCanUndo] = useState(false);
  const [changedFields, setChangedFields] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Resume title state (separate from personal info title)
  const [resumeTitle, setResumeTitle] = useState("Untitled Resume");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Sample resume data - will be replaced with actual generated data
  const [editorData, setEditorData] = useState({
    name: "Alex Morgan",
    title: "Senior Software Engineer",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 123-4567",
    summary:
      "Experienced Software Engineer with over 6 years in full-stack development. Proven track record of designing scalable architecture and optimizing performance for high-traffic applications. Skilled in React, Node.js, and Cloud Infrastructure.",
    experience: [
      {
        id: 1,
        position: "Senior Developer",
        company: "TechFlow Inc.",
        startDate: "2021",
        endDate: "Present",
        location: "San Francisco, CA",
        description:
          "• Led a team of 5 developers in redesigning the core product architecture, resulting in a 40% reduction in server costs.\n• Implemented CI/CD pipelines reducing deployment time by 60%.\n• Collaborated with product managers to define roadmap and feature specifications.",
      },
      {
        id: 2,
        position: "Software Engineer",
        company: "StartUp Rocket",
        startDate: "2018",
        endDate: "2021",
        location: "New York, NY",
        description:
          "• Developed and maintained client-facing web applications using React and Redux.\n• Optimized database queries improving application response time by 200ms.",
      },
    ],
    education: [
      {
        id: 1,
        degree: "Master of Computer Science",
        institution: "Stanford University",
        year: "2018",
      },
    ],
  });

  const [aiPrompt, setAiPrompt] = useState("");

  // Update currentResumeId when existingResumeId prop changes
  useEffect(() => {
    if (existingResumeId) {
      setCurrentResumeId(existingResumeId);
    }
  }, [existingResumeId]);

  // Load resume data when component mounts or resumeData changes
  useEffect(() => {
    if (resumeData) {
      console.log("Loading resume data:", resumeData);
      const newEditorData = {
        name: resumeData.personal_info?.name || "Your Name",
        title: resumeData.personal_info?.title || "Your Title",
        email: resumeData.personal_info?.email || "",
        phone: resumeData.personal_info?.phone || "",
        location: resumeData.personal_info?.location || "",
        summary: resumeData.summary || "",
        experience: resumeData.experience || [],
        education: resumeData.education || [],
        skills: resumeData.skills || { technical: [], tools: [], soft: [] },
        projects: resumeData.projects || [],
        certifications: resumeData.certifications || [],
      };
      
      // Update editorData with actual resume data
      setEditorData(newEditorData);
      
      // Set resume title (for dashboard display)
      if (resumeData.title) {
        setResumeTitle(resumeData.title);
      } else {
        // Default title from personal info
        setResumeTitle(`${newEditorData.name} - ${newEditorData.title}`);
      }
      
      // Store original resume in localStorage for undo functionality
      // Only store if not already stored (first load)
      const storedOriginal = localStorage.getItem(`originalResume_${user?.user_id}`);
      if (!storedOriginal) {
        localStorage.setItem(`originalResume_${user?.user_id}`, JSON.stringify(newEditorData));
        setOriginalResume(newEditorData);
        console.log("📦 Original resume stored in localStorage for undo functionality");
      } else {
        setOriginalResume(JSON.parse(storedOriginal));
        // Check if we can undo (if there was a previous regeneration)
        const hasUndoData = localStorage.getItem(`canUndo_${user?.user_id}`);
        if (hasUndoData === 'true') {
          setCanUndo(true);
        }
      }
      
      // Clear changed fields when loading fresh data
      setChangedFields({});
    }
  }, [resumeData, user?.user_id]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Prepare resume data to save
      const resumeToSave = {
        user_id: user?.user_id,
        resume_id: currentResumeId, // Will be null for new resumes
        title: resumeTitle, // Use the editable resume title
        target: editorData.title,
        personal_info: {
          name: editorData.name,
          title: editorData.title,
          email: editorData.email,
          phone: editorData.phone,
          location: editorData.location,
        },
        summary: editorData.summary,
        experience: editorData.experience,
        education: editorData.education,
        skills: editorData.skills,
        projects: editorData.projects,
        certifications: editorData.certifications,
      };

      const response = await resumeAPI.save(resumeToSave);

      // Update the resume ID if this was a new save
      if (response.resume?.resume_id && !currentResumeId) {
        setCurrentResumeId(response.resume.resume_id);
      }

      // Clear unsaved changes flag
      setHasUnsavedChanges(false);
      
      // Update the original resume to be the current saved state
      // This makes the saved version the new "original" for undo purposes
      const currentData = { ...editorData };
      localStorage.setItem(`originalResume_${user?.user_id}`, JSON.stringify(currentData));
      setOriginalResume(currentData);
      setCanUndo(false);
      localStorage.setItem(`canUndo_${user?.user_id}`, 'false');

      toast.success("Resume saved successfully!");
    } catch (error) {
      console.error("Failed to save resume:", error);
      toast.error("Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });

      // Generate HTML from current editor data
      const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:800px;margin:0 auto;padding:20px}
h1{color:#2563eb;margin-bottom:5px;font-size:28px}
h2{color:#1e40af;border-bottom:2px solid #2563eb;padding-bottom:5px;margin-top:20px;font-size:18px}
.contact{color:#666;margin-bottom:20px;font-size:14px}
.item{margin-bottom:15px}
.item-header{font-weight:bold;color:#1e40af;font-size:16px}
.item-subheader{color:#666;font-size:14px;margin-top:2px}
</style></head><body>
<h1>${editorData.name || "Your Name"}</h1>
<div class="contact">
${editorData.title ? `<div><strong>${editorData.title}</strong></div>` : ""}
${editorData.email ? `<div>Email: ${editorData.email}</div>` : ""}
${editorData.phone ? `<div>Phone: ${editorData.phone}</div>` : ""}
</div>
${editorData.summary ? `<h2>Summary</h2><p>${editorData.summary}</p>` : ""}
${editorData.experience?.length > 0 ? `<h2>Experience</h2>${editorData.experience.map((e) => `<div class="item"><div class="item-header">${e.position} at ${e.company}</div><div class="item-subheader">${e.startDate} - ${e.endDate}</div><div>${e.description}</div></div>`).join("")}` : ""}
${editorData.education?.length > 0 ? `<h2>Education</h2>${editorData.education.map((e) => `<div class="item"><div class="item-header">${e.degree}</div><div class="item-subheader">${e.institution} | ${e.year}</div></div>`).join("")}` : ""}
${editorData.skills?.technical?.length > 0 || editorData.skills?.tools?.length > 0 ? `<h2>Skills</h2>${editorData.skills.technical?.length > 0 ? `<div><strong>Technical:</strong> ${editorData.skills.technical.join(", ")}</div>` : ""}${editorData.skills.tools?.length > 0 ? `<div><strong>Tools:</strong> ${editorData.skills.tools.join(", ")}</div>` : ""}` : ""}
</body></html>`;

      const blob = await resumeAPI.exportPdf(htmlContent, `Resume.pdf`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${editorData.name || "Resume"}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded!", { id: "pdf-download" });
    } catch (err) {
      console.error("PDF download failed:", err);
      toast.error(
        "Failed to download PDF: " + (err.message || "Unknown error"),
        { id: "pdf-download" },
      );
    }
  };

  const handleOptimize = () => {
    toast.success("AI is optimizing your content...");
  };

  // Helper function to detect changed fields between old and new data
  const detectChanges = (oldData, newData) => {
    const changes = {};
    
    // Check simple string fields
    if (oldData.name !== newData.name) changes.name = true;
    if (oldData.title !== newData.title) changes.title = true;
    if (oldData.email !== newData.email) changes.email = true;
    if (oldData.phone !== newData.phone) changes.phone = true;
    if (oldData.location !== newData.location) changes.location = true;
    if (oldData.summary !== newData.summary) changes.summary = true;
    
    // Check arrays by comparing JSON strings
    if (JSON.stringify(oldData.experience) !== JSON.stringify(newData.experience)) {
      changes.experience = true;
    }
    if (JSON.stringify(oldData.education) !== JSON.stringify(newData.education)) {
      changes.education = true;
    }
    if (JSON.stringify(oldData.skills) !== JSON.stringify(newData.skills)) {
      changes.skills = true;
    }
    if (JSON.stringify(oldData.projects) !== JSON.stringify(newData.projects)) {
      changes.projects = true;
    }
    if (JSON.stringify(oldData.certifications) !== JSON.stringify(newData.certifications)) {
      changes.certifications = true;
    }
    
    return changes;
  };

  // Handle undo - restore original resume
  const handleUndo = () => {
    if (!originalResume) {
      toast.error("No original resume available to restore");
      return;
    }
    
    setEditorData(originalResume);
    setChangedFields({});
    setCanUndo(false);
    localStorage.setItem(`canUndo_${user?.user_id}`, 'false');
    toast.success("Original resume restored!");
  };

  const handleRegenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for AI regeneration");
      return;
    }

    if (!user?.user_id) {
      toast.error("User not found. Please log in again.");
      return;
    }

    try {
      setIsRegenerating(true);
      toast.loading("AI is regenerating your resume...", { id: "regenerate" });

      // Store current data for undo before regenerating
      const currentDataForUndo = { ...editorData };
      
      // If this is the first regeneration, store the original
      if (!originalResume) {
        localStorage.setItem(`originalResume_${user.user_id}`, JSON.stringify(currentDataForUndo));
        setOriginalResume(currentDataForUndo);
        console.log("📦 Storing original resume for undo functionality");
      }

      // Prepare the current resume data to send to the API
      const currentResumeData = {
        personal_info: {
          name: editorData.name,
          title: editorData.title,
          email: editorData.email,
          phone: editorData.phone,
          location: editorData.location,
        },
        summary: editorData.summary,
        experience: editorData.experience,
        education: editorData.education,
        skills: editorData.skills,
        projects: editorData.projects,
        certifications: editorData.certifications,
      };

      // Call the regenerate API
      const response = await resumeAPI.regenerate(
        user.user_id,
        currentResumeId,
        currentResumeData,
        aiPrompt.trim(),
      );

      // Update the editor with the regenerated resume data
      if (response.resume) {
        const newEditorData = {
          name: response.resume.personal_info?.name || editorData.name,
          title: response.resume.personal_info?.title || editorData.title,
          email: response.resume.personal_info?.email || editorData.email,
          phone: response.resume.personal_info?.phone || editorData.phone,
          location:
            response.resume.personal_info?.location || editorData.location,
          summary: response.resume.summary || editorData.summary,
          experience: response.resume.experience || editorData.experience,
          education: response.resume.education || editorData.education,
          skills: response.resume.skills || editorData.skills,
          projects: response.resume.projects || editorData.projects,
          certifications:
            response.resume.certifications || editorData.certifications,
        };
        
        // Detect which fields changed
        const changes = detectChanges(currentDataForUndo, newEditorData);
        setChangedFields(changes);
        console.log("🔍 Changed fields:", Object.keys(changes));
        
        // Update editor data
        setEditorData(newEditorData);
        
        // Enable undo functionality
        setCanUndo(true);
        localStorage.setItem(`canUndo_${user.user_id}`, 'true');

        // Update the resume ID if a new one was created
        if (response.resume_id) {
          setCurrentResumeId(response.resume_id);
        }

        // Mark that we have unsaved changes (regeneration is just a preview)
        setHasUnsavedChanges(true);
        
        toast.success("Resume regenerated! Click Save to keep changes.", { id: "regenerate", duration: 5000 });
        setAiPrompt("");
        
        // Clear highlights after 10 seconds
        setTimeout(() => {
          setChangedFields({});
        }, 10000);
      }
    } catch (error) {
      console.error("Failed to regenerate resume:", error);
      toast.error(
        error.response?.data?.msg ||
          error.message ||
          "Failed to regenerate resume",
        { id: "regenerate" },
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  return (
    <div className="h-screen flex flex-col bg-[#0F172A]">
      {/* Header */}
      <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-white/10 bg-[#0F172A] px-4 sm:px-6 py-3 z-50">
        <div className="flex items-center gap-4 text-white">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 group"
            title="Back to Dashboard"
          >
            <span className="material-symbols-outlined text-slate-400 group-hover:text-white transition-colors">
              arrow_back
            </span>
          </Link>
          <div className="h-6 w-px bg-white/10"></div>
          <div className="w-8 h-8 flex items-center justify-center text-blue-500">
            <span className="material-symbols-outlined text-3xl">resume</span>
          </div>
          <div className="flex flex-col">
            {isEditingTitle ? (
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                    setHasUnsavedChanges(true);
                  }
                  if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                  }
                }}
                className="text-white text-base font-bold leading-tight bg-transparent border-b border-blue-500 focus:outline-none px-0 py-0.5 w-64"
                autoFocus
                placeholder="Enter resume title..."
              />
            ) : (
              <h2 
                onClick={() => setIsEditingTitle(true)}
                className="text-white text-base font-bold leading-tight cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-2 group"
                title="Click to edit title"
              >
                {resumeTitle}
                <span className="material-symbols-outlined text-sm text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  edit
                </span>
              </h2>
            )}
            <p className="text-xs text-slate-400">
              {hasUnsavedChanges ? (
                <span className="text-amber-400">Unsaved changes</span>
              ) : (
                "Click title to edit"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1E293B] rounded-lg p-1 border border-white/5 mr-4">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                activeTab === "edit"
                  ? "bg-blue-500/10 text-blue-500"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab("design")}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeTab === "design"
                  ? "bg-blue-500/10 text-blue-500"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Design
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              hasUnsavedChanges 
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse shadow-lg shadow-amber-500/30' 
                : 'bg-[#1E293B] border border-white/10 text-white hover:bg-white/5'
            }`}
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">
                  progress_activity
                </span>
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                <span className="hidden sm:inline">{hasUnsavedChanges ? 'Save Changes' : 'Save'}</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          <div
            className="ml-2 w-9 h-9 rounded-full bg-slate-700 cursor-pointer flex items-center justify-center text-white font-bold text-sm"
            title={user?.email}
            onClick={handleLogout}
          >
            {user?.first_name?.charAt(0)}
            {user?.last_name?.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Regeneration Overlay - blocks interaction during regeneration */}
        {isRegenerating && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-6 bg-[#1E293B] p-8 rounded-2xl border border-white/10 shadow-2xl">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-emerald-500">auto_awesome</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-white text-xl font-bold mb-2">AI is Regenerating Your Resume</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Analyzing your feedback and improving the content. This may take a few seconds...
                </p>
              </div>
              <div className="flex items-center gap-2 text-emerald-500 text-sm">
                <span className="material-symbols-outlined text-lg animate-pulse">tips_and_updates</span>
                <span>Please wait while the magic happens</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Editor Panel */}
        <div className={`flex-1 flex flex-col min-w-0 border-r border-white/10 bg-[#0F172A] relative ${isRegenerating ? 'pointer-events-none' : ''}`}>
          {/* Toolbar */}
          <div className="flex-none px-6 py-3 border-b border-white/5 bg-[#1E293B]/50 flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded hover:bg-white/10 text-white transition-colors"
                title="Bold"
              >
                <span className="material-symbols-outlined text-xl">
                  format_bold
                </span>
              </button>
              <button
                className="p-1.5 rounded hover:bg-white/10 text-white transition-colors"
                title="Italic"
              >
                <span className="material-symbols-outlined text-xl">
                  format_italic
                </span>
              </button>
              <button
                className="p-1.5 rounded hover:bg-white/10 text-white transition-colors"
                title="Underline"
              >
                <span className="material-symbols-outlined text-xl">
                  format_underlined
                </span>
              </button>
              <div className="h-5 w-px bg-white/10 mx-1"></div>
              <button
                className="p-1.5 rounded hover:bg-white/10 text-white transition-colors"
                title="Bullet List"
              >
                <span className="material-symbols-outlined text-xl">
                  format_list_bulleted
                </span>
              </button>
              <button
                className="p-1.5 rounded hover:bg-white/10 text-white transition-colors"
                title="Numbered List"
              >
                <span className="material-symbols-outlined text-xl">
                  format_list_numbered
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  check_circle
                </span>
                All changes saved
              </span>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-32">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Personal Details */}
              <div className="group relative rounded-xl border border-white/5 bg-[#1E293B]/40 hover:border-blue-500/30 transition-all p-5">
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700">
                    <span className="material-symbols-outlined text-lg">
                      edit
                    </span>
                  </button>
                </div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    className="bg-transparent border-b border-white/10 pb-2 text-xl font-bold text-white focus:outline-none focus:border-blue-500 w-full"
                    type="text"
                    value={editorData.name}
                    onChange={(e) =>
                      setEditorData({ ...editorData, name: e.target.value })
                    }
                  />
                  <input
                    className="bg-transparent border-b border-white/10 pb-2 text-lg text-slate-300 focus:outline-none focus:border-blue-500 w-full"
                    type="text"
                    value={editorData.title}
                    onChange={(e) =>
                      setEditorData({ ...editorData, title: e.target.value })
                    }
                  />
                  <input
                    className="bg-transparent border-b border-white/10 pb-2 text-sm text-slate-400 focus:outline-none focus:border-blue-500 w-full"
                    type="text"
                    value={editorData.email}
                    onChange={(e) =>
                      setEditorData({ ...editorData, email: e.target.value })
                    }
                  />
                  <input
                    className="bg-transparent border-b border-white/10 pb-2 text-sm text-slate-400 focus:outline-none focus:border-blue-500 w-full"
                    type="text"
                    value={editorData.phone}
                    onChange={(e) =>
                      setEditorData({ ...editorData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Professional Summary */}
              <div className="group relative rounded-xl border border-white/5 bg-[#1E293B]/40 hover:border-blue-500/30 transition-all p-5">
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={handleOptimize}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500/20"
                  >
                    <span className="material-symbols-outlined text-sm">
                      auto_awesome
                    </span>{" "}
                    Optimize
                  </button>
                </div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Professional Summary
                </h3>
                <textarea
                  className="w-full bg-transparent text-slate-300 text-sm leading-relaxed resize-none overflow-hidden focus:outline-none"
                  spellCheck="false"
                  value={editorData.summary}
                  onChange={(e) =>
                    setEditorData({ ...editorData, summary: e.target.value })
                  }
                  style={{ overflow: "hidden" }}
                  ref={(el) => {
                    if (el) {
                      el.style.height = "auto";
                      el.style.height = el.scrollHeight + "px";
                    }
                  }}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
              </div>

              {/* Work Experience */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Work Experience
                  </h3>
                  <button className="text-blue-500 text-xs font-bold hover:text-blue-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      add
                    </span>{" "}
                    Add Position
                  </button>
                </div>
                {editorData.experience.map((exp, index) => (
                  <div
                    key={exp.id}
                    className={`group relative rounded-xl border border-white/5 bg-[#1E293B]/40 hover:border-blue-500/30 transition-all p-5 ${
                      index > 0 ? "opacity-80 hover:opacity-100" : ""
                    }`}
                  >
                    {index === 0 && (
                      <div className="absolute -left-3 top-6 w-1 h-8 bg-blue-500 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                    <div className="grid grid-cols-[1fr_auto] gap-4 mb-2">
                      <div>
                        <input
                          className="bg-transparent font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full mb-1"
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const newExp = [...editorData.experience];
                            newExp[index] = {
                              ...newExp[index],
                              position: e.target.value,
                            };
                            setEditorData({
                              ...editorData,
                              experience: newExp,
                            });
                          }}
                        />
                        <input
                          className="bg-transparent text-sm text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full"
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...editorData.experience];
                            newExp[index] = {
                              ...newExp[index],
                              company: e.target.value,
                            };
                            setEditorData({
                              ...editorData,
                              experience: newExp,
                            });
                          }}
                        />
                      </div>
                      <div className="text-right">
                        <input
                          className="bg-transparent text-xs text-slate-400 text-right focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full"
                          type="text"
                          placeholder="Start - End"
                          value={`${exp.startDate} - ${exp.endDate}`}
                          onChange={(e) => {
                            const dates = e.target.value.split(" - ");
                            const newExp = [...editorData.experience];
                            newExp[index] = {
                              ...newExp[index],
                              startDate: dates[0] || "",
                              endDate: dates[1] || "",
                            };
                            setEditorData({
                              ...editorData,
                              experience: newExp,
                            });
                          }}
                        />
                        <input
                          className="bg-transparent text-xs text-slate-400 text-right focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full"
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const newExp = [...editorData.experience];
                            newExp[index] = {
                              ...newExp[index],
                              location: e.target.value,
                            };
                            setEditorData({
                              ...editorData,
                              experience: newExp,
                            });
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-3 relative pl-4 border-l-2 border-white/5">
                      <textarea
                        className="w-full bg-transparent text-slate-300 text-sm leading-relaxed resize-none overflow-visible focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
                        spellCheck="false"
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...editorData.experience];
                          newExp[index] = {
                            ...newExp[index],
                            description: e.target.value,
                          };
                          setEditorData({ ...editorData, experience: newExp });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Education
                  </h3>
                  <button className="text-blue-500 text-xs font-bold hover:text-blue-400 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      add
                    </span>{" "}
                    Add Education
                  </button>
                </div>
                {editorData.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="group relative rounded-xl border border-white/5 bg-[#1E293B]/40 hover:border-blue-500/30 transition-all p-5"
                  >
                    <div className="grid grid-cols-[1fr_auto] gap-4">
                      <div>
                        <input
                          className="bg-transparent font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full mb-1"
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...editorData.education];
                            newEdu[index] = {
                              ...newEdu[index],
                              degree: e.target.value,
                            };
                            setEditorData({ ...editorData, education: newEdu });
                          }}
                        />
                        <input
                          className="bg-transparent text-sm text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full"
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const newEdu = [...editorData.education];
                            newEdu[index] = {
                              ...newEdu[index],
                              institution: e.target.value,
                            };
                            setEditorData({ ...editorData, education: newEdu });
                          }}
                        />
                      </div>
                      <div className="text-right">
                        <input
                          className="bg-transparent text-xs text-slate-400 text-right focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full"
                          type="text"
                          value={edu.year}
                          onChange={(e) => {
                            const newEdu = [...editorData.education];
                            newEdu[index] = {
                              ...newEdu[index],
                              year: e.target.value,
                            };
                            setEditorData({ ...editorData, education: newEdu });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              {editorData.skills &&
                (editorData.skills.technical?.length > 0 ||
                  editorData.skills.tools?.length > 0 ||
                  editorData.skills.soft?.length > 0) && (
                  <div className="space-y-4">
                    <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Skills
                    </h3>
                    <div className="rounded-xl border border-white/5 bg-[#1E293B]/40 p-5 space-y-3">
                      {editorData.skills.technical?.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">
                            Technical Skills
                          </div>
                          <input
                            className="w-full bg-transparent text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
                            type="text"
                            value={editorData.skills.technical.join(", ")}
                            onChange={(e) => {
                              const newSkills = {
                                ...editorData.skills,
                                technical: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              };
                              setEditorData({
                                ...editorData,
                                skills: newSkills,
                              });
                            }}
                            placeholder="e.g., JavaScript, Python, React"
                          />
                        </div>
                      )}
                      {editorData.skills.tools?.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">
                            Tools & Technologies
                          </div>
                          <input
                            className="w-full bg-transparent text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
                            type="text"
                            value={editorData.skills.tools.join(", ")}
                            onChange={(e) => {
                              const newSkills = {
                                ...editorData.skills,
                                tools: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              };
                              setEditorData({
                                ...editorData,
                                skills: newSkills,
                              });
                            }}
                            placeholder="e.g., Git, Docker, AWS"
                          />
                        </div>
                      )}
                      {editorData.skills.soft?.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">
                            Soft Skills
                          </div>
                          <input
                            className="w-full bg-transparent text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1"
                            type="text"
                            value={editorData.skills.soft.join(", ")}
                            onChange={(e) => {
                              const newSkills = {
                                ...editorData.skills,
                                soft: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              };
                              setEditorData({
                                ...editorData,
                                skills: newSkills,
                              });
                            }}
                            placeholder="e.g., Leadership, Communication"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Projects */}
              {editorData.projects?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Projects
                  </h3>
                  {editorData.projects.map((project, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/5 bg-[#1E293B]/40 p-5"
                    >
                      <input
                        className="font-bold text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full mb-2"
                        type="text"
                        value={project.title}
                        onChange={(e) => {
                          const newProjects = [...editorData.projects];
                          newProjects[idx] = {
                            ...newProjects[idx],
                            title: e.target.value,
                          };
                          setEditorData({
                            ...editorData,
                            projects: newProjects,
                          });
                        }}
                        placeholder="Project Title"
                      />
                      <textarea
                        className="text-slate-300 text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full mb-2 resize-none overflow-visible"
                        value={project.description}
                        style={{ overflow: "hidden" }}
                        ref={(el) => {
                          if (el) {
                            el.style.height = "auto";
                            el.style.height = el.scrollHeight + "px";
                          }
                        }}
                        onInput={(e) => {
                          e.target.style.height = "auto";
                          e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        onChange={(e) => {
                          const newProjects = [...editorData.projects];
                          newProjects[idx] = {
                            ...newProjects[idx],
                            description: e.target.value,
                          };
                          setEditorData({
                            ...editorData,
                            projects: newProjects,
                          });
                        }}
                        placeholder="Project Description"
                      />
                      {project.technologies?.length > 0 && (
                        <input
                          className="text-xs text-blue-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full"
                          type="text"
                          value={project.technologies.join(", ")}
                          onChange={(e) => {
                            const newProjects = [...editorData.projects];
                            newProjects[idx] = {
                              ...newProjects[idx],
                              technologies: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            };
                            setEditorData({
                              ...editorData,
                              projects: newProjects,
                            });
                          }}
                          placeholder="Technologies (comma-separated)"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {editorData.certifications?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Certifications
                  </h3>
                  {editorData.certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-white/5 bg-[#1E293B]/40 p-5"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <input
                          className="font-bold text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 flex-1"
                          type="text"
                          value={cert.title}
                          onChange={(e) => {
                            const newCerts = [...editorData.certifications];
                            newCerts[idx] = {
                              ...newCerts[idx],
                              title: e.target.value,
                            };
                            setEditorData({
                              ...editorData,
                              certifications: newCerts,
                            });
                          }}
                          placeholder="Certification Title"
                        />
                        <input
                          className="text-xs text-slate-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-32"
                          type="text"
                          value={cert.date}
                          onChange={(e) => {
                            const newCerts = [...editorData.certifications];
                            newCerts[idx] = {
                              ...newCerts[idx],
                              date: e.target.value,
                            };
                            setEditorData({
                              ...editorData,
                              certifications: newCerts,
                            });
                          }}
                          placeholder="Date"
                        />
                      </div>
                      <input
                        className="text-sm text-slate-300 mt-1 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 w-full"
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => {
                          const newCerts = [...editorData.certifications];
                          newCerts[idx] = {
                            ...newCerts[idx],
                            issuer: e.target.value,
                          };
                          setEditorData({
                            ...editorData,
                            certifications: newCerts,
                          });
                        }}
                        placeholder="Issuing Organization"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* AI Copilot */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#0F172A]/90 backdrop-blur-xl border-t border-white/10 p-4 z-20">
            <div className="max-w-3xl mx-auto flex gap-3 items-end">
              <div className="flex-1 relative">
                <label className="text-xs text-emerald-500 font-bold mb-1.5 ml-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    auto_awesome
                  </span>
                  AI Copilot
                  {Object.keys(changedFields).length > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold animate-pulse">
                      {Object.keys(changedFields).length} sections updated
                    </span>
                  )}
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                  <div className="relative flex items-center bg-[#1E293B] border border-white/10 rounded-lg overflow-hidden">
                    <input
                      className="w-full bg-transparent border-none text-white placeholder-slate-500 py-3 px-4 focus:ring-0 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="e.g. Rewrite the summary to focus more on leadership..."
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !isRegenerating) handleRegenerate();
                      }}
                      disabled={isRegenerating}
                    />
                    <button className="p-2 mr-1 text-slate-400 hover:text-white transition-colors disabled:opacity-50" disabled={isRegenerating}>
                      <span className="material-symbols-outlined">mic</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* Undo Button - shows when regeneration was done */}
              {canUndo && (
                <button
                  onClick={handleUndo}
                  disabled={isRegenerating}
                  className="h-[46px] px-4 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600"
                  title="Restore original resume"
                >
                  <span className="material-symbols-outlined">undo</span>
                  <span className="hidden sm:inline">Undo</span>
                </button>
              )}
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className={`h-[46px] px-6 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]`}
              >
                <span className={`material-symbols-outlined ${isRegenerating ? 'animate-spin' : ''}`}>
                  {isRegenerating ? 'progress_activity' : 'refresh'}
                </span>
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-[50%] hidden xl:flex flex-col bg-slate-900 border-l border-white/10 relative">
          <div className="flex-none p-4 flex items-center justify-between bg-slate-900/50 backdrop-blur z-10">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                Live Preview
              </span>
              <div className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-slate-400">
                A4 Paper
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-lg">
                  zoom_out
                </span>
              </button>
              <span className="text-xs text-slate-300 w-10 text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-lg">
                  zoom_in
                </span>
              </button>
              <div className="h-4 w-px bg-white/10 mx-1"></div>
              <button className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5">
                <span className="material-symbols-outlined text-lg">
                  fullscreen
                </span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white p-8 flex justify-center items-start">
            <div
              className="pdf-page w-[595px] min-h-[842px] p-[40px] text-[11px] leading-[1.4] relative origin-top transform transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* PDF Preview Content */}
              <div className={`border-b-2 border-gray-800 pb-4 mb-4 transition-all duration-500 ${(changedFields.name || changedFields.title || changedFields.email || changedFields.phone) ? 'bg-amber-100 ring-2 ring-amber-400 rounded-lg p-3 -m-3' : ''}`}>
                <h1 className={`text-3xl font-serif font-bold text-gray-900 uppercase tracking-widest mb-1 ${changedFields.name ? 'text-amber-700' : ''}`}>
                  {editorData.name}
                </h1>
                <p className={`text-sm text-gray-600 font-sans tracking-wide uppercase ${changedFields.title ? 'text-amber-700' : ''}`}>
                  {editorData.title}
                </p>
                <div className="mt-2 text-gray-500 font-sans text-[10px] flex gap-3">
                  <span className={changedFields.email ? 'text-amber-700 font-bold' : ''}>{editorData.email}</span> •{" "}
                  <span className={changedFields.phone ? 'text-amber-700 font-bold' : ''}>{editorData.phone}</span> •{" "}
                  <span>San Francisco, CA</span>
                </div>
              </div>
              <div className={`mb-4 transition-all duration-500 ${changedFields.summary ? 'bg-amber-100 ring-2 ring-amber-400 rounded-lg p-3 -m-1' : ''}`}>
                <h2 className={`text-sm font-bold uppercase border-b pb-1 mb-2 ${changedFields.summary ? 'text-amber-700 border-amber-400' : 'text-gray-800 border-gray-300'}`}>
                  Professional Summary {changedFields.summary && <span className="text-[10px] font-normal text-amber-600 ml-2">✨ Updated</span>}
                </h2>
                <p className="text-justify text-gray-700">
                  {editorData.summary}
                </p>
              </div>
              <div className={`mb-4 transition-all duration-500 ${changedFields.experience ? 'bg-amber-100 ring-2 ring-amber-400 rounded-lg p-3 -m-1' : ''}`}>
                <h2 className={`text-sm font-bold uppercase border-b pb-1 mb-3 ${changedFields.experience ? 'text-amber-700 border-amber-400' : 'text-gray-800 border-gray-300'}`}>
                  Experience {changedFields.experience && <span className="text-[10px] font-normal text-amber-600 ml-2">✨ Updated</span>}
                </h2>
                {editorData.experience.map((exp) => (
                  <div key={exp.id} className="mb-3">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>{exp.company}</span>
                      <span className="font-normal text-gray-600">
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between italic text-gray-700 mb-1">
                      <span>{exp.position}</span>
                      <span className="font-normal text-gray-500 text-[10px]">
                        {exp.location}
                      </span>
                    </div>
                    <div className="text-gray-700 space-y-0.5 text-[10.5px]">
                      {exp.description.split("\n").map((line, idx) => (
                        <p key={idx}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mb-4 transition-all duration-500 ${changedFields.education ? 'bg-amber-100 ring-2 ring-amber-400 rounded-lg p-3 -m-1' : ''}`}>
                <h2 className={`text-sm font-bold uppercase border-b pb-1 mb-3 ${changedFields.education ? 'text-amber-700 border-amber-400' : 'text-gray-800 border-gray-300'}`}>
                  Education {changedFields.education && <span className="text-[10px] font-normal text-amber-600 ml-2">✨ Updated</span>}
                </h2>
                {editorData.education.map((edu) => (
                  <div key={edu.id} className="mb-3">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span>{edu.institution}</span>
                      <span className="font-normal text-gray-600">
                        {edu.year}
                      </span>
                    </div>
                    <div className="italic text-gray-700 mb-1">
                      <span>{edu.degree}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mb-4 transition-all duration-500 ${changedFields.skills ? 'bg-amber-100 ring-2 ring-amber-400 rounded-lg p-3 -m-1' : ''}`}>
                <h2 className={`text-sm font-bold uppercase border-b pb-1 mb-3 ${changedFields.skills ? 'text-amber-700 border-amber-400' : 'text-gray-800 border-gray-300'}`}>
                  Skills {changedFields.skills && <span className="text-[10px] font-normal text-amber-600 ml-2">✨ Updated</span>}
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                  {editorData.skills?.technical?.length > 0 && (
                    <div className="flex">
                      <span className="font-bold mr-2 w-24">Technical:</span>{" "}
                      {editorData.skills.technical.join(", ")}
                    </div>
                  )}
                  {editorData.skills?.tools?.length > 0 && (
                    <div className="flex">
                      <span className="font-bold mr-2 w-24">Tools:</span>{" "}
                      {editorData.skills.tools.join(", ")}
                    </div>
                  )}
                  {editorData.skills?.soft?.length > 0 && (
                    <div className="flex col-span-2">
                      <span className="font-bold mr-2 w-24">Soft Skills:</span>{" "}
                      {editorData.skills.soft.join(", ")}
                    </div>
                  )}
                </div>
              </div>

              {/* Projects Section */}
              {editorData.projects?.length > 0 && (
                <div className={`mb-4 transition-all duration-500 ${changedFields.projects ? 'bg-amber-100 ring-2 ring-amber-400 rounded-lg p-3 -m-1' : ''}`}>
                  <h2 className={`text-sm font-bold uppercase border-b pb-1 mb-3 ${changedFields.projects ? 'text-amber-700 border-amber-400' : 'text-gray-800 border-gray-300'}`}>
                    Projects {changedFields.projects && <span className="text-[10px] font-normal text-amber-600 ml-2">✨ Updated</span>}
                  </h2>
                  {editorData.projects.map((project, idx) => (
                    <div key={idx} className="mb-3">
                      <div className="font-bold text-gray-800">
                        {project.title}
                      </div>
                      <div className="text-gray-700 text-[10.5px] mb-1">
                        {project.description}
                      </div>
                      {project.technologies?.length > 0 && (
                        <div className="text-gray-600 text-[10px] italic">
                          Technologies: {project.technologies.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications Section */}
              {editorData.certifications?.length > 0 && (
                <div className={`mb-4 transition-all duration-500 ${changedFields.certifications ? 'bg-amber-100 ring-2 ring-amber-400 rounded-lg p-3 -m-1' : ''}`}>
                  <h2 className={`text-sm font-bold uppercase border-b pb-1 mb-3 ${changedFields.certifications ? 'text-amber-700 border-amber-400' : 'text-gray-800 border-gray-300'}`}>
                    Certifications {changedFields.certifications && <span className="text-[10px] font-normal text-amber-600 ml-2">✨ Updated</span>}
                  </h2>
                  {editorData.certifications.map((cert, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-800">
                          {cert.title}
                        </span>
                        <span className="text-gray-600 text-[10px]">
                          {cert.date}
                        </span>
                      </div>
                      <div className="text-gray-700 text-[10.5px]">
                        {cert.issuer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeEditor;
