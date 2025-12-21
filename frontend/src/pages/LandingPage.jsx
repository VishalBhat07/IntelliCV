import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
  Menu,
  Briefcase,
  Award,
  TrendingUp,
  ChevronDown,
  Upload,
} from "lucide-react";
import MobileSidebar from "../components/MobileSidebar";

export default function LandingPage({ onGetStarted }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onGetStarted={onGetStarted}
      />

      {/* Enhanced Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200"
            : "bg-white/80 backdrop-blur-lg border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  IntelliCV
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">
                  AI Resume Builder
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollToSection("features")}
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors rounded-lg hover:bg-indigo-50"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors rounded-lg hover:bg-indigo-50"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors rounded-lg hover:bg-indigo-50"
              >
                Benefits
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2"></div>
              <button
                onClick={onGetStarted}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Get Started</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-3 rounded-xl hover:bg-indigo-50 transition-colors group"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition-colors" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-200 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-default">
                <Sparkles className="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-indigo-700 font-bold">
                  AI-Powered Resume Builder
                </span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Create Your{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                    Perfect
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 10C45.3333 3.33333 133.6 -2.4 198 10"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>{" "}
                Resume in Minutes
              </h1>

              {/* Description */}
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-xl">
                Harness the power of{" "}
                <span className="font-semibold text-indigo-600">AI</span> to
                craft professional, ATS-friendly resumes tailored to your dream
                job. Stand out and get hired faster.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-lg overflow-hidden shadow-xl shadow-indigo-200/50 hover:shadow-2xl hover:shadow-indigo-300/60 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center gap-3">
                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Generate Resume Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="group px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-200 rounded-2xl font-bold text-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>Learn More</span>
                  <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                {[
                  {
                    value: "100%",
                    label: "ATS-Friendly",
                    color: "from-green-500 to-emerald-600",
                  },
                  {
                    value: "5min",
                    label: "Quick Setup",
                    color: "from-blue-500 to-cyan-600",
                  },
                  {
                    value: "AI",
                    label: "Powered",
                    color: "from-indigo-500 to-purple-600",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="group cursor-default"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm md:text-base text-gray-600 font-medium mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-bold text-indigo-600">1000+</span>{" "}
                  resumes created this week
                </div>
              </div>
            </div>

            {/* Right Visual - Enhanced Resume Preview */}
            <div className="relative lg:ml-8 animate-fade-in-up animation-delay-200">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-300 to-blue-300 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>

              {/* Main card */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
                {/* Header */}
                <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl mb-6 border border-indigo-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-indigo-200 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-3 bg-indigo-100 rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content sections */}
                <div className="space-y-4">
                  {/* Text lines */}
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded-lg w-5/6 animate-pulse animation-delay-100"></div>
                    <div className="h-3 bg-gray-200 rounded-lg w-4/6 animate-pulse animation-delay-200"></div>
                  </div>

                  {/* Skills/Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["React", "Node.js", "Python", "AI/ML"].map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Stat cards */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-lg transition-all">
                      <div className="text-2xl font-bold text-green-600">
                        95%
                      </div>
                      <div className="text-xs text-green-700 font-medium">
                        Match Score
                      </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-lg transition-all">
                      <div className="text-2xl font-bold text-blue-600">A+</div>
                      <div className="text-xs text-blue-700 font-medium">
                        ATS Score
                      </div>
                    </div>
                  </div>

                  {/* Success message */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-300 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-bold text-sm">
                        Resume Optimized!
                      </span>
                    </div>
                    <Sparkles className="w-5 h-5 text-green-600 animate-spin-slow" />
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 animate-bounce">
                <Award className="w-4 h-4" />
                Professional
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-full shadow-xl font-bold text-sm flex items-center gap-2 animate-bounce animation-delay-1000">
                <Target className="w-4 h-4" />
                ATS Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full filter blur-3xl opacity-30"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Features
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Stand Out
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Powerful AI-driven tools designed to help you create resumes that
              get results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-7 h-7" />,
                title: "AI-Powered Generation",
                description:
                  "Advanced AI analyzes your information and generates tailored content that highlights your unique strengths and achievements.",
                gradient: "from-indigo-500 to-indigo-600",
                bgGradient: "from-indigo-50 to-indigo-100/50",
              },
              {
                icon: <Target className="w-7 h-7" />,
                title: "ATS-Optimized",
                description:
                  "Every resume is formatted to pass Applicant Tracking Systems, ensuring your application reaches human recruiters.",
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100/50",
              },
              {
                icon: <Zap className="w-7 h-7" />,
                title: "Quick & Easy",
                description:
                  "Create a professional resume in just 5 minutes. No design skills or experience needed.",
                gradient: "from-green-500 to-green-600",
                bgGradient: "from-green-50 to-green-100/50",
              },
              {
                icon: <Briefcase className="w-7 h-7" />,
                title: "Job-Tailored",
                description:
                  "Paste any job description and get a resume specifically optimized for that position.",
                gradient: "from-cyan-500 to-cyan-600",
                bgGradient: "from-cyan-50 to-cyan-100/50",
              },
              {
                icon: <Award className="w-7 h-7" />,
                title: "Professional Templates",
                description:
                  "Expertly designed templates that are both visually appealing and professionally appropriate.",
                gradient: "from-purple-500 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100/50",
              },
              {
                icon: <TrendingUp className="w-7 h-7" />,
                title: "Smart Optimization",
                description:
                  "Intelligent suggestions identify gaps and recommend improvements for maximum impact.",
                gradient: "from-orange-500 to-orange-600",
                bgGradient: "from-orange-50 to-orange-100/50",
              },
            ].map((feature, index) => {
              const getGradientClass = () => {
                const gradients = {
                  "from-indigo-500 to-indigo-600":
                    "bg-gradient-to-r from-indigo-500 to-indigo-600",
                  "from-blue-500 to-blue-600":
                    "bg-gradient-to-r from-blue-500 to-blue-600",
                  "from-green-500 to-green-600":
                    "bg-gradient-to-r from-green-500 to-green-600",
                  "from-cyan-500 to-cyan-600":
                    "bg-gradient-to-r from-cyan-500 to-cyan-600",
                  "from-purple-500 to-purple-600":
                    "bg-gradient-to-r from-purple-500 to-purple-600",
                  "from-orange-500 to-orange-600":
                    "bg-gradient-to-r from-orange-500 to-orange-600",
                };
                return (
                  gradients[feature.gradient] ||
                  "bg-gradient-to-r from-indigo-500 to-indigo-600"
                );
              };

              const getBgGradientClass = () => {
                const bgGradients = {
                  "from-indigo-50 to-indigo-100/50":
                    "bg-gradient-to-br from-indigo-50 to-indigo-100/50",
                  "from-blue-50 to-blue-100/50":
                    "bg-gradient-to-br from-blue-50 to-blue-100/50",
                  "from-green-50 to-green-100/50":
                    "bg-gradient-to-br from-green-50 to-green-100/50",
                  "from-cyan-50 to-cyan-100/50":
                    "bg-gradient-to-br from-cyan-50 to-cyan-100/50",
                  "from-purple-50 to-purple-100/50":
                    "bg-gradient-to-br from-purple-50 to-purple-100/50",
                  "from-orange-50 to-orange-100/50":
                    "bg-gradient-to-br from-orange-50 to-orange-100/50",
                };
                return (
                  bgGradients[feature.bgGradient] ||
                  "bg-gradient-to-br from-indigo-50 to-indigo-100/50"
                );
              };

              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 hover:border-indigo-200 hover:-translate-y-2"
                >
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 ${getBgGradientClass()} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  ></div>

                  <div className="relative">
                    <div
                      className={`inline-flex p-4 rounded-xl ${getGradientClass()} text-white mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-blue-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-full text-sm font-semibold mb-6 shadow-md border border-indigo-100">
              <Zap className="w-4 h-4" />
              Simple Process
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Create Your Resume in{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                4 Easy Steps
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From zero to professional resume in minutes—no experience required
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Enter Education",
                description:
                  "Add your educational background, degrees, and academic achievements with our simple form.",
                icon: <FileText className="w-7 h-7" />,
                color: "indigo",
              },
              {
                step: "02",
                title: "Upload Documents",
                description:
                  "Upload certificates, project details, and any relevant documents to enhance your profile.",
                icon: <Upload className="w-7 h-7" />,
                color: "blue",
              },
              {
                step: "03",
                title: "Add Job Description",
                description:
                  "Paste the job description to get a perfectly tailored resume for that specific role.",
                icon: <Briefcase className="w-7 h-7" />,
                color: "cyan",
              },
              {
                step: "04",
                title: "Generate Resume",
                description:
                  "Click generate and let AI create your professional, ATS-optimized resume instantly.",
                icon: <Sparkles className="w-7 h-7" />,
                color: "green",
              },
            ].map((item, index) => {
              const getColorClass = () => {
                const colorMap = {
                  indigo: "bg-gradient-to-r from-indigo-500 to-indigo-600",
                  blue: "bg-gradient-to-r from-blue-500 to-blue-600",
                  cyan: "bg-gradient-to-r from-cyan-500 to-cyan-600",
                  green: "bg-gradient-to-r from-green-500 to-green-600",
                };
                return (
                  colorMap[item.color] ||
                  "bg-gradient-to-r from-indigo-500 to-indigo-600"
                );
              };

              return (
                <div key={index} className="group flex flex-col">
                  {/* Step number */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-white rounded-full border-4 border-indigo-200 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-indigo-400 transition-all duration-300">
                      <span className="text-2xl font-black text-indigo-600">
                        {item.step}
                      </span>
                    </div>
                    {index < 3 && (
                      <ArrowRight className="hidden lg:block w-8 h-8 text-indigo-300 ml-4" />
                    )}
                  </div>

                  {/* Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 group-hover:border-indigo-200 group-hover:-translate-y-2 flex-1 flex flex-col">
                    <div
                      className={`inline-flex p-4 rounded-xl ${getColorClass()} text-white mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 self-start`}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm flex-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span>Start Building Your Resume</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-100 rounded-full filter blur-3xl opacity-40"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
                <Award className="w-4 h-4" />
                Why IntelliCV
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Built for{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Job Seekers
                </span>{" "}
                Like You
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Join thousands of professionals who have landed their dream jobs
                with our AI-powered resume builder. Get hired faster with
                resumes that stand out.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Save Time",
                    description:
                      "Create professional resumes in minutes, not hours. Our AI does the heavy lifting.",
                    color: "indigo",
                  },
                  {
                    icon: <Target className="w-6 h-6" />,
                    title: "Stand Out",
                    description:
                      "AI-optimized content that highlights your unique strengths and achievements.",
                    color: "blue",
                  },
                  {
                    icon: <TrendingUp className="w-6 h-6" />,
                    title: "Get Hired",
                    description:
                      "ATS-friendly format ensures your resume gets past screening and reaches recruiters.",
                    color: "green",
                  },
                  {
                    icon: <CheckCircle className="w-6 h-6" />,
                    title: "Free to Use",
                    description:
                      "No hidden fees or subscriptions. Create and download your resume completely free.",
                    color: "purple",
                  },
                ].map((benefit, index) => {
                  const getColorClass = () => {
                    const colorMap = {
                      indigo: "bg-gradient-to-r from-indigo-500 to-indigo-600",
                      blue: "bg-gradient-to-r from-blue-500 to-blue-600",
                      green: "bg-gradient-to-r from-green-500 to-green-600",
                      purple: "bg-gradient-to-r from-purple-500 to-purple-600",
                    };
                    return (
                      colorMap[benefit.color] ||
                      "bg-gradient-to-r from-indigo-500 to-indigo-600"
                    );
                  };

                  return (
                    <div
                      key={index}
                      className="flex gap-5 group cursor-default"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-14 h-14 ${getColorClass()} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                        >
                          <div className="text-white">{benefit.icon}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 pt-10 border-t border-gray-200">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right - Stats cards */}
            <div className="space-y-6">
              {/* Main stats card */}
              <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>

                <div className="relative">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-6">
                    <Sparkles className="w-4 h-4" />
                    Success Stats
                  </div>

                  <h3 className="text-3xl font-bold mb-8">
                    Trusted by Thousands
                  </h3>

                  <div className="space-y-6">
                    {[
                      {
                        value: "10,000+",
                        label: "Resumes Created",
                        icon: <FileText className="w-5 h-5" />,
                      },
                      {
                        value: "95%",
                        label: "Success Rate",
                        icon: <TrendingUp className="w-5 h-5" />,
                      },
                      {
                        value: "5min",
                        label: "Average Time",
                        icon: <Zap className="w-5 h-5" />,
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            {stat.icon}
                          </div>
                          <span className="text-white/90">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-black">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA card */}
              <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-indigo-100">
                <h4 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready to Begin?
                </h4>
                <p className="text-gray-600 mb-6">
                  Join successful job seekers today. No credit card needed.
                </p>
                <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  <span>Free forever</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">IntelliCV</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered resume builder that helps you create professional,
                ATS-friendly resumes in minutes.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="hover:text-white transition-colors"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <button
                    onClick={onGetStarted}
                    className="hover:text-white transition-colors"
                  >
                    Get Started
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} IntelliCV. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
