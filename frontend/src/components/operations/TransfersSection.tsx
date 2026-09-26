import React, { useState } from 'react';
import { Search, Plus, ArrowLeftRight, Calendar, User, MapPin } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { Modal } from '../ui/Modal';
import { CreateTransferForm } from './CreateTransferForm';

export const TransfersSection: React.FC = () => {
  const { transfers, products } = useInventory();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTransfers = transfers.filter((t) => {
    return (
      t.reference.toLowerCase().includes(search.toLowerCase()) ||
      t.productName.toLowerCase().includes(search.toLowerCase()) ||
      t.fromLocation.toLowerCase().includes(search.toLowerCase()) ||
      t.toLocation.toLowerCase().includes(search.toLowerCase()) ||
      t.user.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#242633]">
            Internal Warehouse Transfers
          </h2>
          <p className="text-xs sm:text-sm text-[#686878]">
            Inter-facility material rebalancing — preserves total company stock while updating bin quantities
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#DBBA95] via-[#F8C6D8] to-[#EAA2C8] text-[#242633] font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Transfer Stock</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transfers by SKU, product, source or destination warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-xs sm:text-sm text-[#242633] outline-none"
          />
        </div>
      </div>

      {/* Transfers Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-[#EEE8E3] bg-white/40 text-[11px] font-bold text-[#686878] uppercase tracking-wider">
                <th className="py-4 px-6">Reference</th>
                <th className="py-4 px-4">Product Item</th>
                <th className="py-4 px-4">Transfer Routing</th>
                <th className="py-4 px-4">Quantity</th>
                <th className="py-4 px-4">Date & Time</th>
                <th className="py-4 px-4">Operator</th>
                <th className="py-4 px-6 text-right">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E3]/70 text-sm">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-[#686878]">
                    No transfers logged matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((t) => {
                  const prod = products.find((p) => p.id === t.productId);

                  return (
                    <tr key={t.id} className="hover:bg-white/50 transition-colors">
                      {/* Reference */}
                      <td className="py-4 px-6 font-mono font-bold text-xs text-[#242633]">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-[#F1D7C8]/70 text-[#8a5538]">
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                          </span>
                          <span>{t.reference}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4 font-semibold text-[#242633]">
                        <div>
                          <span>{t.productName}</span>
                          {prod && (
                            <span className="block text-[11px] text-[#686878]">
                              {prod.sku}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Routing */}
                      <td className="py-4 px-4 text-xs font-semibold text-[#242633]">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-white border border-[#EEE8E3]">
                            {t.fromLocation}
                          </span>
                          <span className="text-[#DBBA95]">→</span>
                          <span className="px-2 py-0.5 rounded-md bg-white border border-[#EEE8E3]">
                            {t.toLocation}
                          </span>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4 font-extrabold text-[#242633]">
                        {t.quantity.toLocaleString()} {prod?.unit || 'units'}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-[#686878]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{t.date}</span>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-4 px-4 text-xs text-[#686878]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#DBBA95]" />
                          <span className="font-medium text-[#242633]">{t.user}</span>
                        </div>
                      </td>

                      {/* Notes */}
                      <td className="py-4 px-6 text-right text-xs text-[#686878] italic">
                        {t.notes || 'Routine rebalance'}
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
          <span>{filteredTransfers.length} inter-warehouse transfers recorded</span>
          <span className="text-[#1a7e4e] font-medium">Enterprise total stock preserved across all routes</span>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Transfer Inventory"
        subtitle="Move items between warehouses or rack zones without changing global stock totals"
        maxWidth="lg"
      >
        <CreateTransferForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};
