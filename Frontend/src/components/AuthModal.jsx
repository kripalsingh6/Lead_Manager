import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { apiRequest, setStoredToken, setStoredUser } from '../api/client';

export const AuthModal = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialEmail = '',
  defaultIsLogin = true
}) => {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [formData, setFormData] = useState({
    name: '',
    email: initialEmail || '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '61538607867-ushk55llj8l2rjucurf2m2m9qlil6mjl.apps.googleusercontent.com';

  const handleGoogleCredentialResponse = async (response) => {
    if (!response || !response.credential) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken: response.credential })
      });
      if (res.data?.token && res.data?.user) {
        setStoredToken(res.data.token);
        setStoredUser(res.data.user);
        onAuthSuccess(res.data.user, false);
        onClose();
      }
    } catch (err) {
      setError('Google Sign-In verification failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsLogin(defaultIsLogin);
      if (initialEmail) {
        setFormData((prev) => ({ ...prev, email: initialEmail }));
      }
      setError('');

      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false
          });
        } catch (e) {
          console.warn('GIS init error:', e);
        }
      }
    }
  }, [isOpen, initialEmail, defaultIsLogin]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-flight client-side validation for minimum password length
    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const cleanEmail = formData.email.trim();
      const payload = isLogin
        ? { email: cleanEmail, password: formData.password }
        : {
            name: formData.name ? formData.name.trim() : undefined,
            email: cleanEmail,
            password: formData.password
          };

      const res = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.data?.token && res.data?.user) {
        setStoredToken(res.data.token);
        setStoredUser(res.data.user);
        onAuthSuccess(res.data.user, !isLogin);
        onClose();
      }
    } catch (err) {
      let errorMsg = err.message || 'Authentication failed. Please check credentials.';
      // Surface specific nested validation field errors from backend if available
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        errorMsg = err.errors.map((e) => e.message).join('. ');
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError('');

    try {
      if (window.google?.accounts?.oauth2) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setError(`Google Sign-In failed: ${tokenResponse.error_description || tokenResponse.error}`);
              setIsLoading(false);
              return;
            }
            if (tokenResponse.access_token) {
              try {
                const res = await apiRequest('/auth/google', {
                  method: 'POST',
                  body: JSON.stringify({ accessToken: tokenResponse.access_token })
                });
                if (res.data?.token && res.data?.user) {
                  setStoredToken(res.data.token);
                  setStoredUser(res.data.user);
                  onAuthSuccess(res.data.user, false);
                  onClose();
                }
              } catch (err) {
                setError('Google verification failed: ' + (err.message || 'Unknown error'));
              } finally {
                setIsLoading(false);
              }
            } else {
              setIsLoading(false);
            }
          }
        });
        client.requestAccessToken();
        return;
      }

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const backendBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
            window.location.href = `${backendBase}/api/auth/google`;
          }
        });
        setIsLoading(false);
        return;
      }

      const backendBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
      window.location.href = `${backendBase}/api/auth/google`;
    } catch (e) {
      console.error('Google auth error:', e);
      setError('Unable to initiate Google Sign-In. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card auth-modal-card">
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{isLogin ? 'Welcome back' : 'Create an account'}</h3>
            <p className="modal-subtitle">
              {isLogin
                ? 'Sign in to access your lead dashboard'
                : 'Sign up to start tracking and managing leads'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="modal-alert-banner">
            <AlertCircle size={16} className="alert-icon" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>{error}</span>
              {error.includes('already exists') && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#5846f6', textDecoration: 'underline', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 12 }}
                  onClick={() => { setIsLogin(true); setError(''); }}
                >
                  Click here to Sign In with this email
                </button>
              )}
              {error.includes('Invalid email or password') && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#5846f6', textDecoration: 'underline', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: 12 }}
                  onClick={() => { setIsLogin(false); setError(''); }}
                >
                  New here? Click here to Create an Account
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">Full Name (Optional)</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  placeholder="e.g. Kripal Singh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={isLogin ? 1 : 6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-input"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>
            {!isLogin && (
              <span style={{ display: 'block', marginTop: 4, color: '#94a3b8', fontSize: 11 }}>
                Must be at least 6 characters
              </span>
            )}
          </div>

          <button type="submit" className="btn-modal-primary w-full" disabled={isLoading}>
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          {/* Single Google OAuth Button */}
          <button
            type="button"
            className="btn-google-auth"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="auth-toggle-footer">
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>{' '}
            <button
              type="button"
              className="btn-toggle-auth"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

