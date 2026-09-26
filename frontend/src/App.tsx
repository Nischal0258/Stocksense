/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { AppLayout } from './components/AppLayout';
import { DashboardBentoGrid } from './components/dashboard/DashboardBentoGrid';
import { ProductsTableSection } from './components/products/ProductsTableSection';
import { ReceiptsTableSection } from './components/receipts/ReceiptsTableSection';
import { DeliveriesSection } from './components/operations/DeliveriesSection';
import { TransfersSection } from './components/operations/TransfersSection';
import { AdjustmentsSection } from './components/operations/AdjustmentsSection';
import { MoveHistorySection } from './components/history/MoveHistorySection';

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
    default:
      return <DashboardBentoGrid />;
  }
}

export default function App() {
  return (
    <ToastProvider>
      <InventoryProvider>
        <AppLayout>
          <RouteContent />
        </AppLayout>
      </InventoryProvider>
    </ToastProvider>
  );
}
