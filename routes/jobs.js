const express = require("express");
const router = express.Router();
const { 
    getJobsList, 
    addJob, 
    getEditJob, 
    updateJob, 
    deleteJob 
} = require("../controllers/jobs");

// Get all jobs and add a new job
router.route("/").get(getJobsList).post(addJob);

// Get form to add a new job
router.route("/new").get((req, res) => {
    res.render("job", { job: null });
});

// Edit and update a job
router.route("/edit/:id").get(getEditJob).post(updateJob);

// Delete a job
router.route("/delete/:id").post(deleteJob);


module.exports = router;