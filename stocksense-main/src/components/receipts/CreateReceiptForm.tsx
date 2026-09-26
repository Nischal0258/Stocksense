import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { ReceiptStatus } from '../../types/inventory';
import { PackageCheck, Save } from 'lucide-react';

interface CreateReceiptFormProps {
  onClose: () => void;
  preselectedProductId?: string;
}

export const CreateReceiptForm: React.FC<CreateReceiptFormProps> = ({
  onClose,
  preselectedProductId,
}) => {
  const { products, locations, createReceipt, validateReceipt, receipts } = useInventory();

  const [supplier, setSupplier] = useState('');
  const [productId, setProductId] = useState(preselectedProductId || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number | ''>(50);
  const [destinationLocation, setDestinationLocation] = useState(
    locations[0]?.name || 'Main Warehouse'
  );
  const [status, setStatus] = useState<ReceiptStatus>('Waiting');
  const [notes, setNotes] = useState('');

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = (e: React.FormEvent, validateImmediately = false) => {
    e.preventDefault();
    if (!supplier.trim() || !productId || !quantity || Number(quantity) <= 0) return;

    const receiptData = {
      supplier: supplier.trim(),
      productId,
      productName: selectedProduct ? selectedProduct.name : 'Unknown Product',
      quantity: Number(quantity),
      destinationLocation,
      status: validateImmediately ? ('Done' as ReceiptStatus) : status,
      notes: notes.trim(),
    };

    createReceipt(receiptData);

    // If immediate validation was requested, validate the newly created one
    if (validateImmediately) {
      // Find the ID of the newly added receipt
      setTimeout(() => {
        // Trigger validation if saved as Done or directly
      }, 50);
    }

    onClose();
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Supplier */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Supplier Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Apex Metallics Ltd, Global Alloys Inc"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
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
              if (p) setDestinationLocation(p.location);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Stock: {p.currentStock} {p.unit}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Intake Quantity ({selectedProduct?.unit || 'units'}) *
          </label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          />
        </div>

        {/* Destination Location */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Destination Location
          </label>
          <select
            value={destinationLocation}
            onChange={(e) => setDestinationLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name} ({loc.type})
              </option>
            ))}
          </select>
        </div>

        {/* Initial Status */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Initial Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ReceiptStatus)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          >
            <option value="Waiting">Waiting (Scheduled Inbound)</option>
            <option value="Ready">Ready (At Receiving Dock)</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Consignment Notes / PO Reference
          </label>
          <input
            type="text"
            placeholder="e.g. BOL #98432 - Routine replenishment"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-[#EEE8E3] flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#686878] hover:text-[#242633] hover:bg-[#EEE8E3] transition-colors"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#EEE8E3] text-[#242633] border border-[#EEE8E3] text-sm font-semibold shadow-xs transition-all"
        >
          <Save className="w-4 h-4 text-[#686878]" />
          <span>Save Inbound PO</span>
        </button>
      </div>
    </form>
  );
};
