import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  User,
  ArrowRight,
  LogOut,
  ShieldCheck,
  PackageCheck,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { NavRoute } from '../types/inventory';

interface TopbarProps {
  onToggleMobileMenu: () => void;
  isSidebarCollapsed: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileMenu, isSidebarCollapsed }) => {
  const { activeRoute, setActiveRoute, products, receipts } = useInventory();
  const { user, logout, switchRole } = useAuth();
  const { showToast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Dynamic titles and subtitles based on route
  const routeMeta: Record<NavRoute, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Operations Dashboard',
      subtitle: 'Real-time telemetry, stock pulse, and warehouse velocity',
    },
    products: {
      title: 'Product Catalog',
      subtitle: 'Manage SKUs, reorder thresholds, and bin locations',
    },
    receipts: {
      title: 'Inbound Receipts',
      subtitle: 'Inspect supplier consignments, validate POs, and stock items',
    },
    deliveries: {
      title: 'Outbound Deliveries',
      subtitle: 'Fulfill customer orders, stage dispatches, and track capacity',
    },
    transfers: {
      title: 'Internal Transfers',
      subtitle: 'Rebalance inventory across warehouses and storage racks',
    },
    adjustments: {
      title: 'Stock Adjustments',
      subtitle: 'Audit discrepancies, log cycle counts, and balance ledger',
    },
    'move-history': {
      title: 'Movement Ledger',
      subtitle: 'Immutable audit trail of all receipts, deliveries, and adjustments',
    },
  };

  const { title, subtitle } = routeMeta[activeRoute] || routeMeta.dashboard;

  // Compute urgent notifications
  const lowStockItems = products.filter((p) => p.status === 'low-stock');
  const outOfStockItems = products.filter((p) => p.status === 'out-of-stock');
  const pendingReceipts = receipts.filter((r) => r.status === 'Waiting');
  const totalNotifications = lowStockItems.length + outOfStockItems.length + pendingReceipts.length;

  // Search filter
  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="sticky top-0 z-30 h-20 px-4 sm:px-8 border-b border-[#EEE8E3]/80 bg-[#F7F3F0]/80 backdrop-blur-xl transition-all">
      <div className="h-full flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button + Page Title & Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-[#242633] hover:bg-white/60 transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#242633] truncate">
              {title}
            </h1>
            <p className="text-xs text-[#686878] hidden sm:block truncate">{subtitle}</p>
          </div>
        </div>

        {/* Right Side: Operational Status, Search, Notifications, Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* System Operational Pulse Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-white/80 shadow-xs text-xs font-medium text-[#242633]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#49C98A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#49C98A]" />
            </span>
            <span className="text-[#686878]">Status:</span>
            <span className="text-[#242633] font-semibold">Operational</span>
          </div>

          {/* Search Box with Autocomplete Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-[#EEE8E3] focus-within:border-[#DBBA95] focus-within:ring-2 focus-within:ring-[#DBBA95]/20 focus-within:bg-white transition-all w-36 sm:w-56 md:w-64">
              <Search className="w-4 h-4 text-[#686878] shrink-0" />
              <input
                type="text"
                placeholder="Search SKUs, items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full bg-transparent text-xs text-[#242633] placeholder-[#686878]/70 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#686878] hover:text-[#242633]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery.trim() && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowSearchResults(false)}
                />
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-modal rounded-2xl p-2 z-30 shadow-xl border border-white/80 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-[#686878] uppercase tracking-wider">
                    Catalog Matches ({filteredProducts.length})
                  </div>
                  {filteredProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#686878]">
                      No products found matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveRoute('products');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/80 text-left transition-colors group"
                      >
                        <div>
                          <p className="text-xs font-semibold text-[#242633] group-hover:text-[#DBBA95]">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-[#686878]">
                            {p.sku} · {p.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-[#242633]">
                            {p.currentStock} {p.unit}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full bg-white/70 hover:bg-white border border-[#EEE8E3] text-[#686878] hover:text-[#242633] transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#E87883] ring-2 ring-[#F7F3F0]" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-modal rounded-3xl p-4 z-30 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EEE8E3]">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#242633]">Notifications</h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#DBBA95]/30 text-[#855e30]">
                        {totalNotifications} Alerts
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-[#686878] hover:text-[#242633]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-2 space-y-2 max-h-80 overflow-y-auto">
                    {outOfStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#E87883]/10 border border-[#E87883]/20"
                      >
                        <AlertCircle className="w-4 h-4 text-[#E87883] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#242633]">
                            Out of Stock: {item.name}
                          </p>
                          <p className="text-[11px] text-[#686878]">
                            0 {item.unit} available in {item.location}. Reorder {item.reorderLevel} {item.unit}.
                          </p>
                        </div>
                      </div>
                    ))}

                    {lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20"
                      >
                        <AlertTriangle className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#242633]">
                            Low Stock Alert: {item.name}
                          </p>
                          <p className="text-[11px] text-[#686878]">
                            Current: {item.currentStock} {item.unit} (Threshold: {item.reorderLevel} {item.unit})
                          </p>
                        </div>
                      </div>
                    ))}

                    {pendingReceipts.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-start gap-3 p-2.5 rounded-2xl bg-[#EAA2C8]/15 border border-[#EAA2C8]/30"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#9c356f] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#242633]">
                            Pending Consignment {rec.reference}
                          </p>
                          <p className="text-[11px] text-[#686878]">
                            {rec.quantity} units of {rec.productName} waiting at dock
                          </p>
                        </div>
                      </div>
                    ))}

                    {totalNotifications === 0 && (
                      <div className="py-8 text-center text-xs text-[#686878]">
                        All warehouse inventory is balanced and healthy.
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#EEE8E3]">
                    <button
                      onClick={() => {
                        setActiveRoute('receipts');
                        setShowNotifications(false);
                      }}
                      className="w-full py-2 text-center text-xs font-semibold text-[#855e30] hover:text-[#242633] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      Review Inbound Shipments <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile & Role Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 border-l border-[#EEE8E3] hover:opacity-85 transition-opacity"
            >
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-[#DBBA95] to-[#EAA2C8] p-0.5 shadow-sm flex items-center justify-center shrink-0">
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
              </div>
              <div className="hidden xl:block text-left">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-[#242633] leading-none">
                    {user?.name || 'Inventory Admin'}
                  </p>
                  <ChevronDown className="w-3 h-3 text-[#686878]" />
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      user?.role === 'inventory_manager' ? 'bg-[#855e30]' : 'bg-[#604975]'
                    }`}
                  />
                  <p className="text-[10px] font-semibold text-[#686878] leading-tight capitalize">
                    {user?.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}
                  </p>
                </div>
              </div>
            </button>

            {/* Profile & Role Switcher Menu */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-[#EEE8E3] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2 py-2 border-b border-[#EEE8E3] mb-2">
                    <p className="text-xs font-bold text-[#242633]">{user?.name || 'Inventory User'}</p>
                    <p className="text-[11px] text-[#686878] truncate">{user?.email || 'admin@stocksense.com'}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F7F3F0] text-[#242633] border border-[#EEE8E3]">
                      {user?.role === 'inventory_manager' ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-[#855e30]" />
                          <span>Manager (Full Access)</span>
                        </>
                      ) : (
                        <>
                          <PackageCheck className="w-3 h-3 text-[#604975]" />
                          <span>Warehouse Staff</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Switch Role Action */}
                  <div className="space-y-1">
                    <button
                      type="button"
                      disabled={isSwitchingRole}
                      onClick={async () => {
                        setIsSwitchingRole(true);
                        try {
                          await switchRole();
                          showToast(
                            'Role Switched',
                            `Switched role to ${
                              user?.role === 'inventory_manager'
                                ? 'Warehouse Staff'
                                : 'Inventory Manager'
                            }`,
                            'success'
                          );
                          setShowProfileMenu(false);
                        } catch (err: any) {
                          showToast('Error', err.message || 'Failed to switch role.', 'error');
                        } finally {
                          setIsSwitchingRole(false);
                        }
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-[#855e30] hover:bg-[#DBBA95]/15 flex items-center justify-between transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        {user?.role === 'inventory_manager' ? (
                          <PackageCheck className="w-4 h-4 text-[#604975]" />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-[#855e30]" />
                        )}
                        <span>
                          {user?.role === 'inventory_manager'
                            ? 'Switch to Staff Mode'
                            : 'Switch to Manager Mode'}
                        </span>
                      </div>
                      {isSwitchingRole && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    </button>

                    {/* Sign Out Action */}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                        showToast('Signed Out', 'Signed out of StockSense.', 'info');
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
