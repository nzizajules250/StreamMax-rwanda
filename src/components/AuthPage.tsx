import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User as UserIcon, Shield, Film, Key } from 'lucide-react';
import { User } from '../types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function AuthPage({ onLoginSuccess, addToast }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [registerAsAdmin, setRegisterAsAdmin] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (!isLogin && !username)) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsLoading(true);

    if (isLogin) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        // Fetch profile from Firestore
        let userDoc;
        try {
          userDoc = await getDoc(doc(db, 'users', uid));
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${uid}`);
        }

        if (userDoc && userDoc.exists()) {
          const userData = userDoc.data() as User;
          addToast(`Welcome back, ${userData.username}!`, 'success');
          onLoginSuccess(userData);
        } else {
          // Fallback if auth exists but no Firestore profile document
          const isEmailAdmin = email.toLowerCase() === 'admin@movie.com';
          const fallbackUser: User = {
            id: uid,
            email: email,
            username: email.split('@')[0],
            role: isEmailAdmin ? 'admin' : 'user',
            subscription: isEmailAdmin 
              ? { active: true, planId: 'premium', expiresAt: '2026-12-31T00:00:00Z' } 
              : { active: false },
            watchlist: [],
            history: [],
            createdAt: new Date().toISOString()
          };
          try {
            await setDoc(doc(db, 'users', uid), fallbackUser);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
          }
          addToast(`Welcome back, ${fallbackUser.username}!`, 'success');
          onLoginSuccess(fallbackUser);
        }
      } catch (error: any) {
        console.error('Login error:', error);
        addToast(error.message || 'Incorrect email or password.', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Register
      if (registerAsAdmin && secretCode !== 'CINEMA2026') {
        addToast('Invalid Admin Secret Code. Try again!', 'error');
        setIsLoading(false);
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        
        const isEmailAdmin = email.toLowerCase() === 'admin@movie.com' || registerAsAdmin;
        const newUser: User = {
          id: uid,
          email: email,
          username: username,
          role: isEmailAdmin ? 'admin' : 'user',
          subscription: isEmailAdmin 
            ? { active: true, planId: 'premium', expiresAt: new Date(Date.now() + 30*24*60*60*1000).toISOString() } 
            : { active: false },
          watchlist: [],
          history: [],
          createdAt: new Date().toISOString()
        };
        
        try {
          await setDoc(doc(db, 'users', uid), newUser);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
        }
        addToast(`Account registered successfully as ${newUser.role}!`, 'success');
        onLoginSuccess(newUser);
      } catch (error: any) {
        console.error('Registration error:', error);
        addToast(error.message || 'Registration failed. Try a stronger password or different email.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div id="auth-page-container" className="max-w-md w-full mx-auto my-12 px-4">
      <motion.div
        id="auth-box"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800/80 p-8 rounded-3xl shadow-xl backdrop-blur-md relative overflow-hidden"
      >
        {/* Glowing Background Ring */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
            <Film className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-black font-display tracking-wider uppercase text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            {isLogin ? 'Sign in to access watchlists & abonnements' : 'Join to start building your personal cinema queue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Username</label>
              <div className="relative">
                <input
                  id="auth-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="movielover99"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 focus:outline-none transition-all"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                id="auth-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 focus:outline-none transition-all"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="auth-password-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 focus:outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {!isLogin && (
            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  id="auth-admin-checkbox"
                  type="checkbox"
                  checked={registerAsAdmin}
                  onChange={(e) => {
                    setRegisterAsAdmin(e.target.checked);
                    if (!e.target.checked) setSecretCode('');
                  }}
                  className="w-4 h-4 accent-amber-500 rounded bg-slate-950 border-slate-800"
                />
                <div className="text-xs">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    Register as Admin (For testing panels)
                  </span>
                </div>
              </label>

              {registerAsAdmin && (
                <div className="mt-2 animate-fadeIn">
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Admin Secret Code</label>
                  <div className="relative">
                    <input
                      id="auth-admin-secret-input"
                      type="password"
                      required
                      value={secretCode}
                      onChange={(e) => setSecretCode(e.target.value)}
                      placeholder="Enter secret code (e.g., CINEMA2026)"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 focus:outline-none transition-all"
                    />
                    <Key className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Hint: Use <strong className="text-slate-400">CINEMA2026</strong> as the secret code.</p>
                </div>
              )}
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-orange-950/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Free Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button
            id="auth-toggle-mode"
            onClick={() => setIsLogin(!isLogin)}
            className="text-amber-400 font-bold ml-1 hover:underline cursor-pointer"
          >
            {isLogin ? 'Register Here' : 'Log In'}
          </button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-full border border-slate-800/80 text-[10px] text-slate-400">
            <Key className="w-3 h-3 text-amber-500" />
            <span>Try demo Admin login: <strong className="text-slate-200 font-semibold">admin@movie.com</strong></span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
