import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import InputField from '../components/InputField.jsx';
import { login, isAuthenticated } from '../utils/auth.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!username.trim()) {
      errs.username = 'Please enter the admin username.';
    }
    if (!password) {
      errs.password = 'Please enter the admin password.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!validate()) return;

    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        const destination = location.state?.from?.pathname || '/admin';
        navigate(destination, { replace: true });
      } else {
        setAuthError(result.error || 'Access denied: Invalid credentials.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setAuthError('Authentication service temporarily unavailable. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Player Registration</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-12 h-12 bg-slate-900 text-teal-400 rounded-xl mx-auto flex items-center justify-center mb-3 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Admin Portal Login
            </h1>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Restricted area for tournament organizers and committee only
            </p>
          </div>

          {authError && (
            <div className="my-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs font-semibold text-rose-700 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-5">
            <InputField
              id="admin-username"
              name="username"
              type="text"
              label="Admin Username / Email"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
              }}
              error={errors.username}
              icon={User}
              required
              disabled={isLoading}
            />

            <div className="relative">
              <InputField
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Admin Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                error={errors.password}
                icon={Lock}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-admin-login-submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <span>Log In to Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice Box */}
          <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2 text-2xs text-slate-500">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-700 block">Restricted Access:</span>
              <span>
                Normal players and visitors cannot access this dashboard. Only the match organizer with valid credentials can log in.
              </span>
            </div>
          </div>

        </div>

        {/* Security Notice */}
        <p className="mt-4 text-center text-xs text-slate-400">
          NextGen Cricket 2026 • Secure Match Organizer Portal
        </p>

      </div>
    </div>
  );
}
