import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  LocationCapacity,
  StockMovement,
  Receipt,
  Delivery,
  TransferRecord,
  AdjustmentRecord,
  StockStatus,
  NavRoute,
  ReceiptStatus,
  DeliveryStatus,
  MovementType,
} from '../types/inventory';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import {
  productsApi,
  categoriesApi,
  warehousesApi,
  receiptsApi,
  deliveriesApi,
  transfersApi,
  adjustmentsApi,
  movesApi,
  dashboardApi,
  LocationItem,
  ProductItem,
  CategoryItem,
  WarehouseItem,
} from '../api/services';

interface InventoryContextType {
  products: Product[];
  categories: CategoryItem[];
  warehouses: WarehouseItem[];
  locations: LocationCapacity[];
  movements: StockMovement[];
  receipts: Receipt[];
  deliveries: Delivery[];
  transfers: TransferRecord[];
  adjustments: AdjustmentRecord[];
  activeRoute: NavRoute;
  setActiveRoute: (route: NavRoute) => void;
  // Summary Metrics
  totalUnits: number;
  totalSKUs: number;
  totalLocations: number;
  healthyPercent: number;
  lowStockPercent: number;
  outOfStockPercent: number;
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'status' | 'lastUpdated'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // Operations actions
  createReceipt: (receipt: Omit<Receipt, 'id' | 'reference' | 'date'>) => Promise<void>;
  validateReceipt: (receiptId: string) => Promise<boolean>;
  cancelReceipt: (receiptId: string) => void;
  createDelivery: (delivery: Omit<Delivery, 'id' | 'reference' | 'date'>) => Promise<boolean>;
  validateDelivery: (deliveryId: string) => Promise<boolean>;
  cancelDelivery: (deliveryId: string) => void;
  createTransfer: (transfer: Omit<TransferRecord, 'id' | 'reference' | 'date' | 'user'>) => Promise<boolean>;
  createAdjustment: (adjustment: Omit<AdjustmentRecord, 'id' | 'reference' | 'date' | 'user' | 'difference'>) => Promise<void>;
  // Modals state helper for quick actions bar
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  // Manual refresh
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Helper to determine status from numbers
const computeStatus = (stock: number, reorder: number): StockStatus => {
  if (stock <= 0) return 'out-of-stock';
  if (stock <= reorder) return 'low-stock';
  return 'healthy';
};

// Helper to capitalize status strings
const capitalizeStatus = <T extends string>(str: string): T => {
  if (!str) return 'Waiting' as T;
  const s = str.toLowerCase();
  if (s === 'draft') return 'Draft' as T;
  if (s === 'waiting') return 'Waiting' as T;
  if (s === 'ready') return 'Ready' as T;
  if (s === 'done') return 'Done' as T;
  if (s === 'cancelled' || s === 'canceled') return 'Canceled' as T;
  return (str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()) as T;
};

// Helper for movement types
const mapMovementType = (type: string): MovementType => {
  const t = type.toLowerCase();
  if (t.includes('receipt')) return 'Receipt';
  if (t.includes('delivery')) return 'Delivery';
  if (t.includes('transfer')) return 'Transfer';
  return 'Adjustment';
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const { isAuthenticated, token } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseItem[]>([]);
  const [locations, setLocations] = useState<LocationCapacity[]>([]);
  const [rawLocations, setRawLocations] = useState<LocationItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);

  const [activeRoute, setActiveRoute] = useState<NavRoute>('dashboard');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Fetch all backend data from FastAPI
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const [
        prodsRes,
        locsRes,
        receiptsRes,
        deliveriesRes,
        transfersRes,
        adjustmentsRes,
        movesRes,
        catsRes,
        whsRes,
      ] = await Promise.allSettled([
        productsApi.getProducts(),
        warehousesApi.getLocations(),
        receiptsApi.getReceipts(),
        deliveriesApi.getDeliveries(),
        transfersApi.getTransfers(),
        adjustmentsApi.getAdjustments(),
        movesApi.getMoves(),
        categoriesApi.getCategories(),
        warehousesApi.getWarehouses(),
      ]);

