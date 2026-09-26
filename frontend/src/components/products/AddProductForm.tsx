import React, { useState, useEffect } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import {
  categoriesApi,
  warehousesApi,
  productsApi,
  CategoryItem,
  WarehouseItem,
  LocationItem,
} from '../../api/services';
import { Building2, MapPin, Tag, Boxes } from 'lucide-react';

interface AddProductFormProps {
  onClose: () => void;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({ onClose }) => {
  const {
    refreshData,
    categories: ctxCategories,
    warehouses: ctxWarehouses,
    locations: ctxLocations,
  } = useInventory();
  const { showToast } = useToast();

  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(ctxCategories || []);
  const [warehousesList, setWarehousesList] = useState<WarehouseItem[]>(ctxWarehouses || []);
  const [locationsList, setLocationsList] = useState<LocationItem[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(
    ctxCategories?.[0]?.id || 1
  );
  const [unit, setUnit] = useState('units');
  const [initialStock, setInitialStock] = useState<number | ''>(100);
  const [reorderLevel, setReorderLevel] = useState<number | ''>(25);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number>(
    ctxWarehouses?.[0]?.id || 1
  );
  const [selectedLocationId, setSelectedLocationId] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number | ''>(15.0);

  // Always fetch latest categories, warehouses, and storage locations directly from API on open
  useEffect(() => {
    let isMounted = true;
    const fetchFreshMeta = async () => {
      setIsLoadingMeta(true);
      try {
        const [cats, whs, locs] = await Promise.all([
          categoriesApi.getCategories(),
          warehousesApi.getWarehouses(),
          warehousesApi.getLocations(),
        ]);
        if (!isMounted) return;

        setCategoriesList(cats);
        setWarehousesList(whs);
        setLocationsList(locs);

        // Pre-select first category if not already valid
        if (cats.length > 0 && !cats.some((c) => c.id === selectedCategoryId)) {
          setSelectedCategoryId(cats[0].id);
        }

        // Pre-select first warehouse if not already valid
        let activeWhId = selectedWarehouseId;
        if (whs.length > 0 && !whs.some((w) => w.id === selectedWarehouseId)) {
          activeWhId = whs[0].id;
          setSelectedWarehouseId(activeWhId);
        }

        // Pre-select first location for the active warehouse
        const matchingLocs = locs.filter((l) => l.warehouse_id === activeWhId);
        if (matchingLocs.length > 0) {
          setSelectedLocationId(matchingLocs[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching latest product metadata:', err);
      } finally {
        if (isMounted) setIsLoadingMeta(false);
      }
    };

    fetchFreshMeta();
    return () => {
      isMounted = false;
    };
  }, []);

  // When selected warehouse changes, update available location
  const filteredLocations = locationsList.filter(
    (l) => l.warehouse_id === selectedWarehouseId
  );

  const handleWarehouseChange = (whId: number) => {
    setSelectedWarehouseId(whId);
    const whLocs = locationsList.filter((l) => l.warehouse_id === whId);
    if (whLocs.length > 0) {
      setSelectedLocationId(whLocs[0].id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      showToast('Validation Error', 'Product name and SKU are required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await productsApi.createProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        category_id: selectedCategoryId,
        unit_of_measure: unit,
        reorder_level: Number(reorderLevel) || 10,
        reorder_qty: 25,
        initial_stock: Number(initialStock) || 0,
        initial_location_id: selectedLocationId,
      });

      await refreshData();
      showToast('Product Created', `${name.trim()} (${sku.trim().toUpperCase()}) added to catalog.`, 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to Add Product', err.message || 'Error creating product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-[#DBBA95]" />
            <span>Product Name *</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Brake Discs & Calipers"
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
            placeholder="e.g. AP-BRK-990"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] uppercase outline-none transition-all"
          />
        </div>

        {/* Dynamic Category Selector */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#DBBA95]" />
            <span>Category *</span>
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all font-medium"
          >
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            {categoriesList.length === 0 && (
              <option value={1}>General Inventory</option>
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

        {/* Warehouse Selection */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#DBBA95]" />
            <span>Warehouse Facility *</span>
          </label>
          <select
            value={selectedWarehouseId}
            onChange={(e) => handleWarehouseChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all font-medium"
          >
            {warehousesList.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
            {warehousesList.length === 0 && (
              <option value={1}>Central Warehouse</option>
            )}
          </select>
        </div>

        {/* Storage Location / Bin for Selected Warehouse */}
        <div>
          <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#DBBA95]" />
            <span>Storage Location / Bin *</span>
          </label>
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-sm text-[#242633] outline-none transition-all font-medium"
          >
            {filteredLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.type === 'internal' ? 'Internal Storage' : loc.type}) - {loc.code}
              </option>
            ))}
            {filteredLocations.length === 0 && (
              <option value={selectedLocationId}>Main Storage (Default Bay)</option>
            )}
          </select>
        </div>

        {/* Unit Cost */}
        <div className="sm:col-span-2">
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
          disabled={isSubmitting}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#686878] hover:text-[#242633] hover:bg-[#EEE8E3] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isLoadingMeta}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#242633] to-[#3a3d52] hover:from-[#3a3d52] hover:to-[#242633] text-[#F7F3F0] text-sm font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? 'Registering...' : 'Add to Catalog'}
        </button>
      </div>
    </form>
  );
};
