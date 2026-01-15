const FinalCTA = () => {
  return (
    <section className="relative py-20 px-6">
      <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-500/50 px-6 py-16 text-center text-white shadow-[0_0_40px_-10px_rgba(59,130,246,0.4)] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-emerald-400 blur-3xl opacity-10"></div>

        <div className="relative z-10">
          <h2 className="mb-6 text-3xl font-extrabold sm:text-4xl">
            Ready to Land Your Dream Job?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100 opacity-90">
            Join thousands of job seekers who have successfully advanced their
            careers with IntelliCV.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto rounded-lg bg-white text-blue-600 hover:bg-gray-50 px-8 py-3.5 text-base font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
              Create My Resume Now
            </button>
            <span className="text-sm font-medium text-blue-100 opacity-80 mt-2 sm:mt-0">
              No credit card required
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
