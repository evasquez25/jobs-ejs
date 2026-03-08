const express = require("express");
const router = express.Router();
const csrf = require("host-csrf");

const csrfMiddleware = csrf.csrf();

const { 
    getJobsList, 
    addJob, 
    getEditJob, 
    getAddJob,
    updateJob, 
    deleteJob 
} = require("../controllers/jobs");

// Get all jobs and add a new job
router.route("/").get(getJobsList).post(csrfMiddleware, addJob);

// Get form to add a new job
router.route("/new").get(getAddJob);

// Edit and update a job
router.route("/edit/:id").get(getEditJob).post(csrfMiddleware, updateJob);

// Delete a job
router.route("/delete/:id").post(csrfMiddleware, deleteJob);


module.exports = router;