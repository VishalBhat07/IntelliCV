import { useState } from "react";
import toast from "react-hot-toast";
import { educationAPI } from "../../services/api";

const EducationStep = ({ data, onUpdate, onNext, onBack }) => {
  const [educations, setEducations] = useState(
    data.length > 0
      ? data
      : [
          {
            id: 1,
            institution: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            gpa: "",
            highlights: "",
          },
        ]
  );

  const handleChange = (id, field, value) => {
    const updated = educations.map((edu) =>
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    setEducations(updated);
    onUpdate(updated);
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      highlights: "",
    };
    setEducations([...educations, newEdu]);
  };

  const removeEducation = (id) => {
    if (educations.length > 1) {
      const updated = educations.filter((edu) => edu.id !== id);
      setEducations(updated);
      onUpdate(updated);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    // Validate at least one education entry has required fields
    const hasValidEntry = educations.some(
      (edu) => edu.institution && edu.degree
    );

    if (!hasValidEntry) {
      toast.error("Please fill in at least institution name and degree for one entry.");
      return;
    }

    // Filter out empty entries and format for backend
    const validEducation = educations
      .filter((edu) => edu.institution || edu.degree)
      .map((edu) => ({
        institution_name: edu.institution,
        degree: edu.degree,
        field_of_study: edu.field,
        grade: edu.gpa,
        start_year: edu.startDate ? edu.startDate.split("-")[0] : "",
        completion_year: edu.endDate ? edu.endDate.split("-")[0] : "",
        highlights: edu.highlights
          ? edu.highlights.split("\n").filter(Boolean)
          : [],
      }));

    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.user_id) {
        toast.error("User not found. Please login again.");
        setSaving(false);
        return;
      }

      await educationAPI.save(user.user_id, validEducation);
      toast.success("Education saved successfully!");
      onNext();
    } catch (error) {
      console.error("Failed to save education:", error);
      toast.error(
        error.response?.data?.msg || "Failed to save education. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[800px] flex flex-col gap-8">
      {/* Progress Header */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-6 justify-between items-end">
          <p className="text-blue-500 text-sm font-bold uppercase tracking-wider">
            Step 1 of 4
          </p>
          <span className="text-slate-400 text-xs">25% Completed</span>
        </div>
        <div className="rounded-full bg-slate-800 h-1.5 w-full overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-500 ease-out"
            style={{ width: "25%" }}
          ></div>
        </div>
      </div>

      {/* Title Section */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between pt-2">
        <div className="flex gap-5 items-start">
          <div className="hidden sm:flex w-14 h-14 rounded-xl bg-slate-800/50 items-center justify-center border border-white/10 shrink-0 shadow-lg shadow-black/20">
            <span className="material-symbols-outlined text-blue-500 text-3xl">
              school
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.02em]">
              Education Details
            </h1>
            <p className="text-slate-400 text-base font-normal leading-relaxed">
              Add your educational background, degrees, and academic
              achievements.
            </p>
          </div>
        </div>
      </div>

      {/* Education Cards */}
      {educations.map((edu, index) => (
        <div
          key={edu.id}
          className="flex flex-col bg-[#1E293B] border border-white/5 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-500/5 hover:border-white/10 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/30">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400">
                menu
              </span>
              <h3 className="text-white text-lg font-bold tracking-tight">
                Education {index + 1}
              </h3>
            </div>
            {educations.length > 1 && (
              <button
                onClick={() => removeEducation(edu.id)}
                aria-label="Delete education entry"
                className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>
          <div className="p-6 flex flex-col gap-6">
            {/* Institution */}
            <div className="flex flex-col gap-2">
              <label
                className="text-slate-300 text-sm font-medium"
                htmlFor={`institution-${edu.id}`}
              >
                Institution Name
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 p-4 pl-12 h-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  id={`institution-${edu.id}`}
                  placeholder="e.g. Harvard University"
                  type="text"
                  value={edu.institution}
                  onChange={(e) =>
                    handleChange(edu.id, "institution", e.target.value)
                  }
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                  account_balance
                </span>
              </div>
            </div>

            {/* Degree & Field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  className="text-slate-300 text-sm font-medium"
                  htmlFor={`degree-${edu.id}`}
                >
                  Degree
                </label>
                <input
                  className="w-full rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 p-4 h-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  id={`degree-${edu.id}`}
                  placeholder="e.g. Bachelor of Science"
                  type="text"
                  value={edu.degree}
                  onChange={(e) =>
                    handleChange(edu.id, "degree", e.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="text-slate-300 text-sm font-medium"
                  htmlFor={`field-${edu.id}`}
                >
                  Field of Study
                </label>
                <input
                  className="w-full rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 p-4 h-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  id={`field-${edu.id}`}
                  placeholder="e.g. Computer Science"
                  type="text"
                  value={edu.field}
                  onChange={(e) =>
                    handleChange(edu.id, "field", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Dates & GPA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  className="text-slate-300 text-sm font-medium"
                  htmlFor={`start-date-${edu.id}`}
                >
                  Start Date
                </label>
                <input
                  className="w-full rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 p-4 h-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [color-scheme:dark]"
                  id={`start-date-${edu.id}`}
                  type="month"
                  value={edu.startDate}
                  onChange={(e) =>
                    handleChange(edu.id, "startDate", e.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="text-slate-300 text-sm font-medium"
                  htmlFor={`end-date-${edu.id}`}
                >
                  Graduation Date (or Expected)
                </label>
                <input
                  className="w-full rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 p-4 h-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [color-scheme:dark]"
                  id={`end-date-${edu.id}`}
                  type="month"
                  value={edu.endDate}
                  onChange={(e) =>
                    handleChange(edu.id, "endDate", e.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="text-slate-300 text-sm font-medium"
                  htmlFor={`gpa-${edu.id}`}
                >
                  GPA (Optional)
                </label>
                <input
                  className="w-full rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 p-4 h-14 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  id={`gpa-${edu.id}`}
                  placeholder="e.g. 3.8"
                  type="text"
                  value={edu.gpa}
                  onChange={(e) => handleChange(edu.id, "gpa", e.target.value)}
                />
              </div>
            </div>

            {/* Highlights */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <label
                  className="text-slate-300 text-sm font-medium"
                  htmlFor={`highlights-${edu.id}`}
                >
                  Highlights / Achievements
                </label>
                <span className="text-xs text-slate-400 italic">
                  Markdown supported
                </span>
              </div>
              <textarea
                className="w-full rounded-lg bg-black/20 border border-white/10 text-white placeholder-slate-500 p-4 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
                id={`highlights-${edu.id}`}
                placeholder="• Graduated Cum Laude
• President of the Robotics Club
• Thesis on Neural Networks"
                value={edu.highlights}
                onChange={(e) =>
                  handleChange(edu.id, "highlights", e.target.value)
                }
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add Education Button */}
      <button
        onClick={addEducation}
        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300 group"
      >
        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">
          add_circle
        </span>
        <span className="font-bold text-sm tracking-wide">
          Add Another Education
        </span>
      </button>

      {/* Navigation */}
      <div className="pt-8 flex items-center justify-between border-t border-white/10 mt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-lg text-slate-300 font-bold text-sm hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 rounded-lg bg-blue-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin">
                sync
              </span>
              Saving...
            </>
          ) : (
            <>
              Next: Upload Documents
              <span className="material-symbols-outlined text-lg">
                arrow_forward
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EducationStep;
