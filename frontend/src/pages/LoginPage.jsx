import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    // Attempt login
    setIsLoading(true);
    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setLocalError(result.error || 'Login failed');
    }
  };

  return (
    <MainLayout showHeader={false} showFooter={false}>
      {/* Full page with library background */}
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(61, 64, 61, 0.5) 0%, rgba(61, 64, 61, 0.7) 100%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuCAtuJqcDwI4mdHRVqIAcZayYdDGjD7CwQyWF8aezY6NDsJBCMNxjUeuezrGtdfhzH1RtAvcXTZQ2vHu_8cZ8HFxwV_-578qNoq1LVImkOSqlUeN0i3gn4g-kJolaNq52YEKF6smoFpmJUJkyXCGJKs8xkd1LmjmfDoK8JEECpQJDavbxD3RjBQNGsXKCd63DzY_TNlAPo9gPehRuJeQ-D0mIw4GSf9IYnVM6Mf1R-lgiZjWn-0XBX6cV2BwLL7b2iZWqvbFlLSrLI')",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Form Card */}
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold text-[var(--color-text-forest)] mb-2">
                Welcome Back
              </h1>
              <p className="text-[var(--color-text-charcoal)]">Login to access your library</p>
            </div>

            {/* Error Display */}
            {localError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {localError}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-forest)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 border border-[var(--color-accent-sage)]/30 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent focus:outline-none"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-forest)] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 border border-[var(--color-accent-sage)]/30 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent focus:outline-none"
                  required
                  minLength={6}
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2 rounded border-[var(--color-accent-sage)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-charcoal)]">Remember me</span>
                </label>
                {/* Uncomment and update the route below when password reset is implemented */}
                {/* <Link to="/reset-password" className="text-sm text-[var(--color-primary)] hover:underline">
                  Forgot password?
                </Link> */}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:bg-[var(--color-primary)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-[var(--color-text-charcoal)]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[var(--color-primary)] hover:underline font-medium">
                Sign up
              </Link>
            </p>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-[var(--color-text-charcoal)] hover:text-[var(--color-primary)]">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
