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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onGetStarted={onGetStarted}
      />

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          scrolled
            ? "bg-black/80 backdrop-blur-lg border-b border-white/10"
            : "bg-transparent border-b border-white/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">IntelliCV</span>
                <span className="text-xs text-gray-400 -mt-0.5">
                  AI Resume Builder
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute top-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 rounded-full text-sm font-semibold border border-white/10 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI-Powered Resume Builder</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
                Welcome.
              </h1>

              {/* Description */}
              <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                Create ATS-friendly resumes with AI assistance. Stand out from
                the competition.
              </p>

              {/* CTA Button */}
              <div>
                <button
                  onClick={onGetStarted}
                  className="px-10 py-5 bg-blue-600 text-white rounded-xl font-semibold text-xl hover:bg-blue-700 transition-all hover:scale-105 inline-flex items-center gap-3 shadow-lg shadow-blue-600/50"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-6">
                {[
                  { value: "100%", label: "ATS-Friendly" },
                  { value: "5min", label: "Quick Setup" },
                  { value: "AI", label: "Powered" },
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400 font-medium mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Visual - Modern Gradient Design */}
            <div className="relative">
              {/* Decorative gradient blobs */}
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-purple-500/30 to-blue-600/30 rounded-full blur-3xl"></div>

              <div className="relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl shadow-2xl p-8 border border-white/10 backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg mb-6 border border-white/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-white/20 rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-white/10 rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Content sections */}
                <div className="space-y-4">
                  {/* Text lines */}
                  <div className="space-y-2">
                    <div className="h-2 bg-white/10 rounded"></div>
                    <div className="h-2 bg-white/10 rounded w-5/6"></div>
                    <div className="h-2 bg-white/10 rounded w-4/6"></div>
                  </div>

                  {/* Skills/Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["React", "Node.js", "Python", "AI/ML"].map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded text-xs font-semibold border border-blue-400/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Success message */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-400/30 mt-4">
                    <span className="text-green-300 font-semibold text-sm">
                      Resume Optimized!
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 rounded-full text-sm font-semibold mb-6 border border-white/10">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful tools designed to help you create resumes that get
              results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "AI-Powered Generation",
                description:
                  "Advanced AI analyzes your information and generates tailored content.",
              },
              {
                icon: <Target className="w-6 h-6" />,
                title: "ATS-Optimized",
                description:
                  "Formatted to pass Applicant Tracking Systems and reach recruiters.",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Quick & Easy",
                description: "Create a professional resume in just 5 minutes.",
              },
              {
                icon: <Briefcase className="w-6 h-6" />,
                title: "Job-Tailored",
                description:
                  "Get a resume specifically optimized for any job position.",
              },
              {
                icon: <Award className="w-6 h-6" />,
                title: "Professional Templates",
                description:
                  "Expertly designed templates that are visually appealing.",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Smart Optimization",
                description: "Intelligent suggestions for maximum impact.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-6 border border-white/10 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all group backdrop-blur-sm"
              >
                <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-black"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 rounded-full text-sm font-semibold mb-6 border border-white/10">
              <Zap className="w-4 h-4 text-blue-400" />
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              4 Easy Steps
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From zero to professional resume in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Enter Education",
                description:
                  "Add your educational background and achievements.",
                icon: <FileText className="w-6 h-6" />,
              },
              {
                step: "02",
                title: "Upload Documents",
                description: "Upload certificates and project details.",
                icon: <Upload className="w-6 h-6" />,
              },
              {
                step: "03",
                title: "Add Job Description",
                description: "Paste the job description for tailored results.",
                icon: <Briefcase className="w-6 h-6" />,
              },
              {
                step: "04",
                title: "Generate Resume",
                description:
                  "Let AI create your professional resume instantly.",
                icon: <Sparkles className="w-6 h-6" />,
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col">
                {/* Step number */}
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl font-bold text-white">
                      {item.step}
                    </span>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="hidden lg:block w-6 h-6 text-gray-600 ml-auto" />
                  )}
                </div>

                {/* Card */}
                <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-lg p-6 border border-white/10 flex-1 backdrop-blur-sm hover:border-blue-500/50 transition-all">
                  <div className="inline-flex p-3 rounded-lg bg-white/5 border border-white/10 mb-4 text-blue-400">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-300 rounded-full text-sm font-semibold mb-6 border border-white/10">
                <Award className="w-4 h-4 text-blue-400" />
                Why IntelliCV
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Built for Job Seekers
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join professionals who have landed their dream jobs with
                AI-powered resumes.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: <Zap className="w-5 h-5" />,
                    title: "Save Time",
                    description: "Create professional resumes in minutes.",
                  },
                  {
                    icon: <Target className="w-5 h-5" />,
                    title: "Stand Out",
                    description:
                      "AI-optimized content that highlights your strengths.",
                  },
                  {
                    icon: <TrendingUp className="w-5 h-5" />,
                    title: "Get Hired",
                    description: "ATS-friendly format reaches recruiters.",
                  },
                  {
                    icon: <CheckCircle className="w-5 h-5" />,
                    title: "Free to Use",
                    description: "No hidden fees or subscriptions.",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        {benefit.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - CTA card */}
            <div>
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <h3 className="text-4xl font-bold mb-4">
                    Ready to Build Your Resume?
                  </h3>
                  <p className="text-white/90 mb-8 text-lg">
                    Join thousands of professionals creating standout resumes
                    with AI.
                  </p>
                  <button
                    onClick={onGetStarted}
                    className="w-full bg-white text-blue-600 py-5 px-8 rounded-xl font-bold text-xl hover:bg-gray-100 transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-xl"
                  >
                    <span>Get Started Now</span>
                    <ArrowRight className="w-6 h-6" />
                  </button>
                  <div className="flex items-center justify-center gap-2 text-sm text-white/70 font-semibold mt-5">
                    <CheckCircle className="w-5 h-5" />
                    <span>Free forever • No credit card required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">IntelliCV</span>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} IntelliCV. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
