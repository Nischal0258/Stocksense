import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  PackageCheck,
  PlusCircle,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const AttentionRequiredCard: React.FC = () => {
  const { products, receipts, validateReceipt, setActiveRoute, setActiveModal } = useInventory();

  // Low stock module: Steel Rods
  const steelRods = products.find((p) => p.name.includes('Steel') || p.id === 'prod-1') || products[0];

  // Out of stock module: Copper Wire
  const copperWire = products.find((p) => p.name.includes('Copper') || p.id === 'prod-2') || products[1];

  // Pending receipt module: REC-1024
  const pendingReceipt = receipts.find((r) => r.reference === 'REC-1024') || receipts[0];

  const handleValidatePendingReceipt = () => {
    if (pendingReceipt) {
      validateReceipt(pendingReceipt.id);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#EEE8E3]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-[#E87883]/15 text-[#b92c3a]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#242633] tracking-tight">
              Attention Required
            </h3>
            <p className="text-xs text-[#686878]">Critical alerts requiring supervisor action</p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#E87883]/15 text-[#b92c3a] border border-[#E87883]/20">
          3 Items Priority
        </span>
      </div>

      {/* Three Alert Modules */}
      <div className="py-3 space-y-3.5 flex-1 flex flex-col justify-center">
        {/* 1. Low Stock Alert: Steel Rods */}
        <div className="p-4 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/25 transition-all hover:bg-[#F5A623]/15">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-[#F5A623]/20 text-[#a86500] shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#242633] truncate">
                    Low Stock: {steelRods?.name || 'Steel Rods'}
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#F5A623]/20 text-[#a86500]">
                    {steelRods?.currentStock} {steelRods?.unit} left
                  </span>
                </div>
                <p className="text-xs text-[#686878] mt-1">
                  Threshold is {steelRods?.reorderLevel} {steelRods?.unit}. Located in {steelRods?.location}.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('receipt')}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F5A623] hover:text-white text-xs font-semibold text-[#a86500] shadow-xs border border-[#F5A623]/30 transition-all flex items-center gap-1"
            >
              <span>Restock</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 2. Out of Stock Alert: Copper Wire */}
        <div className="p-4 rounded-2xl bg-[#E87883]/10 border border-[#E87883]/25 transition-all hover:bg-[#E87883]/15">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-[#E87883]/20 text-[#b92c3a] shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#242633] truncate">
                    Out of Stock: {copperWire?.name || 'Copper Wire'}
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#E87883]/20 text-[#b92c3a]">
                    0 {copperWire?.unit}
                  </span>
                </div>
                <p className="text-xs text-[#686878] mt-1">
                  Production lines paused. Requires minimum {copperWire?.reorderLevel} {copperWire?.unit} to resume.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('receipt')}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-[#E87883] hover:bg-[#d46571] text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
            >
              <span>Urgent PO</span>
              <PlusCircle className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. Pending Receipt Alert: REC-1024 */}
        <div className="p-4 rounded-2xl bg-[#D0BCE1]/25 border border-[#D0BCE1]/45 transition-all hover:bg-[#D0BCE1]/35">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-[#D0BCE1]/40 text-[#5e4479] shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#242633] truncate">
                    Pending Receipt: {pendingReceipt?.reference || 'REC-1024'}
                  </h4>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    pendingReceipt?.status === 'Done'
                      ? 'bg-[#49C98A]/20 text-[#1a7e4e]'
                      : 'bg-[#D0BCE1]/40 text-[#5e4479]'
                  }`}>
                    {pendingReceipt?.status || 'Waiting'}
                  </span>
                </div>
                <p className="text-xs text-[#686878] mt-1">
                  {pendingReceipt?.quantity} {steelRods?.unit} of {pendingReceipt?.productName} from {pendingReceipt?.supplier}.
                </p>
              </div>
            </div>

            {pendingReceipt?.status !== 'Done' ? (
              <button
                onClick={handleValidatePendingReceipt}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-[#242633] hover:bg-[#393c4e] text-[#F7F3F0] text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <PackageCheck className="w-3.5 h-3.5 text-[#DBBA95]" />
                <span>Validate Receipt</span>
              </button>
            ) : (
              <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#1a7e4e]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Stocked</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[#EEE8E3] flex items-center justify-between text-xs text-[#686878]">
        <span>Automated Escalation</span>
        <span className="text-[#242633] font-medium">All suppliers notified</span>
      </div>
    </div>
  );
};
