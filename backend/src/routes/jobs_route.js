// define the routing of the jobs
const express = require('express');
const jobsController = require('../controller/jobs_controller');

const router = express.Router();

router.get('/', jobsController.getJobs);
router.post('/', jobsController.createJob);
router.patch('/:id/status', jobsController.updateStatus);
router.delete('/:id', jobsController.deleteJob);

module.exports = router;

