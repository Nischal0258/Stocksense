import React, { useState } from 'react';
import {
  Search,
  Plus,
  ArrowUpRight,
  PackageCheck,
  Ban,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { CreateDeliveryForm } from './CreateDeliveryForm';

export const DeliveriesSection: React.FC = () => {
  const { deliveries, validateDelivery, cancelDelivery, products } = useInventory();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.reference.toLowerCase().includes(search.toLowerCase()) ||
      d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.productName.toLowerCase().includes(search.toLowerCase()) ||
      d.sourceLocation.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#242633]">
            Outbound Deliveries
          </h2>
          <p className="text-xs sm:text-sm text-[#686878]">
            Order fulfillment staging, dispatch verification, and automated inventory deduction with overdraw guard
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#DBBA95] via-[#F1D7C8] to-[#D0BCE1] text-[#242633] font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Delivery</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deliveries by customer, reference, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] focus:border-[#D0BCE1] focus:ring-2 focus:ring-[#D0BCE1]/20 text-xs sm:text-sm text-[#242633] outline-none"
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
            <option value="Done">Done (Dispatched)</option>
            <option value="Draft">Draft</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-[#EEE8E3] bg-white/40 text-[11px] font-bold text-[#686878] uppercase tracking-wider">
                <th className="py-4 px-6">Reference</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Product Item</th>
                <th className="py-4 px-4">Dispatch Qty</th>
                <th className="py-4 px-4">Source Location</th>
                <th className="py-4 px-4">Date</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E3]/70 text-sm">
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#686878]">
                    No deliveries found matching your search.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => {
                  const prod = products.find((p) => p.id === del.productId);
                  const isDone = del.status === 'Done';
                  const isCanceled = del.status === 'Canceled';
                  const hasSufficientStock = prod ? prod.currentStock >= del.quantity : false;

                  return (
                    <tr key={del.id} className="hover:bg-white/50 transition-colors">
                      {/* Reference */}
                      <td className="py-4 px-6 font-mono font-bold text-xs text-[#242633]">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-md bg-[#D0BCE1]/25 text-[#5e4479]">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                          <span>{del.reference}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 font-semibold text-[#242633]">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-[#686878]" />
                          <span>{del.customer}</span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-[#242633]">
                          {del.productName}
                        </span>
                        {prod && (
                          <span className="block text-[11px] text-[#686878]">
                            Stock: {prod.currentStock} {prod.unit}
                          </span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4 font-extrabold text-[#b92c3a]">
                        -{del.quantity.toLocaleString()} {prod?.unit || 'units'}
                      </td>

                      {/* Source Location */}
                      <td className="py-4 px-4 text-xs font-medium text-[#242633]">
                        {del.sourceLocation}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-xs text-[#686878]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{del.date}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={del.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isDone && !isCanceled ? (
                            <>
                              <button
                                onClick={() => validateDelivery(del.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 ${
                                  hasSufficientStock
                                    ? 'bg-[#242633] hover:bg-[#393c4e] text-white'
                                    : 'bg-[#EEE8E3] text-[#686878] hover:bg-[#F5A623]/20 hover:text-[#a86500]'
                                }`}
                                title={
                                  hasSufficientStock
                                    ? 'Validate and deduct from warehouse inventory'
                                    : `Insufficient stock (${prod?.currentStock || 0} available). Will block validation.`
                                }
                              >
                                <PackageCheck className="w-3.5 h-3.5 text-[#DBBA95]" />
                                <span>Validate</span>
                                {!hasSufficientStock && (
                                  <AlertTriangle className="w-3 h-3 text-[#F5A623]" />
                                )}
                              </button>

                              <button
                                onClick={() => cancelDelivery(del.id)}
                                className="p-1.5 rounded-xl text-[#686878] hover:text-[#E87883] hover:bg-white transition-colors"
                                title="Cancel delivery"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          ) : isDone ? (
                            <span className="flex items-center justify-end gap-1 text-xs font-semibold text-[#1a7e4e]">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Dispatched</span>
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
          <span>{filteredDeliveries.length} orders tracked in dispatch queue</span>
          <span className="text-[#a86500] font-medium">Overdraw protection actively prevents negative balances</span>
        </div>
      </div>

      {/* Create Delivery Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Outbound Delivery Order"
        subtitle="Stage customer fulfillment order with stock availability verification"
        maxWidth="lg"
      >
        <CreateDeliveryForm onClose={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  );
};
