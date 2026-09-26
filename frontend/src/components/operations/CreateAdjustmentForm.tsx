import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { SlidersHorizontal, Calculator } from 'lucide-react';

interface CreateAdjustmentFormProps {
  onClose: () => void;
  preselectedProductId?: string;
}

export const CreateAdjustmentForm: React.FC<CreateAdjustmentFormProps> = ({
  onClose,
  preselectedProductId,
}) => {
  const { products, createAdjustment } = useInventory();

  const [productId, setProductId] = useState(preselectedProductId || products[0]?.id || '');
  const selectedProduct = products.find((p) => p.id === productId) || products[0];

  const recordedQuantity = selectedProduct ? selectedProduct.currentStock : 0;
  const [physicalCount, setPhysicalCount] = useState<number | ''>(recordedQuantity);
  const [reason, setReason] = useState('Cycle count calibration');
  const [customReason, setCustomReason] = useState('');

  // Auto-calculated difference: Difference = Physical Count - Recorded Quantity
  const countNumber = physicalCount === '' ? 0 : Number(physicalCount);
  const difference = countNumber - recordedQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || physicalCount === '') return;

    const finalReason = reason === 'Other' ? customReason.trim() : reason;

    await createAdjustment({
      productId,
      productName: selectedProduct.name,
      location: selectedProduct.location,
      recordedQuantity,
      physicalCount: countNumber,
      reason: finalReason || 'Physical inventory audit',
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {/* Product Select */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Select Product *
          </label>
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              const p = products.find((prod) => prod.id === e.target.value);
              if (p) setPhysicalCount(p.currentStock);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Recorded: {p.currentStock} {p.unit} ({p.location})
              </option>
            ))}
          </select>
        </div>

        {/* Calculation Grid */}
        <div className="p-4 rounded-2xl bg-white/80 border border-[#EEE8E3] space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EEE8E3]">
            <Calculator className="w-4 h-4 text-[#DBBA95]" />
            <span className="text-xs font-bold text-[#242633] uppercase tracking-wider">
              Automatic Variance Formula: Difference = Physical Count − Recorded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            {/* Recorded Quantity (Read-only) */}
            <div className="p-3 rounded-xl bg-[#EEE8E3]/60 border border-[#EEE8E3]">
              <span className="block text-[11px] font-bold text-[#686878] uppercase">
                Recorded Qty
              </span>
              <span className="text-xl font-extrabold text-[#242633]">
                {recordedQuantity.toLocaleString()}
              </span>
              <span className="text-xs text-[#686878] ml-1">{selectedProduct?.unit}</span>
            </div>

            {/* Physical Count Input */}
            <div>
              <label className="block text-[11px] font-bold text-[#242633] uppercase mb-1">
                Physical Count *
              </label>
              <input
                type="number"
                min="0"
                required
                value={physicalCount}
                onChange={(e) =>
                  setPhysicalCount(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#DBBA95] text-xl font-extrabold text-[#242633] outline-none focus:ring-2 focus:ring-[#DBBA95]/30"
              />
            </div>

            {/* Difference / Variance Display */}
            <div
              className={`p-3 rounded-xl border ${
                difference === 0
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : difference > 0
                  ? 'bg-[#49C98A]/15 border-[#49C98A]/40 text-[#1a7e4e]'
                  : 'bg-[#E87883]/15 border-[#E87883]/40 text-[#b92c3a]'
              }`}
            >
              <span className="block text-[11px] font-bold uppercase">
                Calculated Variance
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold">
                  {difference > 0 ? `+${difference}` : difference}
                </span>
                <span className="text-xs font-semibold">
                  {selectedProduct?.unit} ({difference === 0 ? 'Matched' : difference > 0 ? 'Surplus' : 'Deficit'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Audit Reason *
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          >
            <option value="Cycle count calibration">Cycle count calibration</option>
            <option value="Damaged during forklift transit">Damaged during transit / handling</option>
            <option value="Found misplaced unopened carton">Found misplaced inventory</option>
            <option value="Physical count discrepancy reconciliation">Discrepancy reconciliation</option>
            <option value="Quality inspection scrap">Quality inspection scrap</option>
            <option value="Other">Other (Custom specification)</option>
          </select>
        </div>

        {reason === 'Other' && (
          <div>
            <input
              type="text"
              required
              placeholder="Specify custom variance explanation..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] text-sm text-[#242633] outline-none"
            />
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[#EEE8E3] flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#686878] hover:bg-[#EEE8E3]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#242633] hover:bg-[#3a3d52] text-[#F7F3F0] text-sm font-semibold shadow-md transition-all active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#DBBA95]" />
          <span>Apply Stock Adjustment</span>
        </button>
      </div>
    </form>
  );
};
