import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['pending', 'in progress', 'completed'], default: 'pending', required: true },
  dueDate: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
