const swaggerJsdoc = require('swagger-jsdoc');

const servers = [{
  url: process.env.NODE_ENV == 'development' ? `http://localhost:${process.env.PORT || 4000}` : process.env.RENDER_URL
}];

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
