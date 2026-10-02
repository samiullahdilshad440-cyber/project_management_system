import { Router } from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// READ tasks of a project
router.get('/project/:projectId', async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId, owner: req.user.id }).sort('-createdAt');
  res.json(tasks);
});

// CREATE
router.post('/', async (req, res) => {
  const { title, description, status, priority, dueDate, project } = req.body;
  const parent = await Project.findOne({ _id: project, owner: req.user.id });
  if (!parent) return res.status(404).json({ message: 'Project not found' });
  const task = await Task.create({
    title, description, status, priority, dueDate: dueDate || null, project, owner: req.user.id,
  });
  res.status(201).json(task);
});

// UPDATE
router.put('/:id', async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { title, description, status, priority, dueDate: dueDate || null },
    { new: true, runValidators: true }
  );
  task ? res.json(task) : res.status(404).json({ message: 'Task not found' });
});

// DELETE
router.delete('/:id', async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  task ? res.json({ message: 'Deleted' }) : res.status(404).json({ message: 'Task not found' });
});

export default router;