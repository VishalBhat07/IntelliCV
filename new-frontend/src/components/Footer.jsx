const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#0F172A] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500 text-white">
                <svg
                  className="w-5 h-5"
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
              <span className="text-lg font-bold">IntelliCV</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              The smartest way to build your resume. AI-powered, ATS-friendly,
              and designed to get you hired.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Product
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a
                  className="hover:text-blue-400 transition-colors"
                  href="#features"
                >
                  Features
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors" href="#">
                  Templates
                </a>
              </li>
              <li>
                <a
                  className="hover:text-blue-400 transition-colors"
                  href="#pricing"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  className="hover:text-blue-400 transition-colors"
                  href="#reviews"
                >
                  Reviews
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Resources
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a className="hover:text-blue-400 transition-colors" href="#">
                  Career Blog
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors" href="#">
                  Resume Examples
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors" href="#">
                  Interview Prep
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors" href="#">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
              Legal
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>
                <a className="hover:text-blue-400 transition-colors" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors" href="#">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="hover:text-blue-400 transition-colors" href="#">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2024 IntelliCV Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              className="text-gray-500 hover:text-white transition-colors"
              href="#"
              aria-label="Like us"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </a>
            <a
              className="text-gray-500 hover:text-white transition-colors"
              href="#"
              aria-label="Share"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
