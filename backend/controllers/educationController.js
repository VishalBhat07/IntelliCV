const Education = require("../models/Education");

// POST /api/education - Save education data for a user
exports.saveEducation = async (req, res) => {
  try {
    const { user_id, education } = req.body;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    if (!education || !Array.isArray(education) || education.length === 0) {
      return res.status(400).json({ msg: "education array is required" });
    }

    // Delete existing education entries for this user (if updating)
    await Education.destroy({ where: { user_id } });

    // Prepare education entries for bulk insert
    const educationEntries = education.map((edu) => ({
      user_id,
      institution_name: edu.institution_name || "",
      degree: edu.degree || "",
      field_of_study: edu.field_of_study || null,
      grade: edu.grade || null,
      completion_year: edu.completion_year || null,
      highlights: edu.highlights ? JSON.stringify(edu.highlights) : null,
    }));

    // Insert new education entries
    const savedEducation = await Education.bulkCreate(educationEntries);

    res.json({
      msg: "Education data saved successfully",
      count: savedEducation.length,
      education: savedEducation,
    });
  } catch (error) {
    console.error("Error saving education:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/education/:user_id - Get education data for a user
exports.getEducation = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    const education = await Education.findAll({
      where: { user_id },
      order: [["completion_year", "DESC"]],
    });

    res.json({
      education: education.map((edu) => ({
        ...edu.toJSON(),
        highlights: edu.highlights ? JSON.parse(edu.highlights) : [],
      })),
    });
  } catch (error) {
    console.error("Error fetching education:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
