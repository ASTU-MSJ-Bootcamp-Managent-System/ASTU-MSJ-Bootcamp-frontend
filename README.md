# ASTU MSJ Summer Bootcamp frontend

React + Vite + Tailwind frontend for the Bootcamp Management System. Configure `VITE_API_URL` from `.env.example`, then run `npm install` and `npm run dev`.

## API assumptions

The client sends JSON and JWTs as `Authorization: Bearer <token>`. Authentication endpoints are `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password/:token`, and `/auth/change-password`. Resource modules use REST endpoints under `/users`, `/batches`, `/attendance`, `/progress`, `/assignments`, `/submissions`, and `/announcements`. Login is deliberately able to run in a UI-only demo mode only when `VITE_API_URL` is unset; setting it uses the API and surfaces its errors.
