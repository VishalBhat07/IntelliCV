import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0F172A]/80 backdrop-blur-md px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-500 ring-1 ring-blue-500/20">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight text-white">
            IntelliCV
          </h2>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            href="#features"
          >
            Features
          </a>
          <a
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            href="#how-it-works"
          >
            How it Works
          </a>
          <a
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            href="#reviews"
          >
            Stories
          </a>
          <a
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            href="#pricing"
          >
            Pricing
          </a>
        </nav>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden sm:block text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-5 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 border border-blue-500/50"
          >
            <span>Get Started</span>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 pb-4 border-t border-white/5 pt-4">
          <div className="flex flex-col gap-4">
            <a
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              href="#how-it-works"
            >
              How it Works
            </a>
            <a
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              href="#reviews"
            >
              Stories
            </a>
            <a
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
              href="#pricing"
            >
              Pricing
            </a>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
