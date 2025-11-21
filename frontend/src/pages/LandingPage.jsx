import { Link } from 'react-router-dom';
import { Library, Brain, ThumbsUp, Network, Bell, Smile, Compass } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import useAuthStore from '../store/authStore';

const LandingPage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section
          className="relative flex h-screen min-h-[700px] w-full items-end justify-center bg-cover bg-center p-6 pt-24 md:items-center md:p-10"
          style={{
            backgroundImage: "linear-gradient(rgba(61, 64, 61, 0.4) 0%, rgba(61, 64, 61, 0.7) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCAtuJqcDwI4mdHRVqIAcZayYdDGjD7CwQyWF8aezY6NDsJBCMNxjUeuezrGtdfhzH1RtAvcXTZQ2vHu_8cZ8HFxwV_-578qNoq1LVImkOSqlUeN0i3gn4g-kJolaNq52YEKF6smoFpmJUJkyXCGJKs8xkd1LmjmfDoK8JEECpQJDavbxD3RjBQNGsXKCd63DzY_TNlAPo9gPehRuJeQ-D0mIw4GSf9IYnVM6Mf1R-lgiZjWn-0XBX6cV2BwLL7b2iZWqvbFlLSrLI')"
          }}
        >
          <div className="flex max-w-3xl flex-col gap-6 text-center text-white">
            <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl text-white">
              Discover Your Next Favorite Book, Intelligently.
            </h1>
            <p className="font-sans text-lg text-gray-200 md:text-xl">
              Our AI-powered recommendation engine helps you find hidden gems and curate the perfect library tailored to your unique taste.
            </p>
            <div className="flex justify-center">
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[var(--color-primary)] text-white font-bold leading-normal tracking-wide shadow-lg transition-transform hover:scale-105"
              >
                <span className="truncate">{user ? 'Go to Dashboard' : 'Get Started For Free'}</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24 lg:px-8">
          {/* About Section */}
          <section className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 items-center" id="about">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-4xl font-bold">A New Chapter in Reading</h2>
              <p className="leading-relaxed">
                ShelfSense is on a mission to reconnect readers with the magic of discovery. We believe the perfect book is out there waiting for you, and our intelligent platform is designed to make that introduction.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 shadow-sm">
                <p className="text-base font-medium">Books Analyzed</p>
                <p className="text-[var(--color-primary)] tracking-light font-display text-4xl font-bold">1M+</p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 shadow-sm">
                <p className="text-base font-medium">Happy Readers</p>
                <p className="text-[var(--color-primary)] tracking-light font-display text-4xl font-bold">95%</p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 sm:py-24">
            <h2 className="text-center font-display text-4xl font-bold">How It Works</h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                  <Library size={24} />
                </div>
                <h3 className="font-display text-xl font-bold">1. Curate Your Shelf</h3>
                <p>Add books you've loved, liked, or want to read to build your unique taste profile.</p>
              </div>
              <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                  <Brain size={24} />
                </div>
                <h3 className="font-display text-xl font-bold">2. AI Analyzes Taste</h3>
                <p>Our intelligent engine analyzes your collection for themes, genres, and writing styles.</p>
              </div>
              <div className="flex flex-col gap-4 rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                  <ThumbsUp size={24} />
                </div>
                <h3 className="font-display text-xl font-bold">3. Receive Personal Picks</h3>
                <p>Get bespoke recommendations delivered to you, perfectly matched to your preferences.</p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 sm:py-24" id="features">
            <h2 className="text-center font-display text-4xl font-bold">Features Crafted for Collectors</h2>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
              <div className="flex items-start gap-4 rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 shadow-sm">
                <div className="flex-shrink-0 text-[var(--color-primary)]">
                  <Network size={32} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">Deep Genre Analysis</h3>
                  <p className="mt-1">Go beyond simple genres. We analyze sub-genres, tropes, and narrative structures.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 shadow-sm">
                <div className="flex-shrink-0 text-[var(--color-primary)]">
                  <Bell size={32} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">First Edition Alerts</h3>
                  <p className="mt-1">For the true collector, get notified when rare and first editions of your favorite books become available.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 shadow-sm">
                <div className="flex-shrink-0 text-[var(--color-primary)]">
                  <Smile size={32} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">Mood-Based Recommendations</h3>
                  <p className="mt-1">Looking for a heartwarming tale or a thrilling mystery? Find books that match your current mood.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 shadow-sm">
                <div className="flex-shrink-0 text-[var(--color-primary)]">
                  <Compass size={32} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">Author Discovery Engine</h3>
                  <p className="mt-1">Love an author's style? We'll find similar voices, both classic and contemporary.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-16 sm:py-24" id="testimonials">
            <h2 className="text-center font-display text-4xl font-bold">What Our Readers Are Saying</h2>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 shadow-sm">
                <p className="flex-grow italic">
                  "ShelfSense rediscovered my love for reading. The recommendations are scarily accurate and have introduced me to authors I never would have found."
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBiw91SEZryyOEMxRYTh_4EVH_w5TXBngNsD1XNzG4T6_vNxvtAPY19GwCU6-h6xk2ZarOvp55rTWmLJ2DESMlDTu0_hu2GaRjfI7R_0tyo1kO5ckSjgKuEwgHTCgb1BSvJlhnLnh65TEKHbcVEeW9lZqSTuHDs4wOXhfSiaHkQfcDCsSQ-2Hc0ElaEIrHJlPwpwZfAdCfsbvTSriXC9n7EHoA2P_i-OixqgInPkQqvmfIlqft6R3dkVfuDyEbf_br1aU3lToVAWY"
                    alt="Alex Chen"
                  />
                  <div>
                    <p className="font-semibold">Alex Chen</p>
                    <p className="text-sm text-[var(--color-accent-sage)]">Beta User</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 shadow-sm">
                <p className="flex-grow italic">
                  "As a collector, the first edition alerts are a game-changer. This is more than a recommendation app; it's an essential tool for any serious bibliophile."
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHeLOX_TRDZDXBa_grmyTfuVHuhH1N-StsVFIrjViQTvWxnRd4tRZshkbOSW9OznBibjrLE8Ytius3K3TG4y3LmbmjmPhClndwemaeQUnhEKptSr-7Ft5YCU1EKXxl16neE4RTf2J4j5if28Rj1MtOoOtc8NmdTf4TRzW0RprBTfeyHU1CRmYC9aCHLzki4FwWGJaott_HeU9t-zcG12DSNPAT__fBGGBjc9IIqdsdmd56zGkfxUjepZgGSbtajnuD1dCl7ZknyVA"
                    alt="Maria Rodriguez"
                  />
                  <div>
                    <p className="font-semibold">Maria Rodriguez</p>
                    <p className="text-sm text-[var(--color-accent-sage)]">Book Influencer</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-lg border border-[var(--color-accent-sage)]/30 bg-white/50 p-6 shadow-sm">
                <p className="flex-grow italic">
                  "The mood-based feature is brilliant. I can always find the exact type of story I'm in the mood for after a long day. Highly recommend!"
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeWArt2yP8-82qd1se8vjebhFJ043I6T5OPrXKW8fT0uxyYcUNfqOwLma8MICQ73OcTTMfZ4dEkZH3x1kdQEI2vDPxJH9lmZpki4afUg2x9iijjC3eBlswl8SRK7eW03FQFqaF7hYO_MveuvwedpNV33BLt8fAZVu6GFsR2EvZqiHx8z6_JE8V9ts0aIpzFsYww4ODMto2DbVwkyqW_D21Ep8xQ-GtMnJ276z7daDIzC-F8FevzO8Q1tdj8fUDxzl5ytstUhImRTU"
                    alt="David Lee"
                  />
                  <div>
                    <p className="font-semibold">David Lee</p>
                    <p className="text-sm text-[var(--color-accent-sage)]">Avid Reader</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="rounded-lg bg-[var(--color-accent-sage)]/80 p-10 my-16 sm:my-24 text-center">
            <h2 className="font-display text-white text-4xl font-bold">Ready to Build Your Perfect Library?</h2>
            <p className="mt-3 text-white/90 max-w-xl mx-auto">
              Join ShelfSense today and unlock a universe of books curated just for you.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to={user ? '/dashboard' : '/signup'}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[var(--color-primary)] text-white font-bold leading-normal tracking-wide shadow-lg transition-transform hover:scale-105"
              >
                <span className="truncate">{user ? 'Go to Dashboard' : 'Get Started for Free'}</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
