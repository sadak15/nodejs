import 'dotenv/config';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import tasksRoutes from './routes/tasks.js';
import transactionsRoutes from './routes/transactions.js';
import uploadRoutes from './routes/upload.js';
import usersRoutes from './routes/users.js';

import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notfound.js';
import { limiter } from './middlewares/rateLimiter.js';
import { getSecret } from './utils/generateToken.js';
import { swaggerSpec } from './utils/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json());

const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173'];
if (process.env.CLIENT_URL_PROD) allowedOrigins.push(process.env.CLIENT_URL_PROD);
app.use(cors({ origin: allowedOrigins }));

app.use(limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is working' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    getSecret();
    await mongoose.connect(process.env.NODE_ENV === 'development' ? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PRO);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  }
}

start();

export default app;
