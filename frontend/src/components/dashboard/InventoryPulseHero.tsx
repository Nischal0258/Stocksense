import React from 'react';
import {
  TrendingUp,
  Boxes,
  MapPin,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Activity,
  Layers,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const InventoryPulseHero: React.FC = () => {
  const { totalUnits, totalSKUs, totalLocations, setActiveModal } = useInventory();

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 hero-gradient border border-white/80 shadow-[0_15px_35px_-15px_rgba(219,186,149,0.25)] transition-all">
      {/* Decorative Blur Spheres */}
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#F07BAF]/45 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-[#FABED7]/55 blur-3xl pointer-events-none" />

      {/* Top Bar with LIVE Badge */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-white shadow-xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#49C98A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#49C98A]" />
            </span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#242633]">
              LIVE PULSE
            </span>
          </div>
          <span className="text-xs font-medium text-[#434553] hidden sm:inline">
            Continuous bin telemetry & ledger sync
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1a7e4e] bg-[#49C98A]/15 px-3 py-1 rounded-full border border-[#49C98A]/30">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+8.4% movement vs last week</span>
        </div>
      </div>

      {/* Main Metric & Narrative */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <div className="flex items-baseline gap-3">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#242633] font-['Plus_Jakarta_Sans']">
              {totalUnits.toLocaleString()}
            </h2>
            <span className="text-base sm:text-lg font-bold text-[#383A48]">
              total units in stock
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-[#434553] max-w-xl leading-relaxed">
            Multi-tier inventory intelligence across active warehousing, production staging, and rack aisles. Real-time balance and automated replenishment triggers active.
          </p>

          {/* Quick Actions Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-bold text-[#434553] uppercase tracking-wider mr-1">
              Quick Actions:
            </span>
            <button
              onClick={() => setActiveModal('receipt')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#242633] bg-white/80 hover:bg-white hover:scale-105 border border-white/90 shadow-xs transition-all"
            >
              <ArrowDownLeft className="w-3.5 h-3.5 text-[#855e30]" />
              <span>Receive Stock</span>
            </button>
            <button
              onClick={() => setActiveModal('delivery')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#242633] bg-white/80 hover:bg-white hover:scale-105 border border-white/90 shadow-xs transition-all"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#5e4479]" />
              <span>Create Delivery</span>
            </button>
            <button
              onClick={() => setActiveModal('transfer')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#242633] bg-white/80 hover:bg-white hover:scale-105 border border-white/90 shadow-xs transition-all"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#8a5538]" />
              <span>Transfer Stock</span>
            </button>
            <button
              onClick={() => setActiveModal('adjustment')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#242633] bg-white/80 hover:bg-white hover:scale-105 border border-white/90 shadow-xs transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#553b6f]" />
              <span>Adjust Inventory</span>
            </button>
          </div>
        </div>

        {/* Right Stats Cluster */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-xs">
            <div className="flex items-center justify-between text-[#686878] mb-1">
              <span className="text-xs font-medium">Cataloged SKUs</span>
              <Boxes className="w-4 h-4 text-[#DBBA95]" />
            </div>
            <p className="text-2xl font-bold text-[#242633]">{totalSKUs} SKUs</p>
            <p className="text-[11px] text-[#686878] mt-0.5">Active catalog items</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-xs">
            <div className="flex items-center justify-between text-[#686878] mb-1">
              <span className="text-xs font-medium">Locations Active</span>
              <MapPin className="w-4 h-4 text-[#F07BAF]" />
            </div>
            <p className="text-2xl font-bold text-[#242633]">{totalLocations} Zones</p>
            <p className="text-[11px] text-[#686878] mt-0.5">Warehouses & Racks</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 shadow-xs col-span-2 sm:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between text-[#686878] mb-1">
              <span className="text-xs font-medium">Velocity Index</span>
              <Activity className="w-4 h-4 text-[#49C98A]" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[#242633]">98.2%</p>
                <p className="text-[11px] text-[#686878] mt-0.5">Order fulfillment accuracy</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DBBA95]/30 text-[#855e30]">
                  High Velocity
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
