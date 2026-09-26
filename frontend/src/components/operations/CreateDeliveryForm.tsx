import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { DeliveryStatus } from '../../types/inventory';
import { ArrowUpRight } from 'lucide-react';

interface CreateDeliveryFormProps {
  onClose: () => void;
}

export const CreateDeliveryForm: React.FC<CreateDeliveryFormProps> = ({ onClose }) => {
  const { products, locations, createDelivery } = useInventory();

  const [customer, setCustomer] = useState('');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [sourceLocation, setSourceLocation] = useState(
    products[0]?.location || locations[0]?.name || 'Main Warehouse'
  );
  const [status, setStatus] = useState<DeliveryStatus>('Waiting');
  const [notes, setNotes] = useState('');

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || !productId || !quantity || Number(quantity) <= 0) return;

    const ok = await createDelivery({
      customer: customer.trim(),
      productId,
      productName: selectedProduct ? selectedProduct.name : 'Unknown Product',
      quantity: Number(quantity),
      sourceLocation,
      status,
      notes: notes.trim(),
    });

    if (ok) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Customer */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Customer / Consignee *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Titan Aerospace, Apex Dynamics"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#D0BCE1] focus:ring-2 focus:ring-[#D0BCE1]/20 text-sm text-[#242633] outline-none"
          />
        </div>

        {/* Product Select */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Product Item *
          </label>
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              const p = products.find((prod) => prod.id === e.target.value);
              if (p) setSourceLocation(p.location);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#D0BCE1] focus:ring-2 focus:ring-[#D0BCE1]/20 text-sm text-[#242633] outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Available: {p.currentStock} {p.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Dispatch Quantity ({selectedProduct?.unit || 'units'}) *
          </label>
          <input
            type="number"
            min="1"
            max={selectedProduct ? selectedProduct.currentStock : undefined}
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#D0BCE1] focus:ring-2 focus:ring-[#D0BCE1]/20 text-sm text-[#242633] outline-none"
          />
          {selectedProduct && selectedProduct.currentStock < Number(quantity) && (
            <p className="text-[11px] text-[#b92c3a] mt-1 font-semibold">
              Warning: Available stock is only {selectedProduct.currentStock} {selectedProduct.unit}. Validation will block until restocked.
            </p>
          )}
        </div>

        {/* Source Location */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Pick Source Location
          </label>
          <select
            value={sourceLocation}
            onChange={(e) => setSourceLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#D0BCE1] focus:ring-2 focus:ring-[#D0BCE1]/20 text-sm text-[#242633] outline-none"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Delivery Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DeliveryStatus)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#D0BCE1] focus:ring-2 focus:ring-[#D0BCE1]/20 text-sm text-[#242633] outline-none"
          >
            <option value="Waiting">Waiting (Pending Pick)</option>
            <option value="Ready">Ready (Staged at Bay)</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Dispatch Instructions
          </label>
          <input
            type="text"
            placeholder="e.g. Priority freight carrier dispatch, dock bay 4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#D0BCE1] focus:ring-2 focus:ring-[#D0BCE1]/20 text-sm text-[#242633] outline-none"
          />
        </div>
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
          <ArrowUpRight className="w-4 h-4 text-[#D0BCE1]" />
          <span>Create Delivery Order</span>
        </button>
      </div>
    </form>
  );
};
