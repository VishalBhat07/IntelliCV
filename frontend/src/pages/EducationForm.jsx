import React, { useState } from "react";
import { GraduationCap, Plus, Trash2, Save } from "lucide-react";

export default function EducationForm({ onNext, initialData = [] }) {
  const [educationList, setEducationList] = useState(
    initialData.length > 0
      ? initialData
      : [
          {
            institution_name: "",
            degree: "",
            field_of_study: "",
            grade: "",
            completion_year: "",
            highlights: [],
          },
        ]
  );

  const addEducation = () => {
    setEducationList([
      ...educationList,
      {
        institution_name: "",
        degree: "",
        field_of_study: "",
        grade: "",
        completion_year: "",
        highlights: [],
      },
    ]);
  };

  const removeEducation = (index) => {
    if (educationList.length > 1) {
      setEducationList(educationList.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };

  const updateHighlights = (index, value) => {
    const updated = [...educationList];
    const highlights = value
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);
    updated[index].highlights = highlights;
    setEducationList(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate at least one education entry with required fields
    const hasValidEntry = educationList.some(
      (edu) => edu.institution_name && edu.degree
    );

    if (!hasValidEntry) {
      alert(
        "Please fill in at least institution name and degree for one entry."
      );
      return;
    }

    // Filter out empty entries
    const validEducation = educationList.filter(
      (edu) => edu.institution_name || edu.degree
    );

    onNext(validEducation);
  };

  return (
    <div className="bg-gradient-to-b from-black via-gray-900 to-black min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl shadow-2xl p-8 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mr-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-extrabold text-white">
                Education Details
              </h2>
              <p className="text-gray-400 mt-2 text-lg">
                Add your educational background
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {educationList.map((education, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-xl p-6 relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300"
              >
                {educationList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(index)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <h3 className="text-lg font-semibold text-white mb-4">
                  Education {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Institution Name *
                    </label>
                    <input
                      type="text"
                      value={education.institution_name}
                      onChange={(e) =>
                        updateEducation(
                          index,
                          "institution_name",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="e.g., Harvard University"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Degree *
                    </label>
                    <input
                      type="text"
                      value={education.degree}
                      onChange={(e) =>
                        updateEducation(index, "degree", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="e.g., Bachelor of Science"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      value={education.field_of_study}
                      onChange={(e) =>
                        updateEducation(index, "field_of_study", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Grade / GPA
                    </label>
                    <input
                      type="text"
                      value={education.grade}
                      onChange={(e) =>
                        updateEducation(index, "grade", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="e.g., 3.8 / 4.0 or 85%"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Completion Year
                    </label>
                    <input
                      type="text"
                      value={education.completion_year}
                      onChange={(e) =>
                        updateEducation(
                          index,
                          "completion_year",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="e.g., 2024"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Highlights (one per line)
                    </label>
                    <textarea
                      value={(education.highlights || []).join("\n")}
                      onChange={(e) => updateHighlights(index, e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-400/50 focus:border-transparent resize-none text-white placeholder-gray-400"
                      rows="4"
                      placeholder="e.g.,&#10;Dean's List&#10;Computer Science Society President&#10;Research Assistant in AI Lab"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addEducation}
              className="w-full py-4 border-2 border-dashed border-white/20 text-blue-400 rounded-xl hover:border-blue-400/50 hover:bg-white/5 flex items-center justify-center gap-2 font-semibold transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add Another Education
            </button>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <Save className="w-5 h-5" />
                Save & Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
