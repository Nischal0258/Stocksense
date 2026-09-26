import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  User,
  LogOut,
  ShieldCheck,
  PackageCheck,
  Settings,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { NavRoute } from '../types/inventory';
import { AppLogo } from './ui/AppLogo';
import { UserProfileModal } from './profile/UserProfileModal';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: NavRoute;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { activeRoute, setActiveRoute, receipts } = useInventory();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [collapsedProfileMenu, setCollapsedProfileMenu] = useState(false);

  // Calculate badges
  const pendingReceipts = receipts.filter((r) => r.status === 'Waiting' || r.status === 'Ready').length;

  const navGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Products',
      items: [
        { id: 'products', label: 'Products', icon: Boxes },
      ],
    },
    {
      group: 'Operations',
      items: [
        {
          id: 'receipts',
          label: 'Receipts',
          icon: ArrowDownLeft,
          badge: pendingReceipts > 0 ? pendingReceipts : undefined,
        },
        { id: 'deliveries', label: 'Delivery Orders', icon: ArrowUpRight },
        { id: 'adjustments', label: 'Inventory Adjustment', icon: SlidersHorizontal },
        { id: 'transfers', label: 'Internal Transfers', icon: ArrowLeftRight },
        { id: 'move-history', label: 'Move History', icon: History },
      ],
    },
    {
      group: 'Settings',
      items: [
        { id: 'settings', label: 'Warehouse', icon: Warehouse },
      ],
    },
  ];

  const handleNavClick = (route: NavRoute) => {
    setActiveRoute(route);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#242633]/30 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out flex flex-col
          bg-[#F7F3F0]/90 backdrop-blur-xl border-r border-[#EEE8E3] shadow-sm
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Top Header / Branding */}
        <div
          className={`h-20 flex items-center border-b border-[#EEE8E3]/80 relative transition-all duration-300 ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          }`}
        >
          <div className="flex items-center justify-center min-w-0">
            <AppLogo collapsed={isCollapsed} />
          </div>

          {/* Collapse Toggle Button (Hidden on Mobile) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex items-center justify-center text-[#686878] hover:text-[#242633] transition-colors ${
              isCollapsed
                ? 'absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-[#EEE8E3] shadow-md hover:bg-[#F7F3F0] z-50'
                : 'w-7 h-7 rounded-lg hover:bg-[#EEE8E3]'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pb-1 text-[10px] uppercase font-bold tracking-widest text-[#686878]/80 select-none">
                  {group.group}
                </div>
              ) : (
                <div className="h-1 mx-2 my-2 border-t border-[#EEE8E3]" />
              )}

              {group.items.map((item) => {
                const isActive = activeRoute === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative
                      ${
                        isActive
                          ? 'nav-active-pill font-semibold text-[#242633]'
                          : 'text-[#686878] hover:text-[#242633] hover:bg-white/60'
                      }
                      ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                        isActive ? 'text-[#242633] scale-105' : 'text-[#686878] group-hover:text-[#242633]'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!isCollapsed && item.badge !== undefined && (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#242633] text-[#F7F3F0] shrink-0">
                        {item.badge}
                      </span>
                    )}

                    {isCollapsed && item.badge !== undefined && (
                      <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#E87883]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Profile Menu (Left Sidebar) */}
        <div className="p-3 border-t border-[#EEE8E3]/80 bg-white/40">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-2xl bg-white/80 border border-[#EEE8E3] shadow-xs space-y-2.5">
              {/* User Identity */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#DBBA95] via-[#FABED7] to-[#F07BAF] p-0.5 shadow-xs flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#242633]">
                    {user?.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'AM'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#49C98A] border-2 border-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#242633] truncate">
                    {user?.name || 'Inventory Admin'}
                  </p>
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        user?.role === 'inventory_manager' ? 'bg-[#855e30]' : 'bg-[#b32b69]'
                      }`}
                    />
                    <p className="text-[10px] font-semibold text-[#686878] truncate capitalize">
                      {user?.role === 'inventory_manager' ? 'Manager' : 'Warehouse Staff'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: My Profile & Logout */}
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#EEE8E3]/80">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold text-[#242633] hover:bg-[#F7F3F0] transition-colors"
                  title="View and edit profile details"
                >
                  <User className="w-3.5 h-3.5 text-[#855e30]" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    showToast('Signed Out', 'Signed out of StockSense.', 'info');
                  }}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Sign out of StockSense"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex justify-center">
              <button
                type="button"
                onClick={() => setCollapsedProfileMenu(!collapsedProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#DBBA95] via-[#FABED7] to-[#F07BAF] p-0.5 shadow-sm flex items-center justify-center hover:scale-105 transition-transform"
                title="Profile Menu"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#242633]">
                  {user?.name
                    ? user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)
                    : 'AM'}
                </div>
              </button>

              {/* Collapsed Dropdown Popover */}
              {collapsedProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCollapsedProfileMenu(false)}
                  />
                  <div className="absolute left-16 bottom-0 w-48 bg-white rounded-2xl border border-[#EEE8E3] shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="px-2 py-1 border-b border-[#EEE8E3] mb-1">
                      <p className="text-xs font-bold text-[#242633] truncate">{user?.name}</p>
                      <p className="text-[10px] text-[#686878] capitalize">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCollapsedProfileMenu(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold text-[#242633] hover:bg-[#F7F3F0] flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-[#855e30]" />
                      <span>My Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCollapsedProfileMenu(false);
                        logout();
                        showToast('Signed Out', 'Signed out of StockSense.', 'info');
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
