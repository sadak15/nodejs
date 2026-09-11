require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use('/books', require('./routes/books'));
app.use((err, req, res, next) => {
  res.status(err.type === 'entity.parse.failed' ? 400 : 500)
    .send(err.type === 'entity.parse.failed' ? 'Invalid JSON body' : 'Server error');
});
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/booksdb');
    app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Could not connect to MongoDB. Check MONGO_URI and that MongoDB is running.');
    process.exitCode = 1;
  }
}
if (require.main === module) start();
module.exports = app;
