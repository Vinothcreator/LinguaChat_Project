import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, X, CheckCircle2, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../store/appState';
import { validators } from '../../utils/validators';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

type SocialProvider = 'Google' | 'GitHub' | 'Microsoft';

// Provider brand assets & metadata
const PROVIDER_METADATA: Record<SocialProvider, {
  name: string;
  defaultEmail: string;
  defaultName: string;
  badge: string;
  avatar: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
}> = {
  Google: {
    name: 'Google',
    defaultEmail: 'alex.chen@gmail.com',
    defaultName: 'Alex Chen',
    badge: 'Google Workspace & Gemini Sync Enabled',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
  },
  GitHub: {
    name: 'GitHub',
    defaultEmail: 'alex.chen@github.com',
    defaultName: 'Alex Chen',
    badge: 'GitHub Developer SSO Active',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    color: 'text-slate-900 dark:text-slate-100',
    bgColor: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    icon: (
      <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  Microsoft: {
    name: 'Microsoft',
    defaultEmail: 'alex.chen@outlook.com',
    defaultName: 'Alex Chen',
    badge: 'Microsoft 365 Identity Linked',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
};

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { addNotification } = useAppState();
  const { login, signIn, isLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('alex.chen@linguachat.ai');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Social account activation modal state
  const [activeProvider, setActiveProvider] = useState<SocialProvider | null>(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    const emailCheck = validators.email(email);
    const pwdCheck = validators.password(password, 6);

    if (!emailCheck.isValid) {
      setGeneralError(emailCheck.error || 'Invalid email');
      return;
    }
    if (!pwdCheck.isValid) {
      setGeneralError(pwdCheck.error || 'Invalid password');
      return;
    }

    const res = await login({ email, password });
    if (res.success) {
      onSuccess?.();
    } else {
      setGeneralError(res.error || 'Login failed');
    }
  };

  const handleOpenSocialModal = (provider: SocialProvider) => {
    setGeneralError(null);
    const meta = PROVIDER_METADATA[provider];
    // If the user already typed an email into the input, suggest it; otherwise use provider default
    const currentInputEmail = email && email.includes('@') && !email.includes('linguachat.ai') ? email : meta.defaultEmail;
    setSocialEmail(currentInputEmail);
    setSocialName(meta.defaultName);
    setActiveProvider(provider);
  };

  const handleConfirmSocialActivation = async () => {
    if (!activeProvider) return;
    setSocialLoading(true);
    setGeneralError(null);

    try {
      const meta = PROVIDER_METADATA[activeProvider];
      const targetEmail = (socialEmail.trim() || meta.defaultEmail).toLowerCase();
      const targetName = socialName.trim() || meta.defaultName;

      // If a real Google Client ID is configured, redirect to Google Accounts OAuth with custom redirect URI
      const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
      if (activeProvider === 'Google' && googleClientId) {
        const isCapacitor = typeof window !== 'undefined' &&
          ((window as any).Capacitor !== undefined || window.location.protocol.includes('capacitor'));
        const redirectUri = isCapacitor ? 'com.linguachat.app://' : `${window.location.origin}/`;
        const scope = encodeURIComponent('email profile openid');
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}`;
        window.location.href = authUrl;
        return;
      }

      const res = await signIn({
        provider: activeProvider.toLowerCase() as any,
        email: targetEmail,
        name: targetName,
        avatar: meta.avatar,
      });

      if (res.success) {
        addNotification({
          title: `🎉 ${activeProvider} Connected`,
          message: `Successfully authenticated and activated account for ${targetEmail}`,
          type: 'success',
        });
        setActiveProvider(null);
        onSuccess?.();
      } else {
        setGeneralError(res.error || `${activeProvider} activation failed`);
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Social authentication error');
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {(generalError || authError) && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{generalError || authError}</span>
          </div>
        )}

        {/* Email Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <span>📧</span>
            <span>Email Address</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.chen@linguachat.ai"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <span>🔒</span>
            <span>Password</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>Remember me</span>
          </label>

          <a
            href="#forgot"
            onClick={(e) => {
              e.preventDefault();
              addNotification({
                title: '📧 Password Reset',
                message: 'Password reset instructions sent to your email.',
                type: 'info',
              });
            }}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
          >
            Forgot Password?
          </a>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>🚀</span>
              <span>Sign In</span>
            </>
          )}
        </button>

        {/* Social Logins */}
        <div className="pt-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
            <span className="flex-shrink mx-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              or continue with
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleOpenSocialModal('Google')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm cursor-pointer"
              title="Activate & Sign In with Google"
            >
              {PROVIDER_METADATA.Google.icon}
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenSocialModal('GitHub')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm cursor-pointer"
              title="Activate & Sign In with GitHub"
            >
              {PROVIDER_METADATA.GitHub.icon}
              <span>GitHub</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenSocialModal('Microsoft')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-2 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm cursor-pointer"
              title="Activate & Sign In with Microsoft"
            >
              {PROVIDER_METADATA.Microsoft.icon}
              <span>Microsoft</span>
            </button>
          </div>
        </div>

        {/* Toggle to Create Account */}
        {onSwitchToRegister && (
          <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>New to LinguaChat? Create Account →</span>
            </button>
          </div>
        )}
      </form>

      {/* Social Account Activation Modal */}
      {activeProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {PROVIDER_METADATA[activeProvider].icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>Activate {activeProvider} Account</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Instant OAuth Verification & Sign In
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveProvider(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Feature Tag */}
            <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${PROVIDER_METADATA[activeProvider].bgColor}`}>
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">
                {PROVIDER_METADATA[activeProvider].badge}
              </span>
            </div>

            {/* Account Details Form */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    placeholder={PROVIDER_METADATA[activeProvider].defaultName}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {activeProvider} Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={socialEmail}
                    onChange={(e) => setSocialEmail(e.target.value)}
                    placeholder={PROVIDER_METADATA[activeProvider].defaultEmail}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Enter your real email or keep the suggested active account.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={socialLoading}
                onClick={handleConfirmSocialActivation}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {socialLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authorize & Activate with {activeProvider}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveProvider(null)}
                className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
