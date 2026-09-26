import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Boxes,
  Trash2,
  Lock,
  ShieldAlert,
  Search,
  RefreshCw,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import { categoriesApi, CategoryItem } from '../../api/services';
import { useInventory } from '../../context/InventoryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../ui/Modal';

export const CategoriesSection: React.FC = () => {
  const { products, refreshData } = useInventory();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isManager = user?.role === 'inventory_manager';

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await categoriesApi.getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].name);
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch categories', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('Missing Name', 'Category name is required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await categoriesApi.createCategory({
        name: catName.trim(),
        description: catDescription.trim() || undefined,
      });
      showToast('Category Created', `Category '${catName}' added successfully.`, 'success');
      setCatName('');
      setCatDescription('');
      setIsAddModalOpen(false);
      await loadCategories();
      await refreshData();
    } catch (err: any) {
      showToast('Creation Error', err.message || 'Could not create category.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete category '${name}'? Products in this category will become unassigned.`)) {
      return;
    }

    try {
      await categoriesApi.deleteCategory(id);
      showToast('Category Deleted', `Category '${name}' deleted.`, 'info');
      await loadCategories();
      await refreshData();
      if (selectedCategory === name) {
        setSelectedCategory(null);
      }
    } catch (err: any) {
      showToast('Delete Failed', err.message || 'Could not delete category.', 'error');
    }
  };

  // Products belonging to currently selected category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase())
    : [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-[#242633]">
            Product Categories & Taxonomies
          </h3>
          <p className="text-xs sm:text-sm text-[#686878]">
            Organize inventory into structured classification hierarchies for streamlined auditing
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadCategories}
            title="Refresh categories"
            className="p-2.5 rounded-2xl bg-white/70 border border-[#EEE8E3] text-[#686878] hover:text-[#242633] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {isManager ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          ) : (
            <span
              title="Category taxonomy is managed by Inventory Managers"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/70 border border-[#EEE8E3] text-[#686878] text-xs font-semibold"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Manager Managed Only</span>
            </span>
          )}
        </div>
      </div>

      {/* Staff View Banner */}
      {!isManager && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#242633]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#242633]">Warehouse Staff View</p>
              <p className="text-[11px] text-[#686878]">
                Staff can browse catalog categories and explore products within each taxonomy. Creating or deleting categories requires Inventory Manager role.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
          const liveProductCount = products.filter(
            (p) => p.category.toLowerCase() === cat.name.toLowerCase()
          ).length;

          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`glass-panel p-5 rounded-3xl cursor-pointer transition-all relative overflow-hidden group ${
                isSelected
                  ? 'ring-2 ring-[#FABED7] shadow-md bg-white'
                  : 'hover:shadow-md hover:bg-white/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#DBBA95]/30 to-[#F07BAF]/30 flex items-center justify-center text-[#242633] font-bold">
                    <Tag className="w-5 h-5 text-[#855e30]" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#242633] group-hover:text-[#855e30] transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-[#686878] mt-0.5 line-clamp-1">
                      {cat.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {isManager && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat.id, cat.name);
                    }}
                    title="Delete Category"
                    className="p-1.5 rounded-lg text-[#686878] hover:text-[#E87883] hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#EEE8E3]/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#686878] flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-[#DBBA95]" />
                  Total SKUs
                </span>
                <span className="font-black text-[#242633] text-sm">
                  {liveProductCount} items
                </span>
              </div>

              {isSelected && (
                <div className="mt-3 py-1 text-center text-[11px] font-bold text-[#b32b69] bg-[#FABED7]/25 rounded-xl">
                  Active filter applied
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Products under selected category */}
      {selectedCategory && (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xs border border-[#EEE8E3]">
          <div className="p-4 sm:p-5 border-b border-[#EEE8E3] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#242633] flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#855e30]" />
                <span>
                  Products in Category: <span className="text-[#b32b69]">{selectedCategory}</span> ({filteredProducts.length})
                </span>
              </h3>
              <p className="text-xs text-[#686878]">
                Catalog SKUs associated with this inventory classification
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EEE8E3] text-[11px] font-bold uppercase tracking-wider text-[#686878] bg-white/40">
                  <th className="py-3 px-6">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Stock on Hand</th>
                  <th className="py-3 px-4">Reorder Level</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8E3]/60 text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#686878]">
                      No products currently assigned to category '{selectedCategory}'.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-[#242633]">{p.name}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#686878]">{p.sku}</td>
                      <td className="py-3.5 px-4 text-[#242633]">{p.location}</td>
                      <td className="py-3.5 px-4 font-extrabold text-[#242633]">
                        {p.currentStock.toLocaleString()} {p.unit}
                      </td>
                      <td className="py-3.5 px-4 text-[#686878]">
                        {p.reorderLevel} {p.unit}
                      </td>
                      <td className="py-3.5 px-6">
                        {p.status === 'out-of-stock' ? (
                          <span className="text-rose-600 font-bold">Out of Stock</span>
                        ) : p.status === 'low-stock' ? (
                          <span className="text-amber-600 font-bold">Low Stock</span>
                        ) : (
                          <span className="text-emerald-600 font-bold">Healthy</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Product Category"
        subtitle="Establish a taxonomy group to categorize inventory and generate roll-up reports"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
              Category Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Raw Materials, Packaging, Finished Goods"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#242633] uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe the category classification criteria"
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEE8E3] text-sm text-[#242633] focus:border-[#DBBA95] focus:outline-none focus:ring-2 focus:ring-[#DBBA95]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EEE8E3]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
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
              <span>Save Category</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
