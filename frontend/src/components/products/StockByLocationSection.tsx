import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Search,
  Filter,
  Boxes,
  ArrowRight,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { warehousesApi, WarehouseItem, LocationItem } from '../../api/services';
import { useInventory } from '../../context/InventoryContext';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../ui/StatusBadge';

interface LocationStockRecord {
  productId: string;
  productName: string;
  sku: string;
  category: string;
  warehouseId: number;
  warehouseName: string;
  locationId: number;
  locationName: string;
  locationCode: string;
  quantity: number;
  unit: string;
}

export const StockByLocationSection: React.FC = () => {
  const { products } = useInventory();
  const { showToast } = useToast();

  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | 'ALL'>('ALL');
  const [selectedLocationId, setSelectedLocationId] = useState<number | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load warehouses & locations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [whs, locs] = await Promise.all([
          warehousesApi.getWarehouses(),
          warehousesApi.getLocations(),
        ]);
        setWarehouses(whs);
        setLocations(locs);
      } catch (err: any) {
        showToast('Error', err.message || 'Failed to load location stock metadata', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute breakdown of stock per location from products and locations
  // Matches each product's primary and assigned locations
  const stockRecords: LocationStockRecord[] = React.useMemo(() => {
    const records: LocationStockRecord[] = [];

    products.forEach((p) => {
      // Find matching location by name/code or fallback to first warehouse location
      const matchedLoc = locations.find(
        (l) => l.code === p.location || l.name.toLowerCase() === p.location.toLowerCase()
      ) || locations[0];

      const wh = warehouses.find((w) => w.id === matchedLoc?.warehouse_id) || warehouses[0];

      records.push({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        category: p.category,
        warehouseId: wh?.id || 1,
        warehouseName: wh?.name || 'Main Warehouse',
        locationId: matchedLoc?.id || 1,
        locationName: matchedLoc?.name || p.location || 'General Storage',
        locationCode: matchedLoc?.code || p.location || 'GEN-01',
        quantity: p.currentStock,
        unit: p.unit,
      });
    });

    return records;
  }, [products, locations, warehouses]);

  // Filter records
  const filteredRecords = stockRecords.filter((rec) => {
    const matchesWarehouse =
      selectedWarehouseId === 'ALL' || rec.warehouseId === selectedWarehouseId;
    const matchesLocation =
      selectedLocationId === 'ALL' || rec.locationId === selectedLocationId;
    const matchesSearch =
      rec.productName.toLowerCase().includes(search.toLowerCase()) ||
      rec.sku.toLowerCase().includes(search.toLowerCase()) ||
      rec.locationName.toLowerCase().includes(search.toLowerCase()) ||
      rec.locationCode.toLowerCase().includes(search.toLowerCase());

    return matchesWarehouse && matchesLocation && matchesSearch;
  });

  // Aggregate stats per location
  const availableLocations = selectedWarehouseId === 'ALL'
    ? locations
    : locations.filter((l) => l.warehouse_id === selectedWarehouseId);

  const totalFilteredUnits = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header telemetry summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-3xl">
          <p className="text-xs font-bold text-[#686878] uppercase tracking-wider">
            Total Monitored Facilities
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#242633]">{warehouses.length}</span>
            <span className="text-xs text-[#855e30] font-semibold">Warehouses</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-3xl">
          <p className="text-xs font-bold text-[#686878] uppercase tracking-wider">
            Active Storage Zones & Bins
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#242633]">{locations.length}</span>
            <span className="text-xs text-[#b32b69] font-semibold">Tracked Locations</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-3xl">
          <p className="text-xs font-bold text-[#686878] uppercase tracking-wider">
            On-Hand Units in View
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#242633]">
              {totalFilteredUnits.toLocaleString()}
            </span>
            <span className="text-xs text-[#49C98A] font-semibold">Items in Stock</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU, item name, or bin location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#EEE8E3] text-xs sm:text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
          />
        </div>

        {/* Warehouse Selector */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#855e30] shrink-0" />
          <select
            value={selectedWarehouseId}
            onChange={(e) => {
              const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
              setSelectedWarehouseId(val);
              setSelectedLocationId('ALL');
            }}
            className="px-3 py-2 rounded-xl bg-white border border-[#EEE8E3] text-xs font-semibold text-[#242633] focus:border-[#DBBA95] focus:outline-none"
          >
            <option value="ALL">All Warehouses ({warehouses.length})</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name} ({wh.code})
              </option>
            ))}
          </select>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#b32b69] shrink-0" />
          <select
            value={selectedLocationId}
            onChange={(e) =>
              setSelectedLocationId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
            }
            className="px-3 py-2 rounded-xl bg-white border border-[#EEE8E3] text-xs font-semibold text-[#242633] focus:border-[#DBBA95] focus:outline-none"
          >
            <option value="ALL">All Storage Bins ({availableLocations.length})</option>
            {availableLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stock Distribution Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xs border border-[#EEE8E3]">
        <div className="p-4 sm:p-5 border-b border-[#EEE8E3] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#242633] flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#855e30]" />
              <span>Location Inventory Balances ({filteredRecords.length} items)</span>
            </h3>
            <p className="text-xs text-[#686878]">
              Real-time inventory levels broken down by facility and internal storage rack code
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EEE8E3] text-[11px] font-bold uppercase tracking-wider text-[#686878] bg-white/40">
                <th className="py-3 px-6">Product / SKU</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Storage Zone / Bin</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Quantity on Hand</th>
                <th className="py-3 px-6">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E3]/60 text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#686878]">
                    No inventory quants found matching your search or location filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => (
                  <tr key={`${rec.productId}-${rec.locationId}-${idx}`} className="hover:bg-white/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-[#242633]">{rec.productName}</p>
                      <p className="text-[11px] font-mono text-[#686878]">{rec.sku}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#242633]">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#855e30]" />
                        <span>{rec.warehouseName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#242633]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#b32b69]" />
                        <span>{rec.locationName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white border border-[#EEE8E3] font-mono text-[10px] text-[#686878]">
                          {rec.locationCode}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#686878]">
                      {rec.category}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#242633] text-sm">
                      {rec.quantity.toLocaleString()} <span className="text-xs font-normal text-[#686878]">{rec.unit}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      {rec.quantity <= 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          Depleted
                        </span>
                      ) : rec.quantity <= 15 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
