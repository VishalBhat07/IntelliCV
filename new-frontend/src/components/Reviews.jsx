const Reviews = () => {
  const reviews = [
    {
      rating: 5,
      text: "I had been applying for months with no luck. IntelliCV helped me tailor my resume to the job description, and I landed a Senior Dev role at TechCorp in just 2 weeks!",
      author: "Sarah Jenkins",
      role: "Software Engineer",
      avatar: "SJ",
      gradient: "from-purple-500 to-indigo-600",
    },
    {
      rating: 5,
      text: "The AI writing assistant is pure magic. It took my basic bullet points and turned them into powerful, metric-driven achievements. My ATS score went from 45 to 95.",
      author: "Marcus Ray",
      role: "Project Manager",
      avatar: "MR",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      rating: 4.5,
      text: "I was skeptical at first, but the speed is incredible. What used to take me hours of formatting now takes minutes. The designs are clean, professional, and stand out.",
      author: "Emily Liu",
      role: "Marketing Director",
      avatar: "EL",
      gradient: "from-blue-500 to-cyan-600",
    },
  ];

  return (
    <section
      className="bg-[#111827] py-20 border-t border-white/5"
      id="reviews"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Success Stories
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Join thousands of professionals who have accelerated their careers
            with IntelliCV.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="relative flex flex-col justify-between rounded-2xl border border-white/5 bg-[#1e293b]/30 p-8 backdrop-blur-sm transition-transform hover:-translate-y-1 hover:border-blue-500/20 hover:bg-[#1e293b]/50"
            >
              <div className="absolute -top-4 -right-4 text-6xl text-blue-500/10 font-serif leading-none select-none">
                "
              </div>

              <div>
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(review.rating)
                          ? "fill-current"
                          : "fill-none stroke-current"
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-lg text-gray-300 leading-relaxed">
                  {review.text}
                </blockquote>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div
                  className={`size-12 rounded-full bg-gradient-to-br ${review.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                >
                  {review.avatar}
                </div>
                <div>
                  <div className="font-bold text-white">{review.author}</div>
                  <div className="text-sm text-blue-400">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
