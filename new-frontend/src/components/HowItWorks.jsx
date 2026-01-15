const HowItWorks = () => {
  return (
    <section
      className="bg-[#111827] py-20 border-y border-white/5 relative"
      id="how-it-works"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Your perfect resume in 4 simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-0 top-[28px] hidden h-[2px] w-full -translate-y-1/2 bg-gray-800 md:block lg:px-16">
            <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 via-blue-500 to-gray-800 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="z-10 flex size-14 items-center justify-center rounded-full border-4 border-[#111827] bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-transform group-hover:scale-110">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">
                1. Add Education
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Input your academic history and achievements manually or via
                import.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="z-10 flex size-14 items-center justify-center rounded-full border-4 border-[#111827] bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-transform group-hover:scale-110">
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
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-bold text-white">
                2. Upload Documents
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Upload existing CVs or certificates for the AI to parse
                instantly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="z-10 flex size-14 items-center justify-center rounded-full border-4 border-[#111827] bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-transform group-hover:scale-110">
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
              <h3 className="mt-6 text-lg font-bold text-white">
                3. Job Description
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                Paste the job description you are applying for to tailor
                content.
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative flex flex-col items-center text-center group">
              <div className="z-10 flex size-14 items-center justify-center rounded-full border-4 border-[#111827] bg-gray-800 text-gray-400 shadow-md ring-2 ring-gray-700/50">
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
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-bold text-gray-500">
                4. Generate CV
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Get a tailored, ATS-ready resume in seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
