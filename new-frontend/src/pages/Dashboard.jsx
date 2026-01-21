import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { resumeAPI, authAPI } from "../services/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null); // Track which card's menu is open
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    contact: [],
    profile_summary: "",
    profile_picture: "",
    location: "",
    portfolio: "",
    title: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch user's resumes on mount
  useEffect(() => {
    if (user?.user_id) {
      fetchResumes();
    }
  }, [user?.user_id]);

  // Initialize profile form when modal opens
  useEffect(() => {
    if (showEditProfile && user) {
      setProfileForm({
        first_name: user.first_name || "",
        middle_name: user.middle_name || "",
        last_name: user.last_name || "",
        contact: user.contact || [],
        profile_summary: user.profile_summary || "",
        profile_picture: user.profile_picture || "",
        location: user.location || "",
        portfolio: user.portfolio || "",
        title: user.title || "",
      });
    }
  }, [showEditProfile, user]);

  const fetchResumes = async () => {
    try {
      setLoadingResumes(true);
      const data = await resumeAPI.getAll(user.user_id);
      setResumes(data.resumes || []);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
      toast.error("Failed to load resumes");
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGenerateResume = () => {
    navigate("/resume-studio");
  };

  const handleEditResume = (resumeId) => {
    navigate(`/resume-studio/${resumeId}`);
  };

  const handleDownloadResume = async (resume) => {
    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });

      // Generate HTML from resume data
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
<h1>${resume.personal_info?.name || resume.title || "Resume"}</h1>
<div class="contact">
${resume.personal_info?.title ? `<div><strong>${resume.personal_info.title}</strong></div>` : ""}
${resume.personal_info?.email ? `<div>Email: ${resume.personal_info.email}</div>` : ""}
${resume.personal_info?.phone ? `<div>Phone: ${resume.personal_info.phone}</div>` : ""}
</div>
${resume.summary ? `<h2>Summary</h2><p>${resume.summary}</p>` : ""}
${resume.experience?.length > 0 ? `<h2>Experience</h2>${resume.experience.map((e) => `<div class="item"><div class="item-header">${e.position} at ${e.company}</div><div class="item-subheader">${e.startDate} - ${e.endDate}</div><div>${e.description}</div></div>`).join("")}` : ""}
${resume.education?.length > 0 ? `<h2>Education</h2>${resume.education.map((e) => `<div class="item"><div class="item-header">${e.degree}</div><div class="item-subheader">${e.institution} | ${e.year}</div></div>`).join("")}` : ""}
${resume.skills?.technical?.length > 0 || resume.skills?.tools?.length > 0 ? `<h2>Skills</h2>${resume.skills.technical?.length > 0 ? `<div><strong>Technical:</strong> ${resume.skills.technical.join(", ")}</div>` : ""}${resume.skills.tools?.length > 0 ? `<div><strong>Tools:</strong> ${resume.skills.tools.join(", ")}</div>` : ""}` : ""}
${resume.projects?.length > 0 ? `<h2>Projects</h2>${resume.projects.map((p) => `<div class="item"><div class="item-header">${p.title || p.name}</div><div>${p.description}</div>${p.technologies?.length > 0 ? `<div class="item-subheader">Tech: ${p.technologies.join(", ")}</div>` : ""}</div>`).join("")}` : ""}
</body></html>`;

      const blob = await resumeAPI.exportPdf(
        htmlContent,
        `${resume.title || "Resume"}.pdf`,
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.title || "Resume"}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded!", { id: "pdf-download" });
    } catch (err) {
      console.error("PDF download failed:", err);
      toast.error("Failed to download PDF", { id: "pdf-download" });
    }
  };

  const handleDeleteResume = async (resumeId, resumeTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${resumeTitle}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      toast.loading("Deleting resume...", { id: "delete-resume" });
      await resumeAPI.delete(resumeId);
      setResumes((prev) => prev.filter((r) => r.resume_id !== resumeId));
      toast.success("Resume deleted!", { id: "delete-resume" });
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast.error("Failed to delete resume", { id: "delete-resume" });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((prev) => ({ ...prev, profile_picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      console.log("Saving profile for user:", user.user_id);
      console.log("Profile data:", profileForm);
      const response = await authAPI.updateProfile(user.user_id, profileForm);
      console.log("Profile update response:", response);
      updateUser(response.user);
      toast.success("Profile updated successfully!");
      setShowEditProfile(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.msg ||
          "Failed to update profile",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const getAtsScoreColor = (score) => {
    if (score >= 85) return "teal";
    if (score >= 70) return "amber";
    return "red";
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Placeholder cover images for resumes
  const placeholderImages = [
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  ];

  const getPlaceholderImage = (index) => {
    return placeholderImages[index % placeholderImages.length];
  };

  return (
    <div className="bg-[#0F172A] text-white font-sans min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md px-6 py-3 w-full">
        <div className="flex items-center gap-4 text-white">
          <div className="w-8 h-8 text-blue-500">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"
                fill="currentColor"
              ></path>
              <path
                clipRule="evenodd"
                d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight">
            IntelliCV
          </h2>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-white text-sm font-medium hover:text-blue-500 transition-colors cursor-pointer">
            Dashboard
          </a>
          <a className="text-slate-400 text-sm font-medium hover:text-white transition-colors cursor-pointer">
            Templates
          </a>
          <a className="text-slate-400 text-sm font-medium hover:text-white transition-colors cursor-pointer">
            Job Tracker
          </a>
        </nav>
        <div className="flex gap-2">
          <button className="flex w-9 h-9 cursor-pointer items-center justify-center overflow-hidden rounded-full hover:bg-white/10 bg-transparent text-slate-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">
              settings
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="flex w-9 h-9 cursor-pointer items-center justify-center overflow-hidden rounded-full hover:bg-white/10 bg-transparent text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              logout
            </span>
          </button>
          <div
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden flex w-9 h-9 cursor-pointer items-center justify-center overflow-hidden rounded-full hover:bg-white/10 bg-transparent text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 flex justify-center z-10">
        <div className="max-w-[1280px] w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
            {/* Profile Card */}
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-5 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
              <div className="relative mt-2">
                <div
                  className="w-32 h-32 rounded-full border-4 border-[#1E293B] bg-center bg-cover shadow-2xl relative z-10"
                  style={{
                    backgroundImage: user?.profile_picture
                      ? `url('${user.profile_picture}')`
                      : "url('https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(
                          (user?.first_name || "") +
                            " " +
                            (user?.last_name || ""),
                        ) +
                        "&background=3B82F6&color=fff&size=128')",
                  }}
                ></div>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="absolute bottom-1 right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/50 flex items-center justify-center z-20 border-2 border-[#1E293B]"
                >
                  <span className="material-symbols-outlined text-sm">
                    edit
                  </span>
                </button>
              </div>
              <div className="text-center z-10">
                <h2 className="text-xl font-bold text-white mb-1">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-blue-500 font-medium text-sm">
                  {user?.title || user?.profile_summary || "Professional"}
                </p>
                <p className="text-slate-400 text-sm flex items-center justify-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm">
                    location_on
                  </span>
                  {user?.location || "Add location"}
                </p>
              </div>
              <div className="w-full h-px bg-white/5 my-1"></div>
              <div className="w-full flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm group/item">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-500 group-hover/item:bg-blue-500/10 transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      mail
                    </span>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Email
                    </span>
                    <span className="text-white truncate text-xs">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm group/item">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-500 group-hover/item:bg-blue-500/10 transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      call
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Phone
                    </span>
                    <span className="text-white text-xs">
                      {user?.contact?.[0] || "Add phone number"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm group/item">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-500 group-hover/item:bg-blue-500/10 transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      language
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Portfolio
                    </span>
                    <span className="text-white text-xs">
                      {user?.portfolio || "Add portfolio"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-white/5 my-1"></div>
              <div className="w-full">
                <p className="text-slate-400 text-sm leading-relaxed">
                  {user?.profile_summary ||
                    "Add a professional summary to describe yourself."}
                </p>
              </div>
              <button
                onClick={() => setShowEditProfile(true)}
                className="w-full mt-2 py-2.5 rounded-lg border border-white/10 text-white text-sm font-semibold hover:bg-white/5 hover:border-blue-500/30 hover:text-blue-500 transition-all"
              >
                Edit Profile
              </button>
            </div>
          </aside>

          {/* Main Section */}
          <section className="lg:col-span-8 xl:col-span-9 flex flex-col gap-8">
            {/* Generate Resume Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-[#162032] to-[#0B1120]"></div>
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/15 transition-all duration-700"></div>
              <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.25)] border border-white/10">
                  <span className="material-symbols-outlined text-white text-4xl md:text-5xl">
                    auto_awesome
                  </span>
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-white text-2xl md:text-3xl font-bold mb-2 tracking-tight">
                    Generate New Resume
                  </h2>
                  <p className="text-slate-400 text-base md:text-lg max-w-xl font-light">
                    Create a tailored, ATS-friendly resume in seconds using our
                    advanced AI engine.
                  </p>
                </div>
                <button
                  onClick={handleGenerateResume}
                  className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-base px-6 py-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                >
                  <span>Start Now</span>
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>

            {/* My Resumes Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-500">
                    description
                  </span>
                  My Resumes
                </h3>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-base">
                      filter_list
                    </span>
                    Filter
                  </button>
                </div>
              </div>

              {/* Resume Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {loadingResumes ? (
                  // Loading skeleton
                  [...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse flex flex-col glass-card !border-white/5 rounded-xl overflow-hidden"
                    >
                      <div className="h-48 bg-slate-700/50"></div>
                      <div className="p-5">
                        <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-slate-700/50 rounded w-1/2 mb-5"></div>
                        <div className="h-8 bg-slate-700/50 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : resumes.length === 0 ? (
                  // No resumes message
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-4xl text-slate-400">
                        description
                      </span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">
                      No resumes yet
                    </h4>
                    <p className="text-slate-400 text-sm max-w-xs">
                      Generate your first resume to get started
                    </p>
                  </div>
                ) : (
                  resumes.map((resume, index) => (
                    <div
                      key={resume.resume_id}
                      className="group relative flex flex-col glass-card !border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:!border-blue-500/40"
                    >
                      <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-center bg-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                          style={{
                            backgroundImage: `url('${getPlaceholderImage(index)}')`,
                          }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] to-transparent opacity-90"></div>
                        <div className="absolute bottom-3 left-4">
                          <span
                            className={`px-2 py-1 rounded bg-${getAtsScoreColor(
                              resume.match_score || 0,
                            )}-500/10 text-${getAtsScoreColor(
                              resume.match_score || 0,
                            )}-400 text-xs font-bold border border-${getAtsScoreColor(
                              resume.match_score || 0,
                            )}-500/20 backdrop-blur-sm shadow-sm`}
                          >
                            ATS Score: {Math.round(resume.match_score || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-grow bg-[#1E293B]/40">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-white font-bold text-base truncate pr-2 group-hover:text-blue-500 transition-colors">
                            {resume.title || "Untitled Resume"}
                          </h4>
                          {/* Three dots menu button */}
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === resume.resume_id ? null : resume.resume_id);
                              }}
                              className="text-slate-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                            >
                              <span className="material-symbols-outlined">
                                more_vert
                              </span>
                            </button>
                            
                            {/* Dropdown Menu */}
                            {openMenuId === resume.resume_id && (
                              <>
                                {/* Backdrop to close menu when clicking outside */}
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setOpenMenuId(null)}
                                ></div>
                                <div className="absolute right-0 top-full mt-1 w-40 bg-[#1E293B] border border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadResume(resume);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    Download PDF
                                  </button>
                                  <div className="h-px bg-white/5"></div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteResume(
                                        resume.resume_id,
                                        resume.title || "Untitled Resume",
                                      );
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs mb-3">
                          Target: {resume.target || "General"} •{" "}
                          {formatTimeAgo(resume.timestamp)}
                        </p>
                        {/* Quick Edit button - single primary action */}
                        <div className="mt-auto">
                          <button
                            onClick={() => handleEditResume(resume.resume_id)}
                            className="w-full bg-white/5 hover:bg-blue-500 hover:text-white text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-white/5 hover:border-blue-500"
                          >
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>{" "}
                            Edit Resume
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Add New Resume Card */}
                <div
                  onClick={handleGenerateResume}
                  className="flex flex-col items-center justify-center h-full min-h-[300px] border border-dashed border-white/10 hover:border-blue-500/50 hover:bg-white/5 rounded-xl transition-all cursor-pointer group bg-white/[0.02]"
                >
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-500 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/30">
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                      add
                    </span>
                  </div>
                  <p className="text-slate-400 font-medium mt-4 group-hover:text-white transition-colors text-sm">
                    Create another resume
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowEditProfile(false)}
          ></div>
          <div className="relative bg-[#1E293B] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => setShowEditProfile(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-24 h-24 rounded-full bg-center bg-cover border-4 border-[#0F172A] mb-3"
                style={{
                  backgroundImage: profileForm.profile_picture
                    ? `url('${profileForm.profile_picture}')`
                    : "url('https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(
                        (profileForm.first_name || "") +
                          " " +
                          (profileForm.last_name || ""),
                      ) +
                      "&background=3B82F6&color=fff&size=96')",
                }}
              ></div>
              <label className="cursor-pointer text-blue-500 text-sm font-medium hover:text-blue-400 transition-colors">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={profileForm.location}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  placeholder="e.g., San Francisco, CA"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={profileForm.contact?.[0] || ""}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      contact: [e.target.value],
                    }))
                  }
                  placeholder="e.g., +1 (555) 123-4567"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Portfolio URL
                </label>
                <input
                  type="text"
                  value={profileForm.portfolio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      portfolio: e.target.value,
                    }))
                  }
                  placeholder="e.g., https://yourportfolio.com"
                  className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Professional Summary
                </label>
                <textarea
                  value={profileForm.profile_summary}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      profile_summary: e.target.value,
                    }))
                  }
                  placeholder="Describe yourself professionally..."
                  rows={3}
                  className="w-full bg-[#0F172A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditProfile(false)}
                className="flex-1 py-2.5 rounded-lg border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex-1 py-2.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <span className="animate-spin material-symbols-outlined text-lg">
                      progress_activity
                    </span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
