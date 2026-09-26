import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { QuickActionsBar } from './QuickActionsBar';
import { Modal } from './ui/Modal';
import { CreateReceiptForm } from './receipts/CreateReceiptForm';
import { CreateDeliveryForm } from './operations/CreateDeliveryForm';
import { CreateTransferForm } from './operations/CreateTransferForm';
import { CreateAdjustmentForm } from './operations/CreateAdjustmentForm';
import { useInventory } from '../context/InventoryContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { activeModal, setActiveModal } = useInventory();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse sidebar on screens < 1024px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F3F0] text-[#242633] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Topbar */}
        <Topbar
          onToggleMobileMenu={() => setMobileOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Bottom Quick Actions Bar */}
      <QuickActionsBar />

      {/* Global Modals for Quick Action Triggers */}
      {/* 1. Receive Stock Modal */}
      <Modal
        isOpen={activeModal === 'receipt'}
        onClose={() => setActiveModal(null)}
        title="Receive Stock Consignment"
        subtitle="Log an inbound shipment and automatically update warehouse inventory"
        maxWidth="lg"
      >
        <CreateReceiptForm onClose={() => setActiveModal(null)} />
      </Modal>

      {/* 2. Create Delivery Modal */}
      <Modal
        isOpen={activeModal === 'delivery'}
        onClose={() => setActiveModal(null)}
        title="Create Outbound Delivery"
        subtitle="Stage customer dispatch with real-time stock availability verification"
        maxWidth="lg"
      >
        <CreateDeliveryForm onClose={() => setActiveModal(null)} />
      </Modal>

      {/* 3. Transfer Stock Modal */}
      <Modal
        isOpen={activeModal === 'transfer'}
        onClose={() => setActiveModal(null)}
        title="Internal Warehouse Transfer"
        subtitle="Move items between locations while keeping enterprise stock totals unchanged"
        maxWidth="lg"
      >
        <CreateTransferForm onClose={() => setActiveModal(null)} />
      </Modal>

      {/* 4. Adjust Inventory Modal */}
      <Modal
        isOpen={activeModal === 'adjustment'}
        onClose={() => setActiveModal(null)}
        title="Adjust Inventory Stock"
        subtitle="Automatic variance calculation: Difference = Physical Count − Recorded Quantity"
        maxWidth="lg"
      >
        <CreateAdjustmentForm onClose={() => setActiveModal(null)} />
      </Modal>
    </div>
  );
};
