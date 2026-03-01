const Job = require("../models/Job");

const getJobsList = async (req, res) => {
  try {
    // Get jobs for the logged-in user
    const jobs = await Job.find({ createdBy: req.user._id });
    
    res.render("jobs", { jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).send("Error fetching jobs");
  }
};

const getEditJob = async (req, res) => {
  try {
    // Get job for the logged-in user
    const job = await Job.findById(req.params.id);
    
    res.render("job", { job });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).send("Error fetching job");
  }
};

const addJob = async (req, res) => {
  try {
    // Create a new job
    await Job.create({
      company: req.body.company,
      position: req.body.position,
      status: req.body.status,
      createdBy: req.user._id,
    });
    
    res.redirect("/jobs");
  } catch (error) {
    console.log("User:", req.user._id);
    console.error("Error adding job:", error);
    res.status(500).send("Error adding job");
  }
};

const updateJob = async (req, res) => {
    try {
        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            req.body,
            { returnDocument: 'after', runValidators: true }
        );
        
        if (!job) {
            return res.status(404).send("Job not found");
        }
        
        res.redirect("/jobs");
    } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).send("Error updating job");
    }
}

const deleteJob = async (req, res) => {
    try {
        const job = await Job.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });
        
        if (!job) {
            return res.status(404).send("Job not found");
        }
        
        res.redirect("/jobs");
    } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).send("Error deleting job");
    }
}

module.exports = {
  getJobsList,
  getEditJob,
  addJob,
  updateJob,
  deleteJob,
};
