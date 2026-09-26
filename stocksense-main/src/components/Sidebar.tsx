import React from 'react';
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
  Sparkles,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { NavRoute } from '../types/inventory';
import { AppLogo } from './ui/AppLogo';

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
  const { activeRoute, setActiveRoute, receipts, lowStockPercent } = useInventory();

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
      group: 'Inventory',
      items: [
        { id: 'products', label: 'Products', icon: Boxes },
        { id: 'move-history', label: 'Move History', icon: History },
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
        { id: 'deliveries', label: 'Deliveries', icon: ArrowUpRight },
        { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
        { id: 'adjustments', label: 'Adjustments', icon: SlidersHorizontal },
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
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#EEE8E3]/80">
          <div className="overflow-hidden">
            <AppLogo collapsed={isCollapsed} />
          </div>

          {/* Collapse Toggle Button (Hidden on Mobile) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-[#686878] hover:text-[#242633] hover:bg-[#EEE8E3] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-3 pb-1.5 text-[10px] uppercase font-bold tracking-widest text-[#686878]/80 select-none">
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

        {/* Live Warehouse Badge at bottom */}
        <div className="p-3 border-t border-[#EEE8E3]/80">
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-white/70 border border-white/80 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-[#49C98A] animate-pulse shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#242633] truncate">Live Intelligence</p>
                  <p className="text-[10px] text-[#686878] truncate">
                    {lowStockPercent > 0 ? `${lowStockPercent}% Need Attention` : 'All Stock Healthy'}
                  </p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-[#DBBA95] shrink-0" />
            </div>
          ) : (
            <div className="flex justify-center py-2" title="Live Intelligence Active">
              <div className="w-3 h-3 rounded-full bg-[#49C98A] animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
