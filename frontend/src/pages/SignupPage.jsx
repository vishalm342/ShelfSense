import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../store/authStore';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const signUp = useAuthStore((state) => state.signUp);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Validation
    if (!email || !password || !confirmPassword) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setLocalError('You must accept the terms and conditions');
      return;
    }

    // Attempt signup
    setIsLoading(true);
    const result = await signUp(email, password, firstName, lastName);
    setIsLoading(false);

    if (result.success) {
      // Show success message and redirect to dashboard
      navigate('/dashboard');
    } else {
      setLocalError(result.error || 'Signup failed');
    }
  };

  return (
    <MainLayout showHeader={false} showFooter={false}>
      {/* Full page with library background */}
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center relative py-12"
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
                Join ShelfSense
              </h1>
              <p className="text-[var(--color-text-charcoal)]">
                Start building your perfect library today
              </p>
            </div>

            {/* Error Display */}
            {localError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {localError}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-forest)] mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-2 border border-[var(--color-accent-sage)]/30 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-forest)] mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-4 py-2 border border-[var(--color-accent-sage)]/30 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-forest)] mb-1">
                  Email Address *
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
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 6 characters)"
                    className="w-full px-4 py-2 pr-10 border border-[var(--color-accent-sage)]/30 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent focus:outline-none"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-charcoal)] hover:text-[var(--color-primary)]"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-1 text-xs">
                    <span
                      className={
                        password.length >= 8
                          ? 'text-green-600'
                          : password.length >= 6
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }
                    >
                      {password.length >= 8
                        ? '✓ Strong password'
                        : password.length >= 6
                        ? '✓ Good password'
                        : '✗ Weak password'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-forest)] mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full px-4 py-2 border border-[var(--color-accent-sage)]/30 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent focus:outline-none"
                  required
                  minLength={6}
                />
                {confirmPassword && (
                  <div className="mt-1 text-xs">
                    <span className={password === confirmPassword ? 'text-green-600' : 'text-red-600'}>
                      {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 mr-2 rounded border-[var(--color-accent-sage)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  required
                />
                <label htmlFor="terms" className="text-sm text-[var(--color-text-charcoal)] cursor-pointer">
                  I agree to the{' '}
                  <Link to="#" className="text-[var(--color-primary)] hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="#" className="text-[var(--color-primary)] hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold hover:bg-[var(--color-primary)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-[var(--color-text-charcoal)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--color-primary)] hover:underline font-medium">
                Login
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
