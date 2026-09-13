# tasks and JWT Authentication API

## Authentication setup

Add `JWT_SECRET` to your `.env` (keep your existing MongoDB settings). Generate
a random secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
Use the generated value as `JWT_SECRET`. See `.env.example` for the setting names.
The server requires a secret of at least 32 characters.

| Method | Route | Access |
| --- | --- | --- |
| POST | /auth/register | Public; returns token and user (201) |
| POST | /auth/login | Public; returns token and user (200) |
| GET | /auth/profile | Valid Bearer token required |
| GET | /admin/dashboard | Valid Bearer token and admin role required |

Register with JSON:

```json
{"name":"Ayaan","email":"ayaan@example.com","password":"123456"}
```

Login with `{"email":"ayaan@example.com","password":"123456"}`.
Copy the returned `token` and send `Authorization: Bearer <token>` when requesting
the profile or dashboard. Tokens expire after one hour; log in again for a new one.
Passwords are hashed with bcrypt and never included in responses.

Public registration creates a `user`; requesting `role: "admin"` is rejected.
To test admin access, register the account and run this trusted local command:

```sh
npm run promote-admin -- ayaan@example.com
```

Request `/admin/dashboard` with that account's token to receive the welcome message.
Roles are loaded from MongoDB on every protected request, so role changes take
effect immediately. A regular user receives 403, missing/invalid/expired tokens
receive 401, invalid input receives 400, and duplicate emails receive 409.
Existing `/tasks` routes remain public.

Run `npm test` for HTTP tests covering auth flows, password hashing, token validation,
and role changes. Tests use an isolated user-store stub; MongoDB persistence and its
unique email index require a running MongoDB instance for manual verification.

## tasks API

Install dependencies with `npm install`. Start MongoDB locally, or set `MONGO_URI`
in `.env` to your MongoDB connection string. See `.env.example` for local settings.
The default database is `tasksdb` and the default port is 4000.

Run `npm start` (or `npm run dev` for automatic restarts).

Run `npm run seed` to register four sample tasks in the configured database.
Existing tasks with the same title and author are preserved. The command prints
the document IDs for use in requests.

| Method | Route | Result |
| --- | --- | --- |
| POST | /tasks | Create a book (201) |
| GET | /tasks | List tasks (200) |
| GET | /tasks/:id | Read one book (200) |
| PUT | /tasks/:id | Update supplied fields (200) |
| DELETE | /tasks/:id | Delete a book (200) |

Send JSON with `Content-Type: application/json`. Example POST body:

```json
{
  "title": "Deep Work",
  "author": "Cal Newport",
  "publishedYear": 2016,
  "genre": "productivity"
}
```

Copy the returned MongoDB `_id` into the read, update, and delete URLs.
For PUT, try `{"title":"Updated Title"}`; omitted fields are preserved.
Title and author are required on creation and cannot be cleared on update.
Invalid data or IDs return 400, missing tasks return 404, and database errors
return 500 with `Server error`.

Bonus queries: `/tasks/search?genre=fiction`, `/tasks?year=2022`, and
`/tasks/search?author=cal` (case-insensitive author substring).
