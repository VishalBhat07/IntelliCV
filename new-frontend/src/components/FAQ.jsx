import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How secure is my data?",
      answer:
        "Your privacy is our top priority. All personal data is encrypted using bank-level AES-256 encryption. We do not sell your data to third parties, and you can permanently delete your information at any time from your account settings.",
    },
    {
      question: "What is Google Gemini AI?",
      answer:
        "Google Gemini is a state-of-the-art multimodal AI model. We leverage its advanced natural language processing capabilities to understand your career history and generate professional, context-aware content that is optimized for Applicant Tracking Systems (ATS).",
    },
    {
      question: "Can I export my resume to PDF?",
      answer:
        "Yes! Once you are satisfied with your resume, you can instantly export it as a high-quality PDF. Our PDFs are designed to be machine-readable, ensuring that ATS software can parse your information correctly.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Absolutely. You can create your first resume for free to test our AI features and templates. Upgrading to the premium plan unlocks unlimited resumes, advanced AI tailoring for specific job descriptions, and cover letter generation.",
    },
  ];

  return (
    <section className="bg-[#111827] py-20 border-y border-white/5">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Everything you need to know about IntelliCV.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group rounded-xl border border-white/10 bg-[#1e293b]/30 open:bg-[#1e293b]/50 overflow-hidden transition-all duration-300"
              open={openIndex === index}
              onToggle={(e) => setOpenIndex(e.target.open ? index : null)}
            >
              <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-medium text-white hover:text-blue-400 transition-colors select-none">
                {faq.question}
                <svg
                  className="w-6 h-6 transition-transform duration-300 group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
