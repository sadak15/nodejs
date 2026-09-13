const mongoose = require('mongoose');

const taskschema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  publishedYear: Number,
  genre: { type: String, trim: true }
});

module.exports = mongoose.model('Book', taskschema);