      // 0. Process Categories & Warehouses
      if (catsRes.status === 'fulfilled') {
        setCategories(catsRes.value);
      }
      if (whsRes.status === 'fulfilled') {
        setWarehouses(whsRes.value);
      }

      // 1. Process Locations
      let currentRawLocs: LocationItem[] = [];
      if (locsRes.status === 'fulfilled') {
        currentRawLocs = locsRes.value;
        setRawLocations(currentRawLocs);

        const mappedLocs: LocationCapacity[] = currentRawLocs.map((loc) => ({
          id: String(loc.id),
          name: `${loc.warehouse_name} - ${loc.name}`,
          capacity: 5000,
          used: 2500,
          type: loc.type === 'internal' ? 'Internal Storage' : loc.type === 'vendor' ? 'Vendor Dock' : 'Customer Staging',
          utilizationPercent: 50,
        }));
        setLocations(mappedLocs);
      }

      // 2. Process Products
      if (prodsRes.status === 'fulfilled') {
        const mappedProducts: Product[] = prodsRes.value.map((p: ProductItem) => ({
          id: String(p.id),
          name: p.name,
          sku: p.sku,
          category: p.category_name || 'General Inventory',
          location: p.primary_location || (currentRawLocs[0] ? `${currentRawLocs[0].warehouse_name} - ${currentRawLocs[0].name}` : 'Main Warehouse'),
          currentStock: p.total_stock,
          reorderLevel: p.reorder_level,
          unit: p.unit_of_measure,
          unitCost: 15.0,
          status: p.total_stock <= 0 ? 'out-of-stock' : p.is_low_stock ? 'low-stock' : 'healthy',
          lastUpdated: 'Live synced',
        }));
        setProducts(mappedProducts);
      }

      // 3. Process Receipts
      if (receiptsRes.status === 'fulfilled') {
        const mappedReceipts: Receipt[] = receiptsRes.value.map((r) => {
          const firstLine = r.lines?.[0];
          return {
            id: String(r.id),
            reference: r.reference,
            supplier: r.supplier_name,
            productId: String(firstLine?.product_id || ''),
            productName: firstLine?.product_name || 'Standard Consignment',
            quantity: firstLine?.demand_qty || 0,
            destinationLocation: r.dest_location_name || 'Main Warehouse',
            date: r.scheduled_date ? r.scheduled_date.substring(0, 10) : 'Today',
            status: capitalizeStatus<ReceiptStatus>(r.status),
            notes: r.notes || '',
          };
        });
        setReceipts(mappedReceipts);
      }

      // 4. Process Deliveries
      if (deliveriesRes.status === 'fulfilled') {
        const mappedDeliveries: Delivery[] = deliveriesRes.value.map((d) => {
          const firstLine = d.lines?.[0];
          return {
            id: String(d.id),
            reference: d.reference,
            customer: d.notes || 'Customer Consignee',
            productId: String(firstLine?.product_id || ''),
            productName: firstLine?.product_name || 'Order Dispatch',
            quantity: firstLine?.demand_qty || 0,
            sourceLocation: d.source_location_name || 'Main Warehouse',
            date: d.scheduled_date ? d.scheduled_date.substring(0, 10) : 'Today',
            status: capitalizeStatus<DeliveryStatus>(d.status),
            notes: d.notes || '',
          };
        });
        setDeliveries(mappedDeliveries);
      }

