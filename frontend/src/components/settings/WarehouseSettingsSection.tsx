import React, { useState, useEffect } from 'react';
import {
  Warehouse as WarehouseIcon,
  MapPin,
  Plus,
  Boxes,
  Lock,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  RefreshCw,
  FolderTree,
  Building2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { warehousesApi, WarehouseItem, LocationItem } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';

export const WarehouseSettingsSection: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isManager = user?.role === 'inventory_manager';

  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | 'ALL'>('ALL');

  // Modals
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false);
  const [isAddLocModalOpen, setIsAddLocModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New warehouse form
  const [whName, setWhName] = useState('');
  const [whCode, setWhCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  // New location form
  const [locWhId, setLocWhId] = useState<number>(1);
  const [locName, setLocName] = useState('');
  const [locCode, setLocCode] = useState('');
  const [locType, setLocType] = useState('internal');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [whData, locData] = await Promise.all([
        warehousesApi.getWarehouses(),
        warehousesApi.getLocations(),
      ]);
      setWarehouses(whData);
      setLocations(locData);
      if (whData.length > 0 && !locWhId) {
        setLocWhId(whData[0].id);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load warehouses', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim() || !whCode.trim()) {
      showToast('Missing Fields', 'Warehouse name and code are required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await warehousesApi.createWarehouse({
        name: whName.trim(),
        code: whCode.trim().toUpperCase(),
        address: whAddress.trim() || undefined,
        is_active: true,
      });
      showToast('Warehouse Created', `Facility '${whName}' registered successfully.`, 'success');
      setWhName('');
      setWhCode('');
      setWhAddress('');
      setIsAddWhModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('Creation Failed', err.message || 'Could not create warehouse.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locName.trim() || !locCode.trim()) {
      showToast('Missing Fields', 'Location name and code are required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await warehousesApi.createLocation({
        warehouse_id: locWhId,
        name: locName.trim(),
        code: locCode.trim().toUpperCase(),
        type: locType,
      });
      showToast('Location Added', `Storage zone '${locName}' added successfully.`, 'success');
      setLocName('');
      setLocCode('');
      setIsAddLocModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast('Creation Failed', err.message || 'Could not add storage location.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWarehouse = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete warehouse '${name}'? This cannot be undone.`)) {
      return;
    }

    try {
      await warehousesApi.deleteWarehouse(id);
      showToast('Deleted', `Warehouse '${name}' deleted.`, 'info');
      await loadData();
    } catch (err: any) {
      showToast('Cannot Delete', err.message || 'Warehouse has active inventory or records.', 'error');
    }
  };

  const filteredLocations = selectedWarehouseId === 'ALL'
    ? locations
    : locations.filter((l) => l.warehouse_id === selectedWarehouseId);

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#242633]">
            Warehouse & Location Settings
          </h2>
          <p className="text-xs sm:text-sm text-[#686878]">
            Configure physical distribution hubs, internal racking, dispatch bays, and vendor docks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh warehouse data"
            className="p-2.5 rounded-2xl bg-white/70 border border-[#EEE8E3] text-[#686878] hover:text-[#242633] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {isManager ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddWhModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Warehouse</span>
              </button>
              <button
                onClick={() => setIsAddLocModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#EEE8E3] text-[#242633] font-bold text-xs sm:text-sm hover:bg-[#F7F3F0] transition-all"
              >
                <Plus className="w-4 h-4 text-[#DBBA95]" />
                <span>Add Location</span>
              </button>
            </div>
          ) : (
            <span
              title="Warehouse infrastructure can only be configured by Inventory Managers"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 border border-[#EEE8E3] text-[#686878] text-xs font-semibold"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Manager Settings Only</span>
            </span>
          )}
        </div>
      </div>

      {/* Staff Notice Banner */}
      {!isManager && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#242633]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#242633]">Warehouse Staff View (Infrastructure Locked)</p>
              <p className="text-[11px] text-[#686878]">
                Staff can view assigned facilities and bin codes for pick and pack operations. Adding new warehouses or creating rack zones requires Inventory Manager authorization.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-800">
            View-Only Access
          </span>
        </div>
      )}

      {/* Warehouses Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#242633] uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#855e30]" />
          <span>Active Distribution Centers & Facilities ({warehouses.length})</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh) => {
            const whLocations = locations.filter((l) => l.warehouse_id === wh.id);
            const isSelected = selectedWarehouseId === wh.id;

            return (
              <div
                key={wh.id}
                onClick={() => setSelectedWarehouseId(isSelected ? 'ALL' : wh.id)}
                className={`glass-panel p-5 rounded-3xl cursor-pointer transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'ring-2 ring-[#FABED7] shadow-md bg-white'
                    : 'hover:shadow-md hover:bg-white/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#DBBA95]/30 to-[#F07BAF]/30 flex items-center justify-center text-[#242633] font-bold">
                      <WarehouseIcon className="w-5 h-5 text-[#855e30]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#242633] group-hover:text-[#855e30] transition-colors">
                        {wh.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#242633] text-white text-[10px] font-extrabold uppercase tracking-wider">
                          {wh.code}
                        </span>
                        <span className="text-[11px] text-[#49C98A] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#49C98A]" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {isManager && warehouses.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWarehouse(wh.id, wh.name);
                      }}
                      title="Delete Warehouse"
                      className="p-1.5 rounded-lg text-[#686878] hover:text-[#E87883] hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#EEE8E3]/80 space-y-2 text-xs text-[#686878]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#686878] shrink-0" />
                    <span className="truncate">{wh.address || 'Address not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#DBBA95]" />
                      Storage Zones
                    </span>
                    <span className="font-bold text-[#242633]">{whLocations.length} locations</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-3 py-1 text-center text-[11px] font-bold text-[#b32b69] bg-[#FABED7]/25 rounded-xl">
                    Filtering locations below
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage Locations Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xs border border-[#EEE8E3]">
        <div className="p-4 sm:p-6 border-b border-[#EEE8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#242633] flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#855e30]" />
              <span>Storage Bin & Rack Locations ({filteredLocations.length})</span>
            </h3>
            <p className="text-xs text-[#686878]">
              {selectedWarehouseId === 'ALL'
                ? 'Showing all storage locations across all warehouses'
                : `Filtered by selected warehouse`}
            </p>
          </div>

          {selectedWarehouseId !== 'ALL' && (
            <button
              onClick={() => setSelectedWarehouseId('ALL')}
              className="text-xs font-bold text-[#855e30] hover:underline"
            >
              Show All Warehouses
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EEE8E3] text-[11px] font-bold uppercase tracking-wider text-[#686878] bg-white/40">
                <th className="py-3 px-6">Location Name</th>
                <th className="py-3 px-4">Bin Code</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E3]/60 text-xs">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#686878]">
                    No locations configured for this facility.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-[#242633] flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#DBBA95]" />
                      <span>{loc.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#242633]">
                      <span className="px-2 py-0.5 rounded-md bg-white border border-[#EEE8E3]">
                        {loc.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#686878]">
                      {loc.warehouse_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F7F3F0] text-[#242633] border border-[#EEE8E3]">
                        {loc.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#49C98A]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Operational
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Warehouse Modal */}
      <Modal
        isOpen={isAddWhModalOpen}
        onClose={() => setIsAddWhModalOpen(false)}
        title="Register New Warehouse"
        subtitle="Establish a new physical distribution center or regional fulfillment hub"
        maxWidth="md"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
              Warehouse Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. West Coast Distribution Center"
              value={whName}
              onChange={(e) => setWhName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
              Facility Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WDC-01"
              value={whCode}
              onChange={(e) => setWhCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] uppercase focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20 font-mono"
            />
            <p className="text-[11px] text-[#686878] mt-1">
              Unique 2-6 character identifier used in storage bin prefixes.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
              Physical Address
            </label>
            <input
              type="text"
              placeholder="e.g. 100 Logistics Blvd, Dock 4, Seattle, WA"
              value={whAddress}
              onChange={(e) => setWhAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E3]">
            <button
              type="button"
              onClick={() => setIsAddWhModalOpen(false)}
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
              <span>Create Warehouse</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Location Modal */}
      <Modal
        isOpen={isAddLocModalOpen}
        onClose={() => setIsAddLocModalOpen(false)}
        title="Add Storage Bin Location"
        subtitle="Define an internal rack, shelf, staging zone, or intake dock"
        maxWidth="md"
      >
        <form onSubmit={handleCreateLocation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
              Warehouse Facility
            </label>
            <select
              value={locWhId}
              onChange={(e) => setLocWhId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
              Location Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aisle 3, Rack B"
              value={locName}
              onChange={(e) => setLocName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                Location Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. A3-RACK-B"
                value={locCode}
                onChange={(e) => setLocCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] uppercase font-mono focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                Location Type
              </label>
              <select
                value={locType}
                onChange={(e) => setLocType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
              >
                <option value="internal">Internal Storage</option>
                <option value="vendor">Vendor Receiving Dock</option>
                <option value="customer">Customer Dispatch Bay</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E3]">
            <button
              type="button"
              onClick={() => setIsAddLocModalOpen(false)}
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
              <span>Add Location</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
