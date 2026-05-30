# Team Task Manager

Production-ready full stack Team Task Manager. It includes secure session authentication, MongoDB persistence, team membership, creator-only permissions, task assignment, filters, due date reminders, and a polished responsive dashboard.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Router DOM v6, Axios, React Hook Form, Zod
- Backend: Node.js, Express, TypeScript, ts-node, nodemon, Passport.js, express-session, connect-mongo, bcrypt, Joi, Mongoose
- Database: MongoDB

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB locally, MongoDB Atlas, or a MongoDB-compatible hosted database

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/team_task_manager
SESSION_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:5173
```

Optional frontend env:

```env
VITE_API_URL=http://localhost:4000/api
```

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start MongoDB locally:

   ```bash
   docker compose up -d
   ```

3. Configure `backend/.env` with your MongoDB `MONGODB_URI`.

4. MongoDB collections are created automatically by Mongoose. The migration command is a no-op:

   ```bash
   npm run db:migrate
   ```

5. Run frontend and backend:

   ```bash
   npm run dev
   ```

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000`

## Database Setup

MongoDB collections are managed through Mongoose schemas:

- `users`
- `sessions`
- `teams`
- `teammembers`
- `tasks`

Indexes are declared in the Mongoose schemas for email uniqueness, team membership uniqueness, task filters, due dates, and session storage.

## API Endpoints

| Method | Endpoint | Description | Protected |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Register a user and create a session | No |
| POST | `/api/auth/login` | Login with Passport LocalStrategy | No |
| POST | `/api/auth/logout` | Destroy current session | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/teams` | List teams for current user | Yes |
| POST | `/api/teams` | Create team | Yes |
| GET | `/api/teams/:id` | Get team and members | Yes |
| PUT | `/api/teams/:id` | Update team name, creator only | Yes |
| DELETE | `/api/teams/:id` | Delete team, creator only | Yes |
| POST | `/api/teams/:id/members` | Add registered member, creator only | Yes |
| DELETE | `/api/teams/:id/members/:userId` | Remove member, creator only | Yes |
| POST | `/api/teams/:id/invite` | Stub invite email | Yes |
| GET | `/api/tasks` | List tasks with filters | Yes |
| GET | `/api/tasks/reminders/due-soon` | Tasks due within 24 hours | Yes |
| POST | `/api/tasks` | Create task | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task, creator only | Yes |

Task filters: `?team_id=&assigned_to=&status=&priority=&search=`

## Security Notes

- Passwords are hashed with bcrypt using 12 salt rounds.
- Sessions use HTTP-only cookies.
- Production cookies use `secure: true` and `sameSite: none`.
- Sessions are stored in MongoDB through `connect-mongo`.
- Auth endpoints are rate limited.
- All write payloads are validated with Joi on the backend and Zod on the frontend.
- Database access uses Mongoose query APIs, with no raw string database queries.
- Password hashes are never returned by the API.

## Deployment Notes

1. Create a MongoDB database using MongoDB Atlas or another MongoDB-compatible provider.
2. Configure the backend service environment:

   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://USER:PASSWORD@HOST/team_task_manager
   SESSION_SECRET=<long-random-secret>
   FRONTEND_ORIGIN=https://your-frontend-domain
   ```

3. Run `npm run build`.
4. Deploy backend to Cloud Run or App Engine.
5. Build frontend with `npm run build --workspace frontend`.
6. Deploy `frontend/dist` to Firebase Hosting, Cloud Storage static hosting, or another GCP-compatible host.
