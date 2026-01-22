const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 bg-gradient-radial from-blue-500/10 via-[#0F172A] to-[#0F172A]"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200 self-center lg:self-start backdrop-blur-sm">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
              Powered by Google Gemini
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Craft Your Future with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                AI-Powered
              </span>{" "}
              Resumes
            </h1>

            {/* Description */}
            <p className="text-lg leading-relaxed text-gray-400 max-w-xl mx-auto lg:mx-0">
              Build ATS-optimized resumes in minutes using advanced AI
              technology. Analyze job descriptions, optimize keywords, and get
              hired faster.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <button className="flex h-12 min-w-[160px] items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600 text-white px-6 text-base font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 border border-blue-500/50">
                Get Started Free
              </button>
              <a 
                href="https://github.com/VishalBhat07/IntelliCV" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-12 min-w-[160px] items-center justify-center rounded-lg border border-gray-700 bg-slate-800/50 hover:bg-slate-800 text-white px-6 text-base font-bold transition-all backdrop-blur-sm gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Contribute
              </a>
            </div>

            {/* Social Proof */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-4 text-sm text-gray-400">
              <div className="flex -space-x-2">
                <div className="size-8 rounded-full border-2 border-[#0F172A] bg-gradient-to-br from-purple-500 to-pink-500"></div>
                <div className="size-8 rounded-full border-2 border-[#0F172A] bg-gradient-to-br from-blue-500 to-cyan-500"></div>
                <div className="size-8 rounded-full border-2 border-[#0F172A] bg-gradient-to-br from-emerald-500 to-teal-500"></div>
              </div>
              <p>
                <span className="font-bold text-white">2,000+</span> resumes
                created
              </p>
            </div>
          </div>

          {/* Right Column - Resume Preview */}
          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none perspective-1000">
            {/* Background Blur Effects */}
            <div className="absolute -right-20 -top-20 size-[400px] rounded-full bg-blue-500/20 blur-[100px] opacity-40"></div>
            <div className="absolute -bottom-10 -left-10 size-[300px] rounded-full bg-emerald-500/10 blur-[80px] opacity-40"></div>

            {/* Resume Card */}
            <div className="relative z-10 rounded-xl bg-[#1e293b] p-2 shadow-2xl ring-1 ring-white/10 transition-transform hover:scale-[1.02] duration-700 ease-out group">
              {/* Success Badge */}
              <div className="absolute -right-4 -top-4 z-20 flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-bounce shadow-emerald-500/30 ring-2 ring-[#0F172A]">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Resume Preview Image */}
              <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-gray-700/50 relative">
                {/* Actual Resume Image */}
                <img 
                  src="/resume-2.png" 
                  alt="Resume Preview" 
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* ATS Score Badge */}
              <div className="absolute bottom-12 -left-8 z-20 rounded-lg bg-slate-800/90 backdrop-blur-md p-4 shadow-xl flex items-center gap-3 border border-white/10 animate-float">
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    ATS Score
                  </p>
                  <p className="text-lg font-bold text-white">98/100</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
