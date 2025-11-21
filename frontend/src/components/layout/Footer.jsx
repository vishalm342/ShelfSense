import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/30 border-t border-[var(--color-accent-sage)]/20 font-sans">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <BookOpen className="text-[var(--color-text-forest)] text-2xl" />
              <h2 className="font-display text-[var(--color-text-forest)] text-xl font-bold">ShelfSense</h2>
            </div>
            <p className="mt-4 text-sm text-[var(--color-text-charcoal)]">Intelligent book recommendations for the modern reader.</p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-forest)]">Navigate</h3>
            <ul className="mt-4 space-y-2">
              <li><a className="text-sm text-[var(--color-text-charcoal)] hover:text-[var(--color-primary)]" href="#about">About</a></li>
              <li><a className="text-sm text-[var(--color-text-charcoal)] hover:text-[var(--color-primary)]" href="#features">Features</a></li>
              <li><a className="text-sm text-[var(--color-text-charcoal)] hover:text-[var(--color-primary)]" href="#testimonials">Testimonials</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-forest)]">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link className="text-sm text-[var(--color-text-charcoal)] hover:text-[var(--color-primary)]" to="#">Privacy Policy</Link></li>
              <li><Link className="text-sm text-[var(--color-text-charcoal)] hover:text-[var(--color-primary)]" to="#">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--color-text-forest)]">Connect</h3>
            <p className="mt-4 text-sm text-[var(--color-text-charcoal)]">Sign up for our newsletter</p>
            <form
              className="mt-2 flex"
              onSubmit={e => {
                e.preventDefault();
                // TODO: Implement subscription logic here
                alert('Thank you for subscribing!');
              }}
            >
              <input
                className="w-full rounded-l-md border border-[var(--color-accent-sage)]/30 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] focus:outline-none"
                placeholder="Your Email"
                type="email"
              />
              <button
                className="rounded-r-md bg-[var(--color-primary)] px-3 text-white transition-colors hover:bg-[var(--color-primary)]/90"
                type="submit"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-[var(--color-accent-sage)]/20 pt-8 text-center text-sm text-[var(--color-text-charcoal)]">
          <p>© 2024 ShelfSense. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
