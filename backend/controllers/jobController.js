const JobDescription = require("../models/JobDescription");

// POST /api/job-description - Save job description for a user
exports.saveJobDescription = async (req, res) => {
  try {
    const { user_id, description, title, company } = req.body;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ msg: "description is required" });
    }

    // Check if user already has a job description
    let jobDesc = await JobDescription.findOne({ where: { user_id } });

    if (jobDesc) {
      // Update existing job description
      await jobDesc.update({
        jd_text: description,
        title: title || "Job Position",
        company: company || null,
      });
    } else {
      // Create new job description
      jobDesc = await JobDescription.create({
        user_id,
        jd_text: description,
        title: title || "Job Position",
        company: company || null,
      });
    }

    res.json({
      msg: "Job description saved successfully",
      job_id: jobDesc.job_id,
      jobDescription: jobDesc,
    });
  } catch (error) {
    console.error("Error saving job description:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/job-description/:user_id - Get job description for a user
exports.getJobDescription = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ msg: "user_id is required" });
    }

    const jobDesc = await JobDescription.findOne({ where: { user_id } });

    if (!jobDesc) {
      return res.status(404).json({ msg: "No job description found" });
    }

    res.json({ jobDescription: jobDesc });
  } catch (error) {
    console.error("Error fetching job description:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;
