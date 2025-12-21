import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Briefcase,
  Award,
  TrendingUp,
} from "lucide-react";

export default function LandingPage({ onGetStarted }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                IntelliCV
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Benefits
              </button>
              <button
                onClick={onGetStarted}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("benefits")}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg font-medium transition-colors"
              >
                Benefits
              </button>
              <button
                onClick={onGetStarted}
                className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-center shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                AI-Powered Resume Builder
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Create Your Perfect{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Resume
                </span>{" "}
                in Minutes
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                Harness the power of AI to craft professional, ATS-friendly
                resumes tailored to your dream job. Stand out from the crowd
                with intelligent resume optimization.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Generate Resume
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-600 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-all shadow-lg"
                >
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">100%</div>
                  <div className="text-sm text-gray-600">ATS-Friendly</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600">5min</div>
                  <div className="text-sm text-gray-600">Quick Setup</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-600">AI</div>
                  <div className="text-sm text-gray-600">Powered</div>
                </div>
              </div>
            </div>

            {/* Right Image/Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-indigo-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-indigo-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-lg"></div>
                    <div className="flex-1 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg"></div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <span className="text-green-700 font-semibold">
                      Resume Ready!
                    </span>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create a professional resume that gets
              results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "AI-Powered Generation",
                description:
                  "Our advanced AI analyzes your information and generates tailored content that highlights your strengths.",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "ATS-Optimized",
                description:
                  "Resumes are formatted to pass Applicant Tracking Systems, ensuring your application reaches human eyes.",
                color: "from-indigo-500 to-purple-500",
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Quick & Easy",
                description:
                  "Create a professional resume in just 5 minutes. No design skills needed.",
                color: "from-green-500 to-teal-500",
              },
              {
                icon: <Briefcase className="w-8 h-8" />,
                title: "Job-Tailored",
                description:
                  "Upload job descriptions and get resumes customized for specific positions.",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Professional Templates",
                description:
                  "Choose from expertly designed templates that look great and are easy to read.",
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Smart Optimization",
                description:
                  "AI suggests improvements and highlights missing information for maximum impact.",
                color: "from-purple-500 to-indigo-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-indigo-200 hover:-translate-y-1"
              >
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Four simple steps to your perfect resume
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Enter Education",
                description:
                  "Add your educational background and academic achievements.",
                icon: <FileText className="w-6 h-6" />,
              },
              {
                step: "02",
                title: "Upload Documents",
                description:
                  "Upload certificates, projects, and relevant documents.",
                icon: <Award className="w-6 h-6" />,
              },
              {
                step: "03",
                title: "Add Job Description",
                description:
                  "Paste the job description you're applying for (optional).",
                icon: <Briefcase className="w-6 h-6" />,
              },
              {
                step: "04",
                title: "Generate Resume",
                description:
                  "Let AI create your perfect, tailored resume instantly.",
                icon: <Sparkles className="w-6 h-6" />,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-100 hover:border-indigo-300 h-full">
                  <div className="text-6xl font-bold text-indigo-100 mb-4">
                    {item.step}
                  </div>
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-indigo-300"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose IntelliCV?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of job seekers who have landed their dream jobs
                with our AI-powered resume builder.
              </p>

              <div className="space-y-6">
                {[
                  {
                    title: "Save Time",
                    description:
                      "Create professional resumes in minutes, not hours.",
                  },
                  {
                    title: "Stand Out",
                    description:
                      "AI-optimized content that highlights your unique strengths.",
                  },
                  {
                    title: "Get Hired",
                    description:
                      "ATS-friendly format ensures your resume gets noticed.",
                  },
                  {
                    title: "Free to Use",
                    description:
                      "No hidden fees. Create and download your resume for free.",
                  },
                ].map((benefit, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-6">Ready to Get Started?</h3>
              <p className="text-lg mb-8 text-indigo-100">
                Create your professional resume in just 5 minutes. No credit
                card required.
              </p>
              <button
                onClick={onGetStarted}
                className="w-full px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
              >
                Start Building Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-indigo-200 mt-4 text-center">
                Free forever. No credit card needed.
              </p>
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