      // 5. Process Transfers
      if (transfersRes.status === 'fulfilled') {
        const mappedTransfers: TransferRecord[] = transfersRes.value.map((t) => {
          const firstLine = t.lines?.[0];
          return {
            id: String(t.id),
            reference: t.reference,
            productId: String(firstLine?.product_id || ''),
            productName: firstLine?.product_name || 'Item Relocation',
            fromLocation: t.source_location_name || 'Storage',
            toLocation: t.dest_location_name || 'Production Floor',
            quantity: firstLine?.demand_qty || 0,
            date: t.scheduled_date ? t.scheduled_date.substring(0, 16).replace('T', ' ') : 'Today',
            user: 'Staff',
            notes: `Internal transfer: ${t.reference}`,
          };
        });
        setTransfers(mappedTransfers);
      }

      // 6. Process Adjustments
      if (adjustmentsRes.status === 'fulfilled') {
        const mappedAdjustments: AdjustmentRecord[] = adjustmentsRes.value.map((a) => {
          const firstLine = a.lines?.[0];
          return {
            id: String(a.id),
            reference: a.reference,
            productId: String(firstLine?.product_id || ''),
            productName: firstLine?.product_name || 'Cycle Count Audit',
            location: a.location_name || 'Warehouse Bay',
            recordedQuantity: firstLine?.theoretical_qty || 0,
            physicalCount: firstLine?.counted_qty || 0,
            difference: firstLine?.difference || 0,
            reason: a.notes || 'Routine physical audit',
            date: a.created_at ? a.created_at.substring(0, 16).replace('T', ' ') : 'Today',
            user: 'Auditor',
          };
        });
        setAdjustments(mappedAdjustments);
      }

