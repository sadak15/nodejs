require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/tasks', require('./routes/tasks'));
app.use((err, req, res, next) => {
  res.status(err.type === 'entity.parse.failed' ? 400 : 500)
    .json({ message: err.type === 'entity.parse.failed' ? 'Invalid JSON body' : 'Server error' });
});
async function start() {
  try {
    require('./utils/generateToken').getSecret();
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tasksdb');
    await require('./models/User').init();
    app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup failed. Check JWT_SECRET, MONGO_URI, and that MongoDB is running.');
    await mongoose.disconnect();
    process.exitCode = 1;
  }
}
if (require.main === module) start();
module.exports = app;
