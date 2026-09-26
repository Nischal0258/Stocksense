import React, { useState } from 'react';
import { Search, Plus, SlidersHorizontal, Calendar, User, MapPin } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Modal } from '../ui/Modal';
import { CreateAdjustmentForm } from './CreateAdjustmentForm';

export const AdjustmentsSection: React.FC = () => {
  const { adjustments, products } = useInventory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredAdjustments = adjustments.filter((a) => {
    return (
      a.reference.toLowerCase().includes(search.toLowerCase()) ||
      a.productName.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase()) ||
      a.user.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#242633]">
            Inventory Stock Adjustments
          </h2>
          <p className="text-xs sm:text-sm text-[#686878]">
            Physical count discrepancy reconciliation with auto-calculated variances: Difference = Physical Count − Recorded Quantity
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#DBBA95] via-[#F1D7C8] to-[#D0BCE1] text-[#242633] font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Adjustment</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search adjustments by SKU, product, reason or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-xs sm:text-sm text-[#242633] outline-none"
          />
        </div>
      </div>

      {/* Adjustments Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[840px]">
            <thead>
              <tr className="border-b border-[#EEE8E3] bg-white/40 text-[11px] font-bold text-[#686878] uppercase tracking-wider">
                <th className="py-4 px-6">Reference</th>
                <th className="py-4 px-4">Product Item</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4">Recorded Qty</th>
                <th className="py-4 px-4">Physical Count</th>
                <th className="py-4 px-4">Difference</th>
                <th className="py-4 px-4">Audit Reason</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-6 text-right">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E3]/70 text-sm">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-[#686878]">
                    No stock adjustments recorded matching your query.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((adj) => {
                  const prod = products.find((p) => p.id === adj.productId);
                  const isPositive = adj.difference > 0;
                  const isZero = adj.difference === 0;

                  return (
                    <tr key={adj.id} className="hover:bg-white/50 transition-colors">
                      {/* Reference */}
                      <td className="py-4 px-6 font-mono font-bold text-xs text-[#242633]">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-[#E7DDF1] text-[#553b6f]">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </span>
                          <span>{adj.reference}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4 font-semibold text-[#242633]">
                        <div>
                          <span>{adj.productName}</span>
                          {prod && (
                            <span className="block text-[11px] text-[#686878]">
                              {prod.sku}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-xs font-medium text-[#242633]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#DBBA95]" />
                          <span>{adj.location}</span>
                        </div>
                      </td>

                      {/* Recorded Qty */}
                      <td className="py-4 px-4 font-medium text-[#686878]">
                        {adj.recordedQuantity.toLocaleString()} {prod?.unit || 'units'}
                      </td>

                      {/* Physical Count */}
                      <td className="py-4 px-4 font-bold text-[#242633]">
                        {adj.physicalCount.toLocaleString()} {prod?.unit || 'units'}
                      </td>

                      {/* Difference */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isZero
                              ? 'bg-slate-100 text-slate-700'
                              : isPositive
                              ? 'bg-[#49C98A]/15 text-[#1a7e4e]'
                              : 'bg-[#E87883]/15 text-[#b92c3a]'
                          }`}
                        >
                          {isPositive ? `+${adj.difference}` : adj.difference} {prod?.unit || ''}
                        </span>
                      </td>

                      {/* Reason */}
                      <td className="py-4 px-4 text-xs text-[#242633] max-w-xs truncate">
                        {adj.reason}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-[#686878]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{adj.date}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-4 px-6 text-right text-xs font-medium text-[#242633]">
                        <div className="flex items-center justify-end gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#DBBA95]" />
                          <span>{adj.user}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/40 border-t border-[#EEE8E3] flex items-center justify-between text-xs text-[#686878]">
          <span>{filteredAdjustments.length} audit reconciliations completed</span>
          <span className="text-[#1a7e4e] font-medium">Automatic stock realignment applied upon confirmation</span>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adjust Inventory Stock"
        subtitle="Log physical count audit variance with automatic difference computation"
        maxWidth="lg"
      >
        <CreateAdjustmentForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
