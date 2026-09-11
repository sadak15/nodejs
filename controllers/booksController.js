const Book = require('../models/Book');

function handleError(err, res) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).send('Invalid book data');
  }
  return res.status(500).send('Server error');
}

// Accept book fields only, never MongoDB update operators.
function bookFields(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  const data = {};
  for (const field of ['title', 'author', 'publishedYear', 'genre']) {
    if (Object.hasOwn(body, field)) data[field] = body[field];
  }
  return data;
}

exports.createBook = async (req, res) => {
  try {
    res.status(201).json(await Book.create(bookFields(req.body)));
  } catch (err) { handleError(err, res); }
};

exports.getBooks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.year !== undefined) {
      if (typeof req.query.year !== 'string' || !req.query.year.trim() || !Number.isFinite(Number(req.query.year))) {
        return res.status(400).send('Year must be a number');
      }
      filter.publishedYear = Number(req.query.year);
    }
    if (req.query.genre !== undefined) {
      if (typeof req.query.genre !== 'string' || !req.query.genre.trim()) {
        return res.status(400).send('Genre must be a non-empty string');
      }
      filter.genre = req.query.genre.trim();
    }
    if (req.query.author !== undefined) {
      if (typeof req.query.author !== 'string' || !req.query.author.trim()) {
        return res.status(400).send('Author must be a non-empty string');
      }
      const escaped = req.query.author.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.author = { $regex: escaped, $options: 'i' };
    }
    res.json(await Book.find(filter));
  } catch (err) { handleError(err, res); }
};

exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.json(book);
  } catch (err) { handleError(err, res); }
};

exports.updateBook = async (req, res) => {
  try {
    const data = bookFields(req.body);
    if (!Object.keys(data).length) return res.status(400).send('Provide at least one book field');
    const book = await Book.findByIdAndUpdate(req.params.id, { $set: data }, {
      new: true, // Return the updated document.
      runValidators: true
    });
    if (!book) return res.status(404).send('Book not found');
    res.json(book);
  } catch (err) { handleError(err, res); }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).send('Book not found');
    res.status(200).send(`Book with id ${req.params.id} deleted`);
  } catch (err) { handleError(err, res); }
};
