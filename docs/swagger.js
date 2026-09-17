const swaggerJsdoc = require('swagger-jsdoc');

const servers = [{ url: `http://localhost:${process.env.PORT || 4000}`, description: 'Local' }];
if (process.env.RENDER_URL) servers.push({ url: process.env.RENDER_URL, description: 'Production' });

const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personal Finance Tracker API',
      version: '1.0.0',
      description: 'Track income, expenses, and categories with JWT-authenticated accounts.'
    },
    servers,
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    tags: [
      { name: 'Auth' }, { name: 'Transactions' }, { name: 'Categories' }, { name: 'Upload' }, { name: 'Admin' }
    ]
  },
  apis: ['./routes/*.js']
});

module.exports = spec;
