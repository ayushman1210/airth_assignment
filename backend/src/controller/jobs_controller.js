const jobModel = require('../models/jobs');

const allowedStatuses = ['pending', 'running', 'completed', 'failed'];
const statusTransitions = {
    pending: ['__no_previous_status__'],
    running: ['pending'],
    completed: ['running'],
    failed: ['running']
};

function validId(id) {
    return /^\d+$/.test(id) && Number(id) > 0;
}

async function getJobs(req, res, next) {
    try {
        res.status(200).json(await jobModel.getAll());
    } catch (error) {
        next(error);
    }
}

async function createJob(req, res, next) {
    try {
        const { title, type, status } = req.body;
        if (!title || !type) {
            return res.status(400).json({ message: 'title and type are required' });
        }
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'invalid status' });
        }
        return res.status(201).json(await jobModel.create({ title, type, status }));
    } catch (error) {
        next(error);
    }
}

async function updateStatus(req, res, next) {
    try {
        const { status } = req.body;
        if (!validId(req.params.id)) {
            return res.status(400).json({ message: 'invalid job id' });
        }

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'status must be pending, running, completed or failed' });
        }
        const updated = await jobModel.updateStatus(req.params.id, status, statusTransitions[status]);

        if (!updated) {
            const job = await jobModel.findById(req.params.id);

            if (!job) {
                return res.status(404).json({ message: 'job not found' });
            }

            return res.status(409).json({ message: `cannot change status from ${job.status} to ${status}` });
        }
        return res.json({ message: 'job status updated' });
    } catch (error) {
        next(error);
    }
}

async function deleteJob(req, res, next) {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({ message: 'invalid job id' });
        }
        const deleted = await jobModel.remove(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'job not found' });
        }
        return res.json({ message: 'job deleted' });
    } catch (error) {
        next(error);
    }
}

module.exports = { getJobs, createJob, updateStatus, deleteJob };