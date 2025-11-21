import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Header = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto w-full max-w-5xl rounded-lg border border-white/20 bg-white/70 px-6 py-3 font-sans text-sm backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <BookOpen className="text-[var(--color-text-forest)] text-2xl" />
            <h2 className="font-display text-[var(--color-text-forest)] text-xl font-bold">ShelfSense</h2>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="font-medium text-[var(--color-text-forest)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Dashboard
                </Link>
                <Link
                  to="/search"
                  className="font-medium text-[var(--color-text-forest)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Search
                </Link>
                <Link
                  to="/library"
                  className="font-medium text-[var(--color-text-forest)] transition-colors hover:text-[var(--color-primary)]"
                >
                  Library
                </Link>
              </>
            ) : (
              <>
                <a
                  className="font-medium text-[var(--color-text-forest)] transition-colors hover:text-[var(--color-primary)]"
                  href="#about"
                >
                  About
                </a>
                <a
                  className="font-medium text-[var(--color-text-forest)] transition-colors hover:text-[var(--color-primary)]"
                  href="#features"
                >
                  Features
                </a>
                <a
                  className="font-medium text-[var(--color-text-forest)] transition-colors hover:text-[var(--color-primary)]"
                  href="#testimonials"
                >
                  Testimonials
                </a>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[var(--color-primary)] text-white font-bold leading-normal tracking-wide shadow-sm transition-transform hover:scale-105"
              >
                <span className="truncate">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 border border-[var(--color-primary)] text-[var(--color-primary)] font-bold leading-normal tracking-wide transition-colors hover:bg-[var(--color-primary)]/10"
                >
                  <span className="truncate">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[var(--color-primary)] text-white font-bold leading-normal tracking-wide shadow-sm transition-transform hover:scale-105"
                >
                  <span className="truncate">Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
