const Comparison = () => {
  return (
    <section className="py-20 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-64 bg-blue-500/5 blur-[120px] -z-10 rounded-full pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            IntelliCV vs. The Rest
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Why we are the smarter choice for your career growth.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#1e293b]/30 backdrop-blur-md">
          <table className="w-full min-w-[700px] text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-6 text-sm font-semibold text-gray-400 uppercase tracking-wider w-1/3">
                  Feature
                </th>
                <th className="p-6 text-sm font-semibold text-gray-400 uppercase tracking-wider w-1/3 text-center">
                  Traditional Builders
                </th>
                <th className="p-6 text-lg font-bold text-white uppercase tracking-wider w-1/3 text-center bg-blue-500/10 border-b border-blue-500/20">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    IntelliCV
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="group hover:bg-white/5 transition-colors">
                <td className="p-6 text-white font-medium">
                  AI Writing Assistant
                </td>
                <td className="p-6 text-center text-gray-500">
                  <svg
                    className="w-6 h-6 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </td>
                <td className="p-6 text-center bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Google Gemini AI</span>
                  </div>
                </td>
              </tr>

              <tr className="group hover:bg-white/5 transition-colors">
                <td className="p-6 text-white font-medium">
                  ATS Keyword Optimization
                </td>
                <td className="p-6 text-center text-gray-500">Basic or None</td>
                <td className="p-6 text-center bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Real-time Scoring</span>
                  </div>
                </td>
              </tr>

              <tr className="group hover:bg-white/5 transition-colors">
                <td className="p-6 text-white font-medium">
                  Resume Creation Speed
                </td>
                <td className="p-6 text-center text-gray-400">1-2 Hours</td>
                <td className="p-6 text-center bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-white font-bold">
                    <svg
                      className="w-6 h-6 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    <span>&lt; 10 Minutes</span>
                  </div>
                </td>
              </tr>

              <tr className="group hover:bg-white/5 transition-colors">
                <td className="p-6 text-white font-medium">
                  Job Description Matching
                </td>
                <td className="p-6 text-center text-gray-500">
                  Manual Copy-Paste
                </td>
                <td className="p-6 text-center bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold">
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Instant Analysis</span>
                  </div>
                </td>
              </tr>

              <tr className="group hover:bg-white/5 transition-colors">
                <td className="p-6 text-white font-medium">
                  Formatting & Design
                </td>
                <td className="p-6 text-center text-gray-400">
                  Rigid & Outdated
                </td>
                <td className="p-6 text-center bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors">
                  <div className="flex items-center justify-center gap-2 text-white font-bold">
                    <svg
                      className="w-6 h-6 text-blue-500"
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
                    <span>Adaptive & Modern</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Comparison;