      // 7. Process Movement Ledger
      if (movesRes.status === 'fulfilled') {
        const mappedMoves: StockMovement[] = movesRes.value.map((m) => ({
          id: String(m.id),
          date: m.timestamp ? m.timestamp.substring(0, 16).replace('T', ' ') : 'Just now',
          timestamp: new Date(m.timestamp).getTime() || Date.now(),
          reference: m.operation_reference || `MOV-${m.id}`,
          productName: m.product_name,
          productId: String(m.product_id),
          location: `${m.warehouse_name} - ${m.location_name}`,
          movementType: mapMovementType(m.move_type),
          quantityChange: m.qty_change,
          beforeQuantity: m.qty_after - m.qty_change,
          afterQuantity: m.qty_after,
          user: 'Verified System',
          notes: m.remarks || '',
        }));
        setMovements(mappedMoves);
      }
    } catch (err: any) {
      console.error('Error refreshing backend data:', err);
      showToast('Sync Warning', 'Could not refresh latest telemetry from server.', 'warning');
    }
  }, [isAuthenticated, showToast]);

  // Initial load when user logs in or token is verified
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, token, refreshData]);

  // Derived metrics
  const totalUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalSKUs = products.length;
  const totalLocations = locations.length || 1;

  const healthyCount = products.filter((p) => p.status === 'healthy').length;
  const lowStockCount = products.filter((p) => p.status === 'low-stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'out-of-stock').length;

  const healthyPercent = totalSKUs > 0 ? Math.round((healthyCount / totalSKUs) * 100) : 0;
  const lowStockPercent = totalSKUs > 0 ? Math.round((lowStockCount / totalSKUs) * 100) : 0;
  const outOfStockPercent = totalSKUs > 0 ? Math.round((outOfStockCount / totalSKUs) * 100) : 0;

  // ==========================================
  // Operational Action Handlers
  // ==========================================

  // Helper to find location ID by name, code, or default
  const getLocationId = (locName?: string): number => {
    if (locName && rawLocations.length > 0) {
      const trimmed = locName.trim().toLowerCase();
      const found = rawLocations.find(
        (l) =>
          `${l.warehouse_name} - ${l.name}`.toLowerCase() === trimmed ||
          l.name.toLowerCase() === trimmed ||
          l.code.toLowerCase() === trimmed ||
          trimmed.startsWith(`${l.warehouse_name} - ${l.name}`.toLowerCase())
      );
      if (found) return found.id;
    }
    return rawLocations[0]?.id || 1;
  };

  // Helper to find category ID by name or default
  const getCategoryId = (catName?: string): number => {
    if (catName && categories.length > 0) {
      const trimmed = catName.trim().toLowerCase();
      const found = categories.find((c) => c.name.toLowerCase() === trimmed);
      if (found) return found.id;
    }
    return categories[0]?.id || 1;
  };

  // Add Product
  const addProduct = async (newProd: Omit<Product, 'id' | 'status' | 'lastUpdated'>) => {
    try {
      const locId = getLocationId(newProd.location);
      const catId = getCategoryId(newProd.category);
      await productsApi.createProduct({
        name: newProd.name,
        sku: newProd.sku,
        category_id: catId,
        unit_of_measure: newProd.unit || 'units',
        reorder_level: Number(newProd.reorderLevel) || 10,
        reorder_qty: 25,
        initial_stock: Number(newProd.currentStock) || 0,
        initial_location_id: locId,
      });

      await refreshData();
      showToast('Product Created', `${newProd.name} (${newProd.sku}) added to catalog.`, 'success');
    } catch (err: any) {
      showToast('Failed to Add Product', err.message || 'Error creating product.', 'error');
    }
  };

  // Update Product
  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      await productsApi.updateProduct(Number(id), {
        name: updates.name,
        sku: updates.sku,
        reorder_level: updates.reorderLevel,
      });
      await refreshData();
      showToast('Product Updated', 'Product changes saved successfully.', 'info');
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not update product.', 'error');
    }
  };

  // Delete Product
  const deleteProduct = async (id: string) => {
    try {
      await productsApi.deleteProduct(Number(id));
      await refreshData();
      showToast('Product Removed', 'Product deleted from system.', 'warning');
    } catch (err: any) {
      showToast('Deletion Blocked', err.message || 'Cannot delete product.', 'error');
    }
  };

  // Create Inbound Receipt
  const createReceipt = async (data: Omit<Receipt, 'id' | 'reference' | 'date'>) => {
    try {
      const destId = getLocationId(data.destinationLocation);
      const res = await receiptsApi.createReceipt({
        supplier_name: data.supplier,
        dest_location_id: destId,
        notes: data.notes,
        lines: [
          {
            product_id: Number(data.productId),
            demand_qty: Number(data.quantity),
          },
        ],
      });

      // If user selected immediate Done validation
      if (data.status === 'Done') {
        await receiptsApi.validateReceipt(res.id);
      }

      await refreshData();
      showToast(
        'Receipt Recorded',
        `Consignment ${res.reference} registered from ${data.supplier}.`,
        'success'
      );
    } catch (err: any) {
      showToast('Receipt Failed', err.message || 'Could not create receipt.', 'error');
    }
  };

  // Validate Receipt
  const validateReceipt = async (receiptId: string): Promise<boolean> => {
    try {
      await receiptsApi.validateReceipt(Number(receiptId));
      await refreshData();
      showToast('Receipt Validated', 'Stock inventory increased and ledger committed.', 'success');
      return true;
    } catch (err: any) {
      showToast('Validation Failed', err.message || 'Could not validate receipt.', 'error');
      return false;
    }
  };

  const cancelReceipt = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'Canceled' } : r))
    );
    showToast('Receipt Canceled', 'Status marked as Canceled.', 'info');
  };

  // Create Delivery Order
  const createDelivery = async (
    data: Omit<Delivery, 'id' | 'reference' | 'date'>
  ): Promise<boolean> => {
    try {
      const srcId = getLocationId(data.sourceLocation);
      const newDel = await deliveriesApi.createDelivery({
        source_location_id: srcId,
        notes: data.customer,
        lines: [
          {
            product_id: Number(data.productId),
            demand_qty: Number(data.quantity),
          },
        ],
      });

      // Transition stages if requested
      if (data.status === 'Ready' || data.status === 'Done') {
        await deliveriesApi.pickDelivery(newDel.id);
        await deliveriesApi.packDelivery(newDel.id);
      }
      if (data.status === 'Done') {
        await deliveriesApi.validateDelivery(newDel.id);
      }

      await refreshData();
      showToast('Delivery Created', `Order ${newDel.reference} staged for fulfillment.`, 'info');
      return true;
    } catch (err: any) {
      showToast('Delivery Blocked', err.message || 'Could not create delivery order.', 'error');
      return false;
    }
  };

  // Validate Delivery: Deducts stock, rejects on insufficient stock (HTTP 400)
  const validateDelivery = async (deliveryId: string): Promise<boolean> => {
    try {
      await deliveriesApi.validateDelivery(Number(deliveryId));
      await refreshData();
      showToast('Delivery Dispatched', 'Order verified and stock deducted from storage.', 'success');
      return true;
    } catch (err: any) {
      showToast(
        'Delivery Blocked: Insufficient Stock',
        err.message || 'Not enough stock available to fulfill order.',
        'error'
      );
      return false;
    }
  };

  const cancelDelivery = (deliveryId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, status: 'Canceled' } : d))
    );
    showToast('Delivery Canceled', 'Delivery order marked as Canceled.', 'info');
  };

  // Create Internal Transfer
  const createTransfer = async (
    data: Omit<TransferRecord, 'id' | 'reference' | 'date' | 'user'>
  ): Promise<boolean> => {
    try {
      const srcId = getLocationId(data.fromLocation);
      let destId = getLocationId(data.toLocation);
      if (srcId === destId) {
        // Pick an alternate location if identical
        const alt = rawLocations.find((l) => l.id !== srcId);
        if (alt) destId = alt.id;
      }

      const trf = await transfersApi.createTransfer({
        source_location_id: srcId,
        dest_location_id: destId,
        lines: [
          {
            product_id: Number(data.productId),
            demand_qty: Number(data.quantity),
          },
        ],
      });

      // Automatically validate transfer to move stock immediately
      await transfersApi.validateTransfer(trf.id);

      await refreshData();
      showToast(
        'Transfer Completed',
        `Transferred ${data.quantity} units. Total company stock preserved.`,
        'success'
      );
      return true;
    } catch (err: any) {
      showToast('Transfer Failed', err.message || 'Could not complete transfer.', 'error');
      return false;
    }
  };

  // Create Physical Inventory Adjustment
  const createAdjustment = async (
    data: Omit<AdjustmentRecord, 'id' | 'reference' | 'date' | 'user' | 'difference'>
  ) => {
    try {
      const locId = getLocationId(data.location);
      const adj = await adjustmentsApi.createAdjustment({
        location_id: locId,
        notes: data.reason,
        lines: [
          {
            product_id: Number(data.productId),
            counted_qty: Number(data.physicalCount),
          },
        ],
      });

      // Validate adjustment to commit difference to stock ledger
      await adjustmentsApi.validateAdjustment(adj.id);

      await refreshData();
      showToast(
        'Inventory Adjusted',
        `Reconciled stock to ${data.physicalCount}. Variance committed to ledger.`,
        'success'
      );
    } catch (err: any) {
      showToast('Adjustment Failed', err.message || 'Could not record adjustment.', 'error');
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        warehouses,
        locations,
        movements,
        receipts,
        deliveries,
        transfers,
        adjustments,
        activeRoute,
        setActiveRoute,
        totalUnits,
        totalSKUs,
        totalLocations,
        healthyPercent,
        lowStockPercent,
        outOfStockPercent,
        addProduct,
        updateProduct,
        deleteProduct,
        createReceipt,
        validateReceipt,
        cancelReceipt,
        createDelivery,
        validateDelivery,
        cancelDelivery,
        createTransfer,
        createAdjustment,
        activeModal,
        setActiveModal,
        refreshData,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
