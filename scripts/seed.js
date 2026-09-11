require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('../models/Book');

const samples = [
  { title: 'Atomic Habits', author: 'James Clear', publishedYear: 2018, genre: 'self-help' },
  { title: 'Deep Work', author: 'Cal Newport', publishedYear: 2016, genre: 'productivity' },
  { title: 'The Hobbit', author: 'J. R. R. Tolkien', publishedYear: 1937, genre: 'fiction' },
  { title: 'Sample Adventure', author: 'Ayaan Ali', publishedYear: 2022, genre: 'fiction' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/booksdb', {
      serverSelectionTimeoutMS: 10000
    });
    for (const sample of samples) {
      // Running the seed again preserves existing books and their edits.
      const book = await Book.findOneAndUpdate(
        { title: sample.title, author: sample.author },
        { $setOnInsert: sample },
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
      console.log(`${book._id}: ${book.title}`);
    }
    console.log('Sample books are ready.');
  } catch (err) {
    console.error(`Seeding failed (${err.name}). Check MongoDB availability and MONGO_URI.`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
