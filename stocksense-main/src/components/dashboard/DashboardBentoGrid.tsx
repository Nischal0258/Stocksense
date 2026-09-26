import React from 'react';
import { InventoryPulseHero } from './InventoryPulseHero';
import { InventoryHealthCard } from './InventoryHealthCard';
import { WarehousePulseCard } from './WarehousePulseCard';
import { StockMovementChart } from './StockMovementChart';
import { LiveMovementCard } from './LiveMovementCard';
import { AttentionRequiredCard } from './AttentionRequiredCard';

export const DashboardBentoGrid: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* 1. Hero Panel */}
      <InventoryPulseHero />

      {/* 2. Three Diagnostic Cards: Health + Warehouse Capacity + Attention Required */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <InventoryHealthCard />
        <WarehousePulseCard />
        <AttentionRequiredCard />
      </div>

      {/* 3. Deep Velocity & Live Movement Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <StockMovementChart />
        </div>
        <div className="lg:col-span-1">
          <LiveMovementCard />
        </div>
      </div>
    </div>
  );
};
