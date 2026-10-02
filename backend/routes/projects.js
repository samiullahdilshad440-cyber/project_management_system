import { Router } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// READ all (with task progress)
router.get('/', async (req, res) => {
  const projects = await Project.find({ owner: req.user.id }).sort('-createdAt').lean();
  const counts = await Task.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.user.id) } },
    {
      $group: {
        _id: '$project',
        total: { $sum: 1 },
        done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
      },
    },
  ]);
  const map = Object.fromEntries(counts.map((c) => [c._id.toString(), c]));
  res.json(
    projects.map((p) => ({
      ...p,
      total: map[p._id]?.total || 0,
      done: map[p._id]?.done || 0,
    }))
  );
});

// CREATE
router.post('/', async (req, res) => {
  const { name, description, status, dueDate } = req.body;
  const project = await Project.create({
    name, description, status, dueDate: dueDate || null, owner: req.user.id,
  });
  res.status(201).json(project);
});

// READ one
router.get('/:id', async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, owner: req.user.id });
  project ? res.json(project) : res.status(404).json({ message: 'Project not found' });
});

// UPDATE
router.put('/:id', async (req, res) => {
  const { name, description, status, dueDate } = req.body;
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { name, description, status, dueDate: dueDate || null },
    { new: true, runValidators: true }
  );
  project ? res.json(project) : res.status(404).json({ message: 'Project not found' });
});

// DELETE (cascade tasks)
router.delete('/:id', async (req, res) => {
  const project = await Project.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!project) return res.status(404).json({ message: 'Project not found' });
  await Task.deleteMany({ project: project._id });
  res.json({ message: 'Deleted' });
});

export default router;