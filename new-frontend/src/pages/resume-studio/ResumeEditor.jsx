import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ResumeEditor = ({ resumeData }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("edit");
  const [zoom, setZoom] = useState(100);

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

  const handleSave = () => {
    toast.success("Resume saved successfully!");
  };

  const handleDownload = () => {
    toast.success("Downloading resume as PDF...");
  };

  const handleOptimize = () => {
    toast.success("AI is optimizing your content...");
  };

  const handleRegenerate = () => {
    if (aiPrompt.trim()) {
      toast.success("Regenerating content based on your request...");
      setAiPrompt("");
    } else {
      toast.error("Please enter a prompt for AI regeneration");
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
          <div>
            <h2 className="text-white text-base font-bold leading-tight">
              Software Engineer Resume
            </h2>
            <p className="text-xs text-slate-400">Last edited 2 minutes ago</p>
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E293B] border border-white/10 text-white font-bold text-sm hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          <div
            className="ml-2 w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 ring-2 ring-[#0F172A] cursor-pointer flex items-center justify-center text-white font-bold text-sm"
            title={user?.email}
            onClick={handleLogout}
          >
            {user?.first_name?.charAt(0)}
            {user?.last_name?.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/10 bg-[#0F172A] relative">
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
                  className="w-full bg-transparent text-slate-300 text-sm leading-relaxed resize-none focus:outline-none min-h-[80px]"
                  spellCheck="false"
                  value={editorData.summary}
                  onChange={(e) =>
                    setEditorData({ ...editorData, summary: e.target.value })
                  }
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
                          className="bg-transparent font-bold text-white focus:outline-none w-full mb-1"
                          type="text"
                          value={exp.position}
                          readOnly
                        />
                        <input
                          className="bg-transparent text-sm text-blue-500 focus:outline-none w-full"
                          type="text"
                          value={exp.company}
                          readOnly
                        />
                      </div>
                      <div className="text-right">
                        <input
                          className="bg-transparent text-xs text-slate-400 text-right focus:outline-none w-full"
                          type="text"
                          value={`${exp.startDate} - ${exp.endDate}`}
                          readOnly
                        />
                        <input
                          className="bg-transparent text-xs text-slate-400 text-right focus:outline-none w-full"
                          type="text"
                          value={exp.location}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="mt-3 relative pl-4 border-l-2 border-white/5">
                      <textarea
                        className="w-full bg-transparent text-slate-300 text-sm leading-relaxed resize-none focus:outline-none min-h-[100px]"
                        spellCheck="false"
                        value={exp.description}
                        readOnly
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
                          className="bg-transparent font-bold text-white focus:outline-none w-full mb-1"
                          type="text"
                          value={edu.degree}
                          readOnly
                        />
                        <input
                          className="bg-transparent text-sm text-blue-500 focus:outline-none w-full"
                          type="text"
                          value={edu.institution}
                          readOnly
                        />
                      </div>
                      <div className="text-right">
                        <input
                          className="bg-transparent text-xs text-slate-400 text-right focus:outline-none w-full"
                          type="text"
                          value={edu.year}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                  <div className="relative flex items-center bg-[#1E293B] border border-white/10 rounded-lg overflow-hidden">
                    <input
                      className="w-full bg-transparent border-none text-white placeholder-slate-500 py-3 px-4 focus:ring-0 text-sm"
                      placeholder="e.g. Rewrite the summary to focus more on leadership..."
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleRegenerate();
                      }}
                    />
                    <button className="p-2 mr-1 text-slate-400 hover:text-white transition-colors">
                      <span className="material-symbols-outlined">mic</span>
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRegenerate}
                className="h-[46px] px-6 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">refresh</span>
                Regenerate
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
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] p-8 flex justify-center items-start">
            <div
              className="pdf-page w-[595px] min-h-[842px] p-[40px] text-[11px] leading-[1.4] relative origin-top transform transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {/* PDF Preview Content */}
              <div className="border-b-2 border-gray-800 pb-4 mb-4">
                <h1 className="text-3xl font-serif font-bold text-gray-900 uppercase tracking-widest mb-1">
                  {editorData.name}
                </h1>
                <p className="text-sm text-gray-600 font-sans tracking-wide uppercase">
                  {editorData.title}
                </p>
                <div className="mt-2 text-gray-500 font-sans text-[10px] flex gap-3">
                  <span>{editorData.email}</span> •{" "}
                  <span>{editorData.phone}</span> •{" "}
                  <span>San Francisco, CA</span>
                </div>
              </div>
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-2">
                  Professional Summary
                </h2>
                <p className="text-justify text-gray-700">
                  {editorData.summary}
                </p>
              </div>
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-3">
                  Experience
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
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-3">
                  Education
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
              <div className="mb-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase border-b border-gray-300 pb-1 mb-3">
                  Skills
                </h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                  <div className="flex">
                    <span className="font-bold mr-2 w-24">Languages:</span>{" "}
                    JavaScript, TypeScript, Python, Java
                  </div>
                  <div className="flex">
                    <span className="font-bold mr-2 w-24">Frontend:</span>{" "}
                    React, Vue.js, Tailwind CSS, Next.js
                  </div>
                  <div className="flex">
                    <span className="font-bold mr-2 w-24">Backend:</span>{" "}
                    Node.js, Express, Django, PostgreSQL
                  </div>
                  <div className="flex">
                    <span className="font-bold mr-2 w-24">Tools:</span> Docker,
                    AWS, Git, Jira
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeEditor;
