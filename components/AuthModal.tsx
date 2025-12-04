import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, AlertCircle, ArrowLeft, CheckCircle2, User, AtSign } from 'lucide-react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

type AuthMode = 'login' | 'register' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const userProfile = await authService.loginWithGoogle();
      onLoginSuccess(userProfile);
      onClose();
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("Pop-up blocked. Please allow pop-ups for this site.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Google Sign-In is not enabled. Go to Firebase Console > Authentication > Sign-in method.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain not authorized: ${window.location.hostname}. Add it to Firebase Console > Authentication > Settings > Authorized domains.`);
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError("Only one pop-up can be open at a time.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (mode === 'reset') {
        await authService.resetPassword(email);
        setSuccessMessage("Password reset email sent! Check your inbox.");
        setIsLoading(false);
        return;
      }

      let userProfile;
      if (mode === 'register') {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }
        userProfile = await authService.register(email, password, name, username);
      } else {
        userProfile = await authService.login(email, password);
      }
      onLoginSuccess(userProfile);
      onClose();
    } catch (err: any) {
      console.error("Authentication Error:", err);
      
      // Handle specific Firebase Auth errors
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         if (mode === 'login') {
            setError("Incorrect email or password. If you haven't registered yet, please switch to 'Create Account'.");
         } else {
            setError("Invalid credentials provided.");
         }
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else if (err.code === 'auth/configuration-not-found') {
        setError("Auth not configured. Please enable 'Email/Password' in Firebase Console.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password sign-in is disabled in Firebase Console.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'register': return 'Join Studio';
      case 'reset': return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to access your creative space.';
      case 'register': return 'Create an account to get 10 free generations.';
      case 'reset': return "Enter your email and we'll send you a link to reset your password.";
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-stone-900 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 animate-fadeIn custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        {mode === 'reset' && (
          <button 
            onClick={() => switchMode('login')}
            className="absolute top-4 left-4 z-10 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center text-stone-500 hover:text-stone-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              {getTitle()}
            </h2>
            <p className="text-stone-500 text-sm px-4">
              {getSubtitle()}
            </p>
          </div>

          {successMessage ? (
            <div className="flex flex-col items-center justify-center space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-stone-700 dark:text-stone-300 font-medium text-center">{successMessage}</p>
              <button 
                onClick={() => switchMode('login')}
                className="text-stone-900 dark:text-stone-100 font-bold underline hover:no-underline mt-4"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
               {mode === 'login' && (
                 <div className="mb-6">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-3 py-2.5 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 font-medium relative"
                    >
                       <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                       <span>Continue with Google</span>
                    </button>
                    
                    <div className="flex items-center my-6">
                       <div className="flex-1 border-t border-stone-200 dark:border-stone-800"></div>
                       <span className="px-4 text-xs text-stone-400 uppercase tracking-wider">or with email</span>
                       <div className="flex-1 border-t border-stone-200 dark:border-stone-800"></div>
                    </div>
                 </div>
               )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {mode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 outline-none transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Username</label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 outline-none transition-all"
                          placeholder="johndoe123"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 outline-none transition-all"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                {mode !== 'reset' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">Password</label>
                      {mode === 'login' && (
                        <button 
                          type="button" 
                          onClick={() => switchMode('reset')}
                          className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-300 transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 outline-none transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 outline-none transition-all"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex flex-col gap-2 text-sm text-red-600 dark:text-red-400">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="break-words">{error}</span>
                    </div>
                    {error.includes("already registered") && (
                        <button 
                            type="button"
                            onClick={() => switchMode('login')}
                            className="text-left font-bold underline hover:text-red-800 dark:hover:text-red-300 ml-6"
                        >
                            Switch to Log In
                        </button>
                    )}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-bold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          {mode !== 'reset' && (
            <div className="mt-6 text-center text-sm text-stone-500">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                className="font-bold text-stone-900 dark:text-stone-100 hover:underline"
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};