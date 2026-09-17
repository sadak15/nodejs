require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const { logger } = require('./middlewares/logger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', require('./routes/auth'));
app.use('/categories', require('./routes/categories'));
app.use('/transactions', require('./routes/transactions'));
app.use('/upload', require('./routes/upload'));
app.use('/admin', require('./routes/admin'));

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    require('./utils/generateToken').getSecret();
    await mongoose.connect(process.env.NODE_ENV == "development"? process.env.MONGO_URI_DEV : process.env.MONGO_URI_PRO );
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
