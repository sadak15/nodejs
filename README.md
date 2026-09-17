# Personal Finance Tracker API

Track income, expenses, and categories behind JWT-authenticated accounts,
with profile picture uploads, monthly summaries, and an admin overview.

## Setup

Copy `.env.example` to `.env` and fill in the values:

```
MONGO_URI=mongodb://127.0.0.1:27017/financetrackerdb
PORT=4000
JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RENDER_URL=
```

Generate a JWT secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
The server requires a secret of at least 32 characters. `CLOUDINARY_*` values come
from your [Cloudinary](https://cloudinary.com) dashboard and are only needed for the
profile picture upload route. `RENDER_URL` is optional; when set, it is added as a
second server entry in the Swagger docs.

Install dependencies with `npm install`, then start MongoDB locally (or point
`MONGO_URI` at a hosted instance). Run `npm start` (or `npm run dev` for automatic
restarts). Run `npm run seed` to populate predefined categories.

Interactive API docs are served at `/docs` (Swagger UI) with a Bearer auth
scheme, grouped by tag: `Auth`, `Transactions`, `Categories`, `Upload`, `Admin`.

## Auth

| Method | Route | Access |
| --- | --- | --- |
| POST | /auth/register | Public; returns token and user (201) |
| POST | /auth/login | Public; returns token and user (200) |
| GET | /auth/profile | Bearer token required |

Register with `{"name":"Ayaan","email":"ayaan@example.com","password":"123456"}`.
Public registration always creates a `user`; requesting `role: "admin"` is rejected.
Passwords are hashed with bcrypt and never included in responses. Tokens expire
after one hour. To test admin routes, register an account and run:

```sh
npm run promote-admin -- ayaan@example.com
```

Roles are loaded from MongoDB on every protected request, so role changes take
effect immediately.

## Transactions

All routes require `Authorization: Bearer <token>` and are scoped to the
authenticated user.

| Method | Route | Result |
| --- | --- | --- |
| POST | /transactions | Add an income/expense transaction (201) |
| GET | /transactions | List the user's transactions (200); filter with `?type=` or `?category=` |
| GET | /transactions/monthly-summary | Totals per category for a month (200); `?month=&year=` default to the current month |
| GET | /transactions/:id | Read one transaction (200) |
| PUT | /transactions/:id | Update supplied fields (200) |
| DELETE | /transactions/:id | Remove a transaction (200) |

Example POST body:

```json
{
  "title": "Groceries",
  "amount": 50,
  "type": "expense",
  "category": "Food",
  "date": "2025-05-27"
}
```

Requests are validated with Zod; invalid input returns 400 with a list of field
errors. IDs belonging to another user return 404, malformed IDs return 400.

## Categories

| Method | Route | Result |
| --- | --- | --- |
| GET | /categories | List predefined categories plus the user's custom ones |
| POST | /categories | Create a custom category (`{"name":"Side Hustle","type":"income"}`) |

`type` is one of `income`, `expense`, or `both`. Duplicate names for the same
owner return 409.

## Upload

| Method | Route | Result |
| --- | --- | --- |
| POST | /upload/profile-picture | Upload an avatar image, stores it on Cloudinary |

Send `multipart/form-data` with an `image` field (JPEG/PNG/WEBP, up to 5MB).
Returns `{"avatarUrl": "..."}` and updates the user's stored avatar. Returns 503
if Cloudinary credentials are not configured.

## Admin

| Method | Route | Result |
| --- | --- | --- |
| GET | /admin/dashboard | Welcome message; admin role required |
| GET | /admin/overview | Total user count and top spending categories across all users; admin role required |

## Security & middleware

- `helmet` for HTTP header hardening, `cors` for cross-origin requests
- Rate limiting: 100 requests/15min globally, 20 requests/15min on
  `/auth/register` and `/auth/login`
- Request logging to stdout
- Zod validation on all write routes and query parameters
- Centralized 404 and error handlers; database and unexpected errors return a
  generic 500

## Testing

Run `npm test` for HTTP tests covering auth, transactions, and categories.
Tests stub Mongoose model methods with an in-memory store and exercise the real
Express app (including all middleware) over HTTP; a running MongoDB instance is
only needed for manual verification and the unique email/category indexes.

## Deployment (Render)

1. Push this repo to GitHub and create a new Web Service on
   [Render](https://render.com) pointing at it.
2. Set the build command to `npm install` and the start command to `npm start`.
3. Add `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
   and `CLOUDINARY_API_SECRET` as environment variables in the Render dashboard.
4. Once deployed, set `RENDER_URL` to the assigned `https://*.onrender.com` URL
   so it appears as a server option in `/docs`.
