import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Edit2,
  Lock,
  Plus,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingDown,
  Truck,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';
import { Product } from '../../types/inventory';

export const ReorderRulesSection: React.FC = () => {
  const { products, updateProduct, createReceipt, setActiveRoute } = useInventory();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isManager = user?.role === 'inventory_manager';

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [minThreshold, setMinThreshold] = useState<number>(0);
  const [reorderQty, setReorderQty] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'DEFICIT' | 'SAFE'>('ALL');

  // Products with calculations
  const evaluatedRules = products.map((p) => {
    const isBelow = p.currentStock <= p.reorderLevel;
    const deficit = Math.max(0, p.reorderLevel - p.currentStock);
    return {
      ...p,
      isBelow,
      deficit,
      recommendedOrderQty: Math.max(50, deficit + 25),
    };
  });

  const filteredRules = evaluatedRules.filter((r) => {
    if (filterMode === 'DEFICIT') return r.isBelow;
    if (filterMode === 'SAFE') return !r.isBelow;
    return true;
  });

  const belowCount = evaluatedRules.filter((r) => r.isBelow).length;
  const safeCount = evaluatedRules.length - belowCount;

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setMinThreshold(p.reorderLevel);
    setReorderQty(50);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSubmitting(true);
    try {
      await updateProduct(editingProduct.id, {
        reorderLevel: Number(minThreshold),
      });
      showToast(
        'Rule Saved',
        `Reorder threshold for ${editingProduct.name} set to ${minThreshold} ${editingProduct.unit}.`,
        'success'
      );
      setEditingProduct(null);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update reorder rule', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantReplenish = async (item: typeof evaluatedRules[0]) => {
    try {
      await createReceipt({
        supplier: 'Auto-Replenish System',
        productId: item.id,
        productName: item.name,
        quantity: item.recommendedOrderQty,
        destinationLocation: item.location || 'WH1-MAIN',
        status: 'Waiting',
        notes: `Automated replenishment PO triggered due to threshold deficit of ${item.deficit} units.`,
      });
      showToast(
        'Replenishment Draft Created',
        `Draft Inbound Receipt scheduled for ${item.recommendedOrderQty} units of ${item.name}.`,
        'success'
      );
      setActiveRoute('receipts');
    } catch (err: any) {
      showToast('Action Failed', err.message || 'Could not schedule replenishment.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-3xl">
          <p className="text-xs font-bold text-[#686878] uppercase tracking-wider">
            Total Monitored SKUs
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#242633]">{products.length}</span>
            <span className="text-xs text-[#855e30] font-semibold">Active Rules</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-3xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            Below Safety Threshold
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-700">{belowCount}</span>
            <span className="text-xs text-amber-800 font-bold">Action Required</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Optimal Stock Balance
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700">{safeCount}</span>
            <span className="text-xs text-emerald-800 font-semibold">Above Threshold</span>
          </div>
        </div>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex p-1 bg-white/70 rounded-2xl border border-[#EEE8E3]">
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterMode === 'ALL'
                ? 'bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] shadow-xs'
                : 'text-[#686878] hover:text-[#242633]'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('DEFICIT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterMode === 'DEFICIT'
                ? 'bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] shadow-xs'
                : 'text-[#686878] hover:text-[#242633]'
            }`}
          >
            Needs Replenishment ({belowCount})
          </button>
          <button
            onClick={() => setFilterMode('SAFE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterMode === 'SAFE'
                ? 'bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] shadow-xs'
                : 'text-[#686878] hover:text-[#242633]'
            }`}
          >
            Adequately Stocked ({safeCount})
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xs border border-[#EEE8E3]">
        <div className="p-4 sm:p-5 border-b border-[#EEE8E3] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#242633] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#855e30]" />
              <span>Automated Reordering Matrix</span>
            </h3>
            <p className="text-xs text-[#686878]">
              Triggers replenishment consignments whenever physical count drops below minimum threshold
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EEE8E3] text-[11px] font-bold uppercase tracking-wider text-[#686878] bg-white/40">
                <th className="py-3 px-6">Product / SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Safety Threshold (Min)</th>
                <th className="py-3 px-4">Deficit Amount</th>
                <th className="py-3 px-4">Inventory Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E3]/60 text-xs">
              {filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#686878]">
                    No inventory records match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-[#242633]">{rule.name}</p>
                      <p className="text-[11px] font-mono text-[#686878]">{rule.sku}</p>
                    </td>

                    <td className="py-3.5 px-4 font-black text-[#242633] text-sm">
                      {rule.currentStock.toLocaleString()} {rule.unit}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#686878]">
                      {rule.reorderLevel.toLocaleString()} {rule.unit}
                    </td>

                    <td className="py-3.5 px-4">
                      {rule.deficit > 0 ? (
                        <span className="font-bold text-rose-600">
                          -{rule.deficit} {rule.unit}
                        </span>
                      ) : (
                        <span className="font-medium text-[#49C98A]">0 (Surplus)</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {rule.currentStock <= 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Depleted
                        </span>
                      ) : rule.isBelow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Reorder Triggered
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Optimal
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {rule.isBelow && (
                          <button
                            onClick={() => handleInstantReplenish(rule)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] font-bold text-[11px] shadow-xs hover:shadow-md transition-all"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>1-Click Restock</span>
                          </button>
                        )}

                        {isManager ? (
                          <button
                            onClick={() => handleOpenEdit(rule)}
                            title="Edit Reorder Threshold"
                            className="p-1.5 rounded-xl text-[#686878] hover:text-[#242633] hover:bg-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span
                            title="Only Managers can edit reorder safety thresholds"
                            className="p-1.5 text-[#686878]/50 cursor-not-allowed"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Reorder Rule Modal */}
      {editingProduct && (
        <Modal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title={`Edit Reorder Threshold: ${editingProduct.name}`}
          subtitle={`SKU: ${editingProduct.sku} · Configure automated replenishment safety parameters`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveRule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                Minimum Safe Stock Threshold ({editingProduct.unit})
              </label>
              <input
                type="number"
                min="0"
                required
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20 font-bold"
              />
              <p className="text-[11px] text-[#686878] mt-1">
                When current stock reaches or dips below this number, low stock warnings and reorder alerts will fire automatically.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                Standard Reorder Batch Size ({editingProduct.unit})
              </label>
              <input
                type="number"
                min="1"
                required
                value={reorderQty}
                onChange={(e) => setReorderQty(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
              />
              <p className="text-[11px] text-[#686878] mt-1">
                Recommended quantity to order from suppliers whenever a restock consignment is created.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E3]">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#686878] hover:text-[#242633]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Reorder Rule</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
