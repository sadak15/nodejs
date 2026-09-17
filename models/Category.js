const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ['income', 'expense', 'both'], default: 'both' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true }
}, { timestamps: true });

categorySchema.index({ owner: 1, name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

module.exports = mongoose.model('Category', categorySchema);
