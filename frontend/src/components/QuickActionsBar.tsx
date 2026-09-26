import React from 'react';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, SlidersHorizontal } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export const QuickActionsBar: React.FC = () => {
  const { setActiveModal } = useInventory();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-3 py-2 rounded-full glass-modal shadow-2xl border border-white/80 transition-all hover:shadow-[0_20px_40px_-15px_rgba(219,186,149,0.35)] flex items-center gap-1.5 sm:gap-2">
      <button
        onClick={() => setActiveModal('receipt')}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-[#242633] bg-white/70 hover:bg-[#DBBA95]/30 hover:text-[#242633] border border-white/90 shadow-xs transition-all active:scale-95"
      >
        <span className="w-5 h-5 rounded-full bg-[#DBBA95]/40 flex items-center justify-center text-[#855e30]">
          <ArrowDownLeft className="w-3.5 h-3.5" />
        </span>
        <span>Receive Stock</span>
      </button>

      <button
        onClick={() => setActiveModal('delivery')}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-[#242633] bg-white/70 hover:bg-[#D0BCE1]/40 hover:text-[#242633] border border-white/90 shadow-xs transition-all active:scale-95"
      >
        <span className="w-5 h-5 rounded-full bg-[#D0BCE1]/50 flex items-center justify-center text-[#5e4479]">
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
        <span>Create Delivery</span>
      </button>

      <button
        onClick={() => setActiveModal('transfer')}
        className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-[#242633] bg-white/70 hover:bg-[#F1D7C8]/70 hover:text-[#242633] border border-white/90 shadow-xs transition-all active:scale-95"
      >
        <span className="w-5 h-5 rounded-full bg-[#F1D7C8] flex items-center justify-center text-[#8a5538]">
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </span>
        <span>Transfer Stock</span>
      </button>

      <button
        onClick={() => setActiveModal('adjustment')}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold text-[#242633] bg-white/70 hover:bg-[#E7DDF1] hover:text-[#242633] border border-white/90 shadow-xs transition-all active:scale-95"
      >
        <span className="w-5 h-5 rounded-full bg-[#E7DDF1] flex items-center justify-center text-[#553b6f]">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </span>
        <span>Adjust Inventory</span>
      </button>
    </div>
  );
};
