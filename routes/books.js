const express = require('express');
const mongoose = require('mongoose');
const { createBook, gettasks, getBook, updateBook, deleteBook } = require('../controllers/tasksController');
const router = express.Router();

router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).send('Invalid book id');
  next();
});

router.post('/', createBook);
router.get('/', gettasks);
// Search must come before /:id.
router.get('/search', gettasks);
router.get('/:id', getBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

module.exports = router;
