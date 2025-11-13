import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-slate-400">The page you are looking for could not be found.</p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80"
      >
        Go back home
      </Link>
    </div>
  );
}
