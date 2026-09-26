import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { AppLayout } from './components/AppLayout';
import { AuthPage } from './components/auth/AuthPage';
import { DashboardBentoGrid } from './components/dashboard/DashboardBentoGrid';
import { ProductsTableSection } from './components/products/ProductsTableSection';
import { ReceiptsTableSection } from './components/receipts/ReceiptsTableSection';
import { DeliveriesSection } from './components/operations/DeliveriesSection';
import { TransfersSection } from './components/operations/TransfersSection';
import { AdjustmentsSection } from './components/operations/AdjustmentsSection';
import { MoveHistorySection } from './components/history/MoveHistorySection';
import { WarehouseSettingsSection } from './components/settings/WarehouseSettingsSection';
import { RefreshCw } from 'lucide-react';

function RouteContent() {
  const { activeRoute } = useInventory();

  switch (activeRoute) {
    case 'dashboard':
      return <DashboardBentoGrid />;
    case 'products':
      return <ProductsTableSection />;
    case 'receipts':
      return <ReceiptsTableSection />;
    case 'deliveries':
      return <DeliveriesSection />;
    case 'transfers':
      return <TransfersSection />;
    case 'adjustments':
      return <AdjustmentsSection />;
    case 'move-history':
      return <MoveHistorySection />;
    case 'settings':
      return <WarehouseSettingsSection />;
    default:
      return <DashboardBentoGrid />;
  }
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3F0] flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-[#DBBA95] animate-spin" />
        <p className="text-xs font-semibold text-[#686878]">Loading StockSense...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <InventoryProvider>
      <AppLayout>
        <RouteContent />
      </AppLayout>
    </InventoryProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
