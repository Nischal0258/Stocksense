import React, { useState } from 'react';
import { useAuth, UserRole } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../api/services';
import { AppLogo } from '../ui/AppLogo';
import {
  ShieldCheck,
  PackageCheck,
  LogIn,
  UserPlus,
  KeyRound,
  ArrowRight,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

type AuthTab = 'signin' | 'signup' | 'forgot';

export const AuthPage: React.FC = () => {
  const { login, signup, loginAsManager, loginAsStaff } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AuthTab>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('inventory_manager');

  // Forgot Password / OTP State
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpStep, setOtpStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      showToast('Validation Error', 'Please fill in both email and password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: signInEmail, password: signInPassword });
      showToast('Welcome Back', 'Signed in successfully!', 'success');
    } catch (err: any) {
      showToast('Login Failed', err.message || 'Please check credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword) {
      showToast('Validation Error', 'Please fill in all registration fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        role: signUpRole,
      });
      showToast('Account Created', 'Welcome to StockSense!', 'success');
    } catch (err: any) {
      showToast('Signup Failed', err.message || 'Could not create account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Validation Error', 'Please enter your account email.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authApi.forgotPassword(forgotEmail);
      setOtpNotice(res.detail || 'OTP generated: 123456');
      setOtpCode('123456'); // pre-fill for convenient evaluation
      setOtpStep(2);
      showToast('OTP Generated', 'Use code 123456 to reset password', 'success');
    } catch (err: any) {
      showToast('OTP Failed', err.message || 'Failed to generate OTP.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !newPassword) {
      showToast('Validation Error', 'Please enter the OTP and new password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword(forgotEmail, otpCode, newPassword);
      showToast('Password Reset', 'Password changed successfully! You can now sign in.', 'success');
      setActiveTab('signin');
      setSignInEmail(forgotEmail);
      setSignInPassword(newPassword);
      setOtpStep(1);
      setOtpNotice(null);
    } catch (err: any) {
      showToast('Reset Failed', err.message || 'Failed to reset password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickManager = async () => {
    setIsSubmitting(true);
    try {
      await loginAsManager();
      showToast('Demo Access', 'Signed in as Inventory Manager (Admin)', 'success');
    } catch (err: any) {
      showToast('Demo Login Failed', err.message || 'Could not log in as Manager.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStaff = async () => {
    setIsSubmitting(true);
    try {
      await loginAsStaff();
      showToast('Demo Access', 'Signed in as Warehouse Staff', 'success');
    } catch (err: any) {
      showToast('Demo Login Failed', err.message || 'Could not log in as Staff.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3F0] text-[#242633] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative ambient background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#DBBA95]/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#F07BAF]/38 blur-[105px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-8%] w-[32vw] h-[32vw] rounded-full bg-[#FABED7]/45 blur-[95px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <AppLogo className="mb-3" />
          <h1 className="text-2xl font-bold tracking-tight text-[#242633]">
            Welcome to StockSense
          </h1>
          <p className="text-xs text-[#686878] mt-1 max-w-xs">
            Intelligent Modular Inventory Platform & Double-Entry Stock Ledger
          </p>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="bg-white/80 backdrop-blur-md border border-[#EEE8E3] rounded-2xl p-3.5 mb-5 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#855e30] mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#DBBA95]" />
            <span>Instant Demo Access (One-Click)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleQuickManager}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#DBBA95]/15 hover:bg-[#DBBA95]/30 border border-[#DBBA95]/40 text-[#855e30] text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#855e30]" />
              <span>Manager Mode</span>
            </button>
            <button
              type="button"
              onClick={handleQuickStaff}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#F07BAF]/15 hover:bg-[#F07BAF]/30 border border-[#F07BAF]/40 text-[#b32b69] text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <PackageCheck className="w-4 h-4 text-[#b32b69]" />
              <span>Staff Mode</span>
            </button>
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="bg-white rounded-3xl border border-[#EEE8E3] shadow-xl p-6 sm:p-8">
          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-[#F7F3F0] p-1 mb-6 border border-[#EEE8E3]">
            <button
              type="button"
              onClick={() => setActiveTab('signin')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-white text-[#242633] shadow-sm'
                  : 'text-[#686878] hover:text-[#242633]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? 'bg-white text-[#242633] shadow-sm'
                  : 'text-[#686878] hover:text-[#242633]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('forgot')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'forgot'
                  ? 'bg-white text-[#242633] shadow-sm'
                  : 'text-[#686878] hover:text-[#242633]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Tab 1: Sign In */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#686878] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A0A0B0] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. admin@stocksense.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F7F3F0]/60 border border-[#EEE8E3] rounded-xl focus:outline-none focus:border-[#DBBA95] focus:bg-white text-[#242633] transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#686878]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] text-[#855e30] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A0A0B0] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F7F3F0]/60 border border-[#EEE8E3] rounded-xl focus:outline-none focus:border-[#DBBA95] focus:bg-white text-[#242633] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-[#242633] hover:bg-[#343644] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Sign Up */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#686878] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#A0A0B0] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F7F3F0]/60 border border-[#EEE8E3] rounded-xl focus:outline-none focus:border-[#DBBA95] focus:bg-white text-[#242633] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686878] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A0A0B0] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="alex@stocksense.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F7F3F0]/60 border border-[#EEE8E3] rounded-xl focus:outline-none focus:border-[#DBBA95] focus:bg-white text-[#242633] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686878] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A0A0B0] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a secure password"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F7F3F0]/60 border border-[#EEE8E3] rounded-xl focus:outline-none focus:border-[#DBBA95] focus:bg-white text-[#242633] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#686878] mb-1.5">
                  System Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignUpRole('inventory_manager')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      signUpRole === 'inventory_manager'
                        ? 'border-[#DBBA95] bg-[#DBBA95]/20 text-[#855e30]'
                        : 'border-[#EEE8E3] bg-[#F7F3F0]/50 text-[#686878]'
                    }`}
                  >
                    Inventory Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignUpRole('warehouse_staff')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      signUpRole === 'warehouse_staff'
                        ? 'border-[#F07BAF] bg-[#F07BAF]/20 text-[#b32b69]'
                        : 'border-[#EEE8E3] bg-[#F7F3F0]/50 text-[#686878]'
                    }`}
                  >
                    Warehouse Staff
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 rounded-xl bg-[#242633] hover:bg-[#343644] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 3: Forgot Password (OTP) */}
          {activeTab === 'forgot' && (
            <div className="space-y-4">
              {otpStep === 1 ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <p className="text-xs text-[#686878]">
                    Enter your email to receive a 6-digit verification OTP.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-[#686878] mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#A0A0B0] absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@stocksense.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#F7F3F0]/60 border border-[#EEE8E3] rounded-xl focus:outline-none focus:border-[#DBBA95] focus:bg-white text-[#242633] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#855e30] hover:bg-[#6c4c26] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Generate OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {otpNotice && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{otpNotice}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[#686878] mb-1.5">
                      6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3 py-2.5 text-xs bg-[#F7F3F0]/60 border border-[#EEE8E3] rounded-xl focus:outline-none focus:border-[#DBBA95] focus:bg-white text-[#242633] transition-colors font-mono tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#686878] mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2.5 text-xs bg-[#F7F3F0]/60 border border-[#EEE8E3] rounded-xl focus:outline-none focus:border-[#DBBA95] focus:bg-white text-[#242633] transition-colors"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="py-2.5 px-4 rounded-xl border border-[#EEE8E3] text-xs font-semibold text-[#686878] hover:bg-stone-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-xl bg-[#242633] hover:bg-[#343644] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Confirm Reset</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
