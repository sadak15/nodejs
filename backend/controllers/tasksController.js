import Task from '../models/Task.js';

function handleError(err, res) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid task data' });
  }
  return res.status(500).json({ message: 'Server error' });
}

export const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    res.status(201).json(task);
  } catch (err) { handleError(err, res); }
};

export const listTasks = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (typeof req.query.status === 'string') filter.status = req.query.status;
    res.json(await Task.find(filter).sort({ createdAt: -1 }));
  } catch (err) { handleError(err, res); }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { handleError(err, res); }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { handleError(err, res); }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) { handleError(err, res); }
};
