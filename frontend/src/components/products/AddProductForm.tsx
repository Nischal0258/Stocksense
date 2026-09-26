import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';

interface AddProductFormProps {
  onClose: () => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ onClose }) => {
  const { addProduct, locations, categories } = useInventory();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Raw Materials');
  const [unit, setUnit] = useState('units');
  const [initialStock, setInitialStock] = useState<number | ''>(100);
  const [reorderLevel, setReorderLevel] = useState<number | ''>(25);
  const [location, setLocation] = useState(locations[0]?.name || 'Main Warehouse');
  const [unitCost, setUnitCost] = useState<number | ''>(15.0);

  // Sync default category if categories load or change
  useEffect(() => {
    if (categories.length > 0 && (!category || !categories.some((c) => c.name === category))) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  // Sync default location if locations load or change
  useEffect(() => {
    if (locations.length > 0 && (!location || !locations.some((l) => l.name === location))) {
      setLocation(locations[0].name);
    }
  }, [locations, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) return;

    await addProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category,
      unit,
      currentStock: Number(initialStock) || 0,
      reorderLevel: Number(reorderLevel) || 0,
      location,
      unitCost: Number(unitCost) || 0,
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Product Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Carbon Steel Plates"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            SKU Code *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. CSP-4402"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] uppercase outline-none transition-all"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
            {categories.length === 0 && (
              <option value="General Inventory">General Inventory</option>
            )}
          </select>
        </div>

        {/* Unit of Measure */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Unit of Measure
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all"
          >
            <option value="units">units</option>
            <option value="kg">kg (kilograms)</option>
            <option value="meters">meters</option>
            <option value="pcs">pcs (pieces)</option>
            <option value="sheets">sheets</option>
            <option value="liters">liters</option>
            <option value="boxes">boxes</option>
          </select>
        </div>

        {/* Initial Stock */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Initial Stock Quantity
          </label>
          <input
            type="number"
            min="0"
            required
            value={initialStock}
            onChange={(e) => setInitialStock(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all"
          />
        </div>

        {/* Reorder Level */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Reorder Level (Alert Threshold)
          </label>
          <input
            type="number"
            min="0"
            required
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all"
          />
        </div>

        {/* Storage Location */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Default Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name} ({loc.type})
              </option>
            ))}
            {locations.length === 0 && (
              <option value="Main Warehouse">Main Warehouse</option>
            )}
          </select>
        </div>

        {/* Unit Cost */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5">
            Unit Cost ($ USD)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all"
          />
        </div>
      </div>

      <div className="pt-4 border-t border-[#EEE8E3] flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#686878] hover:text-[#242633] hover:bg-[#EEE8E3] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#242633] to-[#3a3d52] hover:from-[#3a3d52] hover:to-[#242633] text-[#F7F3F0] text-sm font-semibold shadow-md transition-all active:scale-95"
        >
          Add to Catalog
        </button>
      </div>
    </form>
  );
};
