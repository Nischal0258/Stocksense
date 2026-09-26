import React, { useState } from 'react';
import {
  User,
  Mail,
  ShieldCheck,
  PackageCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, logout, switchRole } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Sync inputs when modal opens or user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user, isOpen]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Validation Error', 'Name and email cannot be empty.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      showToast('Profile Updated', 'Your profile details have been saved successfully.', 'success');
      onClose();
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not update profile details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Missing Field', 'Current password is required to change password.', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Weak Password', 'New password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Mismatch', 'New password and confirmation do not match.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showToast('Password Changed', 'Your password has been successfully updated.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Incorrect current password or server error.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Account Profile"
      subtitle="Manage your credentials, role privileges, and security settings"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* User Identity Header Pill */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-white/90 to-[#F7F3F0]/90 border border-[#EEE8E3] shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DBBA95] via-[#FABED7] to-[#F07BAF] p-0.5 shadow-sm flex items-center justify-center">
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center font-bold text-base text-[#242633]">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'AM'}
              </div>
            </div>
            <div>
              <p className="text-base font-bold text-[#242633]">{user?.name || 'Inventory Admin'}</p>
              <p className="text-xs text-[#686878]">{user?.email || 'admin@stocksense.com'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                user?.role === 'inventory_manager'
                  ? 'bg-[#DBBA95]/30 text-[#855e30] border border-[#DBBA95]/50'
                  : 'bg-[#F07BAF]/25 text-[#b32b69] border border-[#F07BAF]/40'
              }`}
            >
              {user?.role === 'inventory_manager' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Manager</span>
                </>
              ) : (
                <>
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Warehouse Staff</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-white/70 rounded-2xl border border-[#EEE8E3]">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] shadow-xs'
                : 'text-[#686878] hover:text-[#242633]'
            }`}
          >
            Profile Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] shadow-xs'
                : 'text-[#686878] hover:text-[#242633]'
            }`}
          >
            Password & Security
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
                />
              </div>
            </div>

            {/* Role Permissions Box */}
            <div className="p-3.5 rounded-2xl bg-[#F7F3F0] border border-[#EEE8E3] space-y-2">
              <p className="text-xs font-bold text-[#242633] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#855e30]" />
                Role Permissions & Capabilities
              </p>
              <p className="text-[11px] text-[#686878]">
                {user?.role === 'inventory_manager'
                  ? 'You hold full Administrative authority: register catalog SKUs, configure reorder rules, manage physical warehouses & bins, and oversee all ledger operations.'
                  : 'You operate in Warehouse Staff mode: process inbound consignments, pack outbound customer orders, and record cycle-count physical audits.'}
              </p>
            </div>

            {/* Quick Role Switcher Button */}
            <div className="pt-1">
              <button
                type="button"
                disabled={isSwitching}
                onClick={async () => {
                  setIsSwitching(true);
                  try {
                    await switchRole();
                    showToast(
                      'Role Switched',
                      `Active profile is now ${
                        user?.role === 'inventory_manager' ? 'Warehouse Staff' : 'Inventory Manager'
                      }.`,
                      'success'
                    );
                  } catch (err: any) {
                    showToast('Switch Error', err.message || 'Failed to switch role.', 'error');
                  } finally {
                    setIsSwitching(false);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/80 border border-[#EEE8E3] hover:bg-white text-xs font-bold text-[#242633] flex items-center justify-center gap-2 transition-all hover:shadow-xs disabled:opacity-50"
              >
                {isSwitching ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#DBBA95]" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-[#DBBA95]" />
                )}
                <span>
                  Switch to {user?.role === 'inventory_manager' ? 'Warehouse Staff Mode' : 'Manager Mode'}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E3]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#686878] hover:text-[#242633]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <form onSubmit={handleSecuritySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter current password to verify"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E3]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#686878] hover:text-[#242633]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
