import { NavLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="text-6xl font-bold text-brand">404</p>
        <h1 className="mt-3 text-2xl font-bold">Page not found</h1>
        <NavLink to="/" className="btn-primary mt-6">
          Back home
        </NavLink>
      </div>
    </main>
  );
}
