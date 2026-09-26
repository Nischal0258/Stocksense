import React, { useState } from 'react';
import {
  Search,
  Plus,
  PackageCheck,
  Ban,
  ArrowDownLeft,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { CreateReceiptForm } from './CreateReceiptForm';
import { ReceiptStatus } from '../../types/inventory';

export const ReceiptsTableSection: React.FC = () => {
  const { receipts, validateReceipt, cancelReceipt, products } = useInventory();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter receipts
  const filteredReceipts = receipts.filter((r) => {
    const matchesSearch =
      r.reference.toLowerCase().includes(search.toLowerCase()) ||
      r.supplier.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase()) ||
      r.destinationLocation.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#242633]">
            Inbound Receipts
          </h2>
          <p className="text-xs sm:text-sm text-[#686878]">
            Inspect supplier deliveries, validate consignments, and automatically increment stock ledger
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#DBBA95] via-[#F1D7C8] to-[#D0BCE1] text-[#242633] font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Receipt</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reference, supplier, product or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-xs sm:text-sm text-[#242633] outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] text-xs font-semibold text-[#242633] outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="Ready">Ready</option>
            <option value="Done">Done (Stocked)</option>
            <option value="Draft">Draft</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#EEE8E3] bg-white/40 text-[11px] font-bold text-[#686878] uppercase tracking-wider">
                <th className="py-4 px-6">Reference</th>
                <th className="py-4 px-4">Supplier</th>
                <th className="py-4 px-4">Product Item</th>
                <th className="py-4 px-4">Quantity</th>
                <th className="py-4 px-4">Destination</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E3]/70 text-sm">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#686878]">
                    No receipts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((rec) => {
                  const prod = products.find((p) => p.id === rec.productId);
                  const isDone = rec.status === 'Done';
                  const isCanceled = rec.status === 'Canceled';

                  return (
                    <tr key={rec.id} className="hover:bg-white/50 transition-colors">
                      {/* Reference */}
                      <td className="py-4 px-6 font-mono font-bold text-xs text-[#242633]">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-[#DBBA95]/20 text-[#855e30]">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </span>
                          <span>{rec.reference}</span>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-4 font-semibold text-[#242633]">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#686878]" />
                          <span>{rec.supplier}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-[#242633]">
                          {rec.productName}
                        </span>
                        {prod && (
                          <span className="block text-[11px] text-[#686878]">
                            SKU: {prod.sku}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4 font-extrabold text-[#1a7e4e]">
                        +{rec.quantity.toLocaleString()} {prod?.unit || 'units'}
                      </td>

                      {/* Destination */}
                      <td className="py-4 px-4 text-xs font-medium text-[#242633]">
                        {rec.destinationLocation}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-[#686878]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{rec.date}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={rec.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isDone && !isCanceled ? (
                            <>
                              <button
                                onClick={() => validateReceipt(rec.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#242633] hover:bg-[#393c4e] text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                                title="Validate and increase warehouse stock"
                              >
                                <PackageCheck className="w-3.5 h-3.5 text-[#DBBA95]" />
                                <span>Validate</span>
                              </button>

                              <button
                                onClick={() => cancelReceipt(rec.id)}
                                className="p-1.5 rounded-xl text-[#686878] hover:text-[#E87883] hover:bg-white transition-colors"
                                title="Cancel receipt"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          ) : isDone ? (
                            <span className="flex items-center justify-end gap-1 text-xs font-semibold text-[#1a7e4e]">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Stocked</span>
                            </span>
                          ) : (
                            <span className="text-xs text-[#686878] italic">Voided</span>
                          )}
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
          <span>{filteredReceipts.length} receipts registered in system</span>
          <span className="text-[#1a7e4e] font-medium">Validations directly credit physical inventory</span>
        </div>
      </div>

      {/* Create Receipt Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Inbound Receipt"
        subtitle="Schedule or record a supplier consignment with automated receiving ledger"
        maxWidth="lg"
      >
        <CreateReceiptForm onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};
