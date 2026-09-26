import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  SlidersHorizontal,
  Trash2,
  Edit2,
  ArrowUpDown,
  Boxes,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Modal } from '../ui/Modal';
import { AddProductForm } from './AddProductForm';
import { Product } from '../../types/inventory';

export const ProductsTableSection: React.FC = () => {
  const { products, deleteProduct, updateProduct, setActiveModal } = useInventory();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Categories list
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      currentStock: Number(editingProduct.currentStock),
      reorderLevel: Number(editingProduct.reorderLevel),
      location: editingProduct.location,
      unitCost: Number(editingProduct.unitCost),
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#242633]">
            Product Catalog
          </h2>
          <p className="text-xs sm:text-sm text-[#686878]">
            {products.length} registered SKUs with real-time stock levels and replenishment triggers
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#DBBA95] via-[#F1D7C8] to-[#D0BCE1] text-[#242633] font-bold text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#686878] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name, SKU or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] focus:border-[#DBBA95] focus:ring-2 focus:ring-[#DBBA95]/20 text-xs sm:text-sm text-[#242633] outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] text-xs font-semibold text-[#242633] outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white/70 border border-[#EEE8E3] text-xs font-semibold text-[#242633] outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Light Glass Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm border border-white/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#EEE8E3] bg-white/40 text-[11px] font-bold text-[#686878] uppercase tracking-wider">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-4">SKU</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Location</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Reorder Level</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E3]/70 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#686878]">
                    No matching products found in catalog.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOut = p.currentStock === 0;
                  const isLow = p.currentStock > 0 && p.currentStock <= p.reorderLevel;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-white/50 transition-colors group"
                    >
                      {/* Product Name & Cost */}
                      <td className="py-4 px-6 font-semibold text-[#242633]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-[#EEE8E3] flex items-center justify-center text-[#DBBA95] shadow-2xs font-bold text-xs">
                            <Boxes className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-[#242633]">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-[#686878]">
                              ${p.unitCost.toFixed(2)} / {p.unit}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-xs font-semibold text-[#686878] bg-white/80 px-2.5 py-1 rounded-md border border-[#EEE8E3]">
                          {p.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-xs font-medium text-[#686878]">
                        {p.category}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4 text-xs font-medium text-[#242633]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#DBBA95]" />
                          <span>{p.location}</span>
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-base font-extrabold ${
                              isOut
                                ? 'text-[#b92c3a]'
                                : isLow
                                ? 'text-[#a86500]'
                                : 'text-[#242633]'
                            }`}
                          >
                            {p.currentStock.toLocaleString()}
                          </span>
                          <span className="text-xs text-[#686878]">{p.unit}</span>
                        </div>
                      </td>

                      {/* Reorder Level */}
                      <td className="py-4 px-4 text-xs font-medium text-[#686878]">
                        {p.reorderLevel.toLocaleString()} {p.unit}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          {/* Quick Adjust Button */}
                          <button
                            onClick={() => setActiveModal('adjustment')}
                            title="Quick Adjust Stock"
                            className="p-2 rounded-xl text-[#686878] hover:text-[#242633] hover:bg-white transition-colors"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => setEditingProduct(p)}
                            title="Edit Product"
                            className="p-2 rounded-xl text-[#686878] hover:text-[#242633] hover:bg-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            title="Delete Product"
                            className="p-2 rounded-xl text-[#686878] hover:text-[#E87883] hover:bg-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-white/40 border-t border-[#EEE8E3] flex items-center justify-between text-xs text-[#686878]">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <span>Catalog synchronized with real-time movements</span>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Catalog Product"
        subtitle="Register a new item, assign default location, and set automated reorder thresholds"
        maxWidth="xl"
      >
        <AddProductForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          title={`Edit ${editingProduct.name}`}
          subtitle={`SKU: ${editingProduct.sku} · Update storage parameters`}
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={editingProduct.name}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                  Current Stock ({editingProduct.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingProduct.currentStock}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      currentStock: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                  Reorder Level ({editingProduct.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingProduct.reorderLevel}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      reorderLevel: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.location}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
                  Unit Cost ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingProduct.unitCost}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      unitCost: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#EEE8E3] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#686878] hover:bg-[#EEE8E3]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#242633] text-white text-xs font-bold hover:bg-[#383a4c]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
