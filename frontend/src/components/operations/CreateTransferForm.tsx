import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { ArrowLeftRight } from 'lucide-react';

interface CreateTransferFormProps {
  onClose: () => void;
}

export const CreateTransferForm: React.FC<CreateTransferFormProps> = ({ onClose }) => {
  const { products, locations, createTransfer } = useInventory();

  const [productId, setProductId] = useState(products[0]?.id || '');
  const selectedProduct = products.find((p) => p.id === productId);

  const [fromLocation, setFromLocation] = useState(
    selectedProduct?.location || locations[0]?.name || 'Main Warehouse'
  );
  const [toLocation, setToLocation] = useState(
    locations[1]?.name || 'Production Floor'
  );
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity || Number(quantity) <= 0) return;

    const success = await createTransfer({
      productId,
      productName: selectedProduct ? selectedProduct.name : 'Unknown Product',
      fromLocation,
      toLocation,
      quantity: Number(quantity),
      notes: notes.trim(),
    });

    if (success) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product Item */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Select Product *
          </label>
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              const p = products.find((prod) => prod.id === e.target.value);
              if (p) setFromLocation(p.location);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Total Stock: {p.currentStock} {p.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Source Location */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            From Location *
          </label>
          <select
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name} ({loc.type})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Location */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            To Location *
          </label>
          <select
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name} disabled={loc.name === fromLocation}>
                {loc.name} {loc.name === fromLocation ? '(Source)' : `(${loc.type})`}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Transfer Quantity ({selectedProduct?.unit || 'units'}) *
          </label>
          <input
            type="number"
            min="1"
            max={selectedProduct ? selectedProduct.currentStock : undefined}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          />
        </div>

        {/* Note / Reason */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Transfer Reason / Work Order
          </label>
          <input
            type="text"
            placeholder="e.g. Line replenishment, staging balance"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          />
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-[#DBBA95]/15 border border-[#DBBA95]/30 text-xs text-[#855e30]">
        <span className="font-bold">Total Company Stock Invariant:</span> Internal transfers relocate inventory between warehouse bins without altering the enterprise total.
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
          <ArrowLeftRight className="w-4 h-4 text-[#F1D7C8]" />
          <span>Execute Transfer</span>
        </button>
      </div>
    </form>
  );
};
