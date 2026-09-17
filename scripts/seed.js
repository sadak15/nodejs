require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const predefined = [
  { name: 'Food', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Housing', type: 'expense' },
  { name: 'Utilities', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Health', type: 'expense' },
  { name: 'Salary', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Investment', type: 'income' },
  { name: 'Other', type: 'both' }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/financetrackerdb', {
      serverSelectionTimeoutMS: 10000
    });
    for (const category of predefined) {
      // Running the seed again preserves any category a user has already customized.
      const doc = await Category.findOneAndUpdate(
        { name: category.name, owner: null },
        { $setOnInsert: category },
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
      console.log(`${doc._id}: ${doc.name}`);
    }
    console.log('Predefined categories are ready.');
  } catch (err) {
    console.error(`Seeding failed (${err.name}). Check MongoDB availability and MONGO_URI.`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
