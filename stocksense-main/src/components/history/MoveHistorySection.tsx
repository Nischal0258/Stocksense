import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ArrowUpDown,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../ui/StatusBadge';
import { MovementType } from '../../types/inventory';
import { useToast } from '../../context/ToastContext';

export const MoveHistorySection: React.FC = () => {
  const { movements, products } = useInventory();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.reference.toLowerCase().includes(search.toLowerCase()) ||
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.location.toLowerCase().includes(search.toLowerCase()) ||
      (m.toLocation && m.toLocation.toLowerCase().includes(search.toLowerCase())) ||
      m.user.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'ALL' || m.movementType === typeFilter;

    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const headers = [
      'Date',
      'Reference',
      'Product',
      'Location',
      'Movement Type',
      'Quantity Change',
      'Before Quantity',
      'After Quantity',
      'User',
      'Notes',
    ];

    const rows = filteredMovements.map((m) => [
      `"${m.date}"`,
      `"${m.reference}"`,
      `"${m.productName}"`,
      `"${m.location}${m.toLocation ? ` -> ${m.toLocation}` : ''}"`,
      `"${m.movementType}"`,
      m.quantityChange,
      m.beforeQuantity,
      m.afterQuantity,
      `"${m.user}"`,
      `"${m.notes || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stocksense_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Ledger Exported', 'CSV report downloaded successfully.', 'success');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#242633]">
            Move History Ledger
          </h2>
          <p className="text-xs sm:text-sm text-[#686878]">
            Immutable transaction record tracking every stock increment, dispatch, warehouse transfer, and audit adjustment
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#EEE8E3] text-[#242633] border border-[#EEE8E3] font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95 shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#1a7e4e]" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reference, product, location, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-xs sm:text-sm text-[#242633] outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] text-xs font-semibold text-[#242633] outline-none"
          >
            <option value="ALL">All Movement Types</option>
            <option value="Receipt">Receipts (Inbound)</option>
            <option value="Delivery">Deliveries (Outbound)</option>
            <option value="Transfer">Transfers (Internal)</option>
            <option value="Adjustment">Adjustments (Audits)</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-[#EEE8E3] bg-white/40 text-[11px] font-bold text-[#686878] uppercase tracking-wider">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-4">Reference</th>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4">Movement Type</th>
                <th className="py-4 px-4">Quantity Change</th>
                <th className="py-4 px-4">Before Qty</th>
                <th className="py-4 px-4">After Qty</th>
                <th className="py-4 px-6 text-right">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E3]/70 text-sm">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-[#686878]">
                    No ledger entries found matching your query.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const prod = products.find((p) => p.id === m.productId);
                  const isPositive = m.quantityChange > 0;
                  const isNegative = m.quantityChange < 0;

                  return (
                    <tr key={m.id} className="hover:bg-white/50 transition-colors">
                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-[#686878]">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#DBBA95]" />
                          <span>{m.date}</span>
                        </div>
                      </td>

                      {/* Reference */}
                      <td className="py-4 px-4 font-mono font-bold text-xs text-[#242633]">
                        {m.reference}
                      </td>

                      {/* Product */}
                      <td className="py-4 px-4 font-semibold text-[#242633]">
                        <div>
                          <span>{m.productName}</span>
                          {prod && (
                            <span className="block text-[11px] text-[#686878]">
                              {prod.sku}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-xs font-medium text-[#242633]">
                        <span>{m.location}</span>
                        {m.toLocation && (
                          <span className="text-[#855e30]"> → {m.toLocation}</span>
                        )}
                      </td>

                      {/* Movement Type */}
                      <td className="py-4 px-4">
                        <StatusBadge status={m.movementType} />
                      </td>

                      {/* Quantity Change */}
                      <td className="py-4 px-4 font-mono font-bold">
                        <span
                          className={
                            m.movementType === 'Transfer'
                              ? 'text-[#8a5538]'
                              : isPositive
                              ? 'text-[#1a7e4e]'
                              : isNegative
                              ? 'text-[#b92c3a]'
                              : 'text-[#686878]'
                          }
                        >
                          {m.movementType === 'Transfer'
                            ? `⇄ ${m.quantityChange}`
                            : `${isPositive ? '+' : ''}${m.quantityChange.toLocaleString()}`}
                          {' '}{prod?.unit || 'units'}
                        </span>
                      </td>

                      {/* Before Quantity */}
                      <td className="py-4 px-4 font-mono text-xs text-[#686878]">
                        {m.beforeQuantity.toLocaleString()}
                      </td>

                      {/* After Quantity */}
                      <td className="py-4 px-4 font-mono font-bold text-xs text-[#242633]">
                        {m.afterQuantity.toLocaleString()}
                      </td>

                      {/* User */}
                      <td className="py-4 px-6 text-right text-xs font-medium text-[#242633]">
                        <div className="flex items-center justify-end gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#DBBA95]" />
                          <span>{m.user}</span>
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
          <span>{filteredMovements.length} logged events in ledger</span>
          <span className="text-[#1a7e4e] font-medium">Cryptographically referenced inventory transactions</span>
        </div>
      </div>
    </div>
  );
};
