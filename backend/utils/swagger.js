import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swaggerJsdoc from 'swagger-jsdoc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const servers = [{
  url: (process.env.NODE_ENV == 'development' ? `http://localhost:${process.env.PORT || 4000}` : process.env.RENDER_URL) + '/api'
}];

export const swaggerSpec = swaggerJsdoc({
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
      { name: 'Auth' }, { name: 'Users' }, { name: 'Transactions' }, { name: 'Tasks' }, { name: 'Categories' }, { name: 'Upload' }, { name: 'Admin' }
    ]
  },
  apis: [path.join(__dirname, '../routes/*.js').split(path.sep).join('/')]
});
