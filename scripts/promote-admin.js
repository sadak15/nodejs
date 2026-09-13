require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error('Usage: npm run promote-admin -- user@example.com');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tasksdb');
  const user = await User.findOneAndUpdate({ email }, { $set: { role: 'admin' } }, { new: true, runValidators: true });
  if (!user) throw new Error('User not found. Register the account first.');
  console.log(`Promoted ${user.email} to admin`);
}

main().catch(err => { console.error(err.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
