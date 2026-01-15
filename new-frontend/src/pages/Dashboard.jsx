import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGenerateResume = () => {
    navigate("/resume-studio");
  };

  // Sample resume data - this will be replaced with actual data from backend
  const resumes = [
    {
      id: 1,
      title: "Senior Product Designer",
      target: "Google",
      editedTime: "2h ago",
      atsScore: 92,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC8FeiUUCm1HXo2pMZSzWSlZE0rVPFuoUC5pHYI41RoLEgCx3pzvhlrPoeFEv1nMYEGEk0PLg8K5mFpndUQBwgvSVgfNT8NeZOiakTaAoqeaW8vXMy-9av8B2SKFo1tE3MZwiRatSu6rn2enqnGyim21sSD9-e6IKwhlt0HatcL9LNngxfjHgptjT2wdEe8WAJX8UOQ12tx4uUD7_4uW_p8_O_BXv5hTXFAJs-7COT3y5WdurKQbyoer7YGrOfios3Wh6Cw6XM25g",
    },
    {
      id: 2,
      title: "UX Lead - Fintech",
      target: "Stripe",
      editedTime: "yesterday",
      atsScore: 78,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuChLYAlMTra8mBW19WvqMJvt7o5S-mpnJn9vaoJphWi7CF1oArWeNj5WE6KkNxPu1m__RHhgGXOgP3yKNnASaksBT0AgvOkUMKGBd9gzxNjTSnXKdPc864T8mBmZPyGbX9qfGwB71ACJVqG9aRuIusbybB589-vGHbcqsjnrCZs_bkS7TnN-8Ek091JE2cJkui457gk3658qUfuRZih900z-EF5wACNJ6_g99iuMCS4lB_WKfWnNxX5i5TpmMw9BIADrNUJa7obnQ",
    },
    {
      id: 3,
      title: "General Resume 2024",
      target: "General",
      editedTime: "5 days ago",
      atsScore: 85,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBvkoH5jZgWKlUr-CHzp1_X8yeyQBU8n2UhS3Kd3EV2B1pHoKVpRQqw6ci-efAWG-KYcR1OB8PW5e_5TnyD34C15pphcujWnPYZgBk9oRPap_dSfq_SCM4ofFlVWMVIKcQb5j_cm9G-nFkuAcKP-oMUFUJK3fJ6H6Fiwq8Y4W2fJbfldDocY-5WQMObcJWpAMeJLuil9mNuB-6JhYd0JkUgMp8mtjmdyaUDPGHXza-XAnGWUwzks6rud5jx0tfNezmQ4OKerHVYgw",
    },
  ];

  const getAtsScoreColor = (score) => {
    if (score >= 85) return "teal";
    if (score >= 70) return "amber";
    return "red";
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
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCdy5XlcaKBVKJJTfgyCbfDDDkJ7B52humo8eyef1agshw3oMbA6Iv6QOwtR7MH0yk0oUD7n-WBlVw2bOesqBGKjTyFtQS4rk5X7kMLI73N-zzBIW8-oKkAYVu6p1Cv6M175zgOQMKXZOpzC2J7kSJvsqjq-ibnAOZu6gWyncPWQO7VoUttK_p_bmDBzsje8vjcpFd2egwR7PYMjGpzFz0xeyK0nlFuZoWh33NKiLdA-xgo93fa9ZGz6bnvMBa8_MvOA5biEvddbg')",
                  }}
                ></div>
                <button className="absolute bottom-1 right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-blue-900/50 flex items-center justify-center z-20 border-2 border-[#1E293B]">
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
                  {user?.profile_summary || "Professional"}
                </p>
                <p className="text-slate-400 text-sm flex items-center justify-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm">
                    location_on
                  </span>
                  San Francisco, CA
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
                      {user?.contact?.[0] || "+1 (555) 012-3456"}
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
                      {user?.first_name?.toLowerCase()}.design
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-full h-px bg-white/5 my-1"></div>
              <div className="w-full">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Passionate designer with 8+ years of experience in SaaS
                  products. Expert in UI/UX and design systems.
                </p>
              </div>
              <button className="w-full mt-2 py-2.5 rounded-lg border border-white/10 text-white text-sm font-semibold hover:bg-white/5 hover:border-blue-500/30 hover:text-blue-500 transition-all">
                Edit Profile
              </button>
            </div>

            {/* Credits Card */}
            <div className="glass-card rounded-xl p-5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute -right-4 -bottom-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
              <div className="relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Credits Available
                </p>
                <p className="text-white text-2xl font-bold font-display">
                  120
                </p>
              </div>
              <button className="relative z-10 bg-white/5 text-blue-500 border border-white/5 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all">
                Top Up
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
                {resumes.map((resume) => (
                  <div
                    key={resume.id}
                    className="group relative flex flex-col glass-card !border-white/5 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:!border-blue-500/40"
                  >
                    <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-center bg-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
                        style={{
                          backgroundImage: `url('${resume.image}')`,
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] to-transparent opacity-90"></div>
                      <div className="absolute bottom-3 left-4">
                        <span
                          className={`px-2 py-1 rounded bg-${getAtsScoreColor(
                            resume.atsScore
                          )}-500/10 text-${getAtsScoreColor(
                            resume.atsScore
                          )}-400 text-xs font-bold border border-${getAtsScoreColor(
                            resume.atsScore
                          )}-500/20 backdrop-blur-sm shadow-sm`}
                        >
                          ATS Score: {resume.atsScore}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow bg-[#1E293B]/40">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-white font-bold text-base truncate pr-2 group-hover:text-blue-500 transition-colors">
                          {resume.title}
                        </h4>
                        <button className="text-slate-400 hover:text-white transition-colors">
                          <span className="material-symbols-outlined">
                            more_vert
                          </span>
                        </button>
                      </div>
                      <p className="text-slate-400 text-xs mb-5">
                        Target: {resume.target} • Edited {resume.editedTime}
                      </p>
                      <div className="mt-auto flex gap-2">
                        <button className="flex-1 bg-white/5 hover:bg-blue-500 hover:text-white text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-white/5 hover:border-blue-500">
                          <span className="material-symbols-outlined text-sm">
                            edit
                          </span>{" "}
                          Edit
                        </button>
                        <button
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-lg">
                            download
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

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
    </div>
  );
};

export default Dashboard;
