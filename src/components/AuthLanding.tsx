import React, { useState } from 'react';
import { KeyRound, Sparkles, AlertCircle, UserPlus, LogIn, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../translations.js';

interface AuthLandingProps {
  onSuccess: (role: 'admin' | 'customer') => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({ onSuccess }) => {
  const { login, register, language } = useAuth();
  const t = translations[language];

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (authTab === 'login') {
      const res = await login(email.trim().toLowerCase(), password);
      if (res.success) {
        const storedUser = localStorage.getItem('strike_user');
        const parsed = storedUser ? JSON.parse(storedUser) : null;
        const role = parsed?.role === 'admin' ? 'admin' : 'customer';
        setSuccessMsg(role === 'admin' ? 'تم التحقق بنجاح! جاري فتح لوحة التحكم...' : 'تم التحقق بنجاح! جاري فتح المتجر...');
        setTimeout(() => {
          onSuccess(role);
        }, 400);
      } else {
        setErrorMsg(res.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }
    } else {
      if (email.trim().toLowerCase() === 'admin@strick.com') {
        setErrorMsg('هذا البريد محجوز لحساب المسؤول، يرجى تسجيل الدخول مباشرة');
        setIsSubmitting(false);
        return;
      }

      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'customer',
        phone: phone.trim(),
      });

      if (res.success) {
        setSuccessMsg('تم إنشاء حسابك بنجاح! مرحباً بك في المتجر...');
        setTimeout(() => {
          onSuccess('customer');
        }, 400);
      } else {
        setErrorMsg(res.error || 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <Lock className="h-3.5 w-3.5" />
            <span>تسجيل دخول آمن مشفر · JWT Authentication</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl font-['Cairo',sans-serif]">
            {t.brandName}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400">
            {language === 'ar'
              ? 'سجل دخولك للوصول إلى حسابك، أو أنشئ حساباً جديداً للمتابعة'
              : 'Sign in to access your account, or register a new account to continue'}
          </p>
        </div>

        {/* Central Auth Form */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          {/* Tabs */}
          <div className="flex border-b border-neutral-800 pb-3">
            <button
              onClick={() => {
                setAuthTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex flex-1 items-center justify-center gap-2 pb-2 text-center text-sm font-bold transition-colors ${
                authTab === 'login'
                  ? 'border-b-2 border-emerald-400 text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>{t.tabLogin}</span>
            </button>
            <button
              onClick={() => {
                setAuthTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex flex-1 items-center justify-center gap-2 pb-2 text-center text-sm font-bold transition-colors ${
                authTab === 'register'
                  ? 'border-b-2 border-emerald-400 text-emerald-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>{t.tabRegister}</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {authTab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="الاسم بالكامل"
                    className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    {t.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+201..."
                    className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300">
                {t.emailLabel}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300">
                {t.passwordLabel}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-neutral-950 transition-all hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50"
            >
              <KeyRound className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? 'جاري التحقق...'
                  : authTab === 'login'
                  ? t.loginSubmit
                  : t.registerSubmit}
              </span>
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center text-xs text-neutral-400">
            {authTab === 'login' ? (
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setErrorMsg(null);
                }}
                className="text-emerald-400 hover:underline"
              >
                {t.dontHaveAccount}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setErrorMsg(null);
                }}
                className="text-emerald-400 hover:underline"
              >
                {t.alreadyHaveAccount}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
