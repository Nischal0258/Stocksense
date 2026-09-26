import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types/inventory';
import { useToast } from './ToastContext';

interface InventoryContextType {
  products: Product[];
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
  addProduct: (product: Omit<Product, 'id' | 'status' | 'lastUpdated'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Operations actions
  createReceipt: (receipt: Omit<Receipt, 'id' | 'reference' | 'date'>) => void;
  validateReceipt: (receiptId: string) => boolean;
  cancelReceipt: (receiptId: string) => void;
  createDelivery: (delivery: Omit<Delivery, 'id' | 'reference' | 'date'>) => boolean;
  validateDelivery: (deliveryId: string) => boolean;
  cancelDelivery: (deliveryId: string) => void;
  createTransfer: (transfer: Omit<TransferRecord, 'id' | 'reference' | 'date' | 'user'>) => boolean;
  createAdjustment: (adjustment: Omit<AdjustmentRecord, 'id' | 'reference' | 'date' | 'user' | 'difference'>) => void;
  // Modals state helper for quick actions bar
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Steel Rods',
    sku: 'STR-1001',
    category: 'Raw Materials',
    location: 'Main Warehouse',
    currentStock: 12,
    reorderLevel: 20,
    unit: 'kg',
    unitCost: 14.50,
    status: 'low-stock',
    lastUpdated: '10 mins ago',
  },
  {
    id: 'prod-2',
    name: 'Copper Wire',
    sku: 'CPW-2045',
    category: 'Electricals',
    location: 'Production Floor',
    currentStock: 0,
    reorderLevel: 50,
    unit: 'meters',
    unitCost: 8.75,
    status: 'out-of-stock',
    lastUpdated: '35 mins ago',
  },
  {
    id: 'prod-3',
    name: 'Industrial Bolts',
    sku: 'IBT-8890',
    category: 'Fasteners',
    location: 'Rack A',
    currentStock: 4500,
    reorderLevel: 1000,
    unit: 'pcs',
    unitCost: 0.35,
    status: 'healthy',
    lastUpdated: '2 hours ago',
  },
  {
    id: 'prod-4',
    name: 'Office Chairs',
    sku: 'OFC-3312',
    category: 'Furniture',
    location: 'Warehouse 02',
    currentStock: 142,
    reorderLevel: 30,
    unit: 'units',
    unitCost: 85.00,
    status: 'healthy',
    lastUpdated: 'Yesterday',
  },
  {
    id: 'prod-5',
    name: 'Aluminium Sheets',
    sku: 'ALS-5021',
    category: 'Raw Materials',
    location: 'Rack B',
    currentStock: 850,
    reorderLevel: 200,
    unit: 'sheets',
    unitCost: 22.00,
    status: 'healthy',
    lastUpdated: '1 day ago',
  },
  {
    id: 'prod-6',
    name: 'Packaging Boxes',
    sku: 'PKB-9901',
    category: 'Packaging',
    location: 'Main Warehouse',
    currentStock: 6946,
    reorderLevel: 1500,
    unit: 'units',
    unitCost: 1.15,
    status: 'healthy',
    lastUpdated: '3 hours ago',
  },
];

const INITIAL_LOCATIONS: LocationCapacity[] = [
  {
    id: 'loc-1',
    name: 'Main Warehouse',
    capacity: 5880,
    used: 4820,
    type: 'Primary Storage',
    utilizationPercent: 82,
  },
  {
    id: 'loc-2',
    name: 'Production Floor',
    capacity: 3840,
    used: 2340,
    type: 'Active Staging',
    utilizationPercent: 61,
  },
  {
    id: 'loc-3',
    name: 'Warehouse 02',
    capacity: 4220,
    used: 3120,
    type: 'Finished Goods',
    utilizationPercent: 74,
  },
  {
    id: 'loc-4',
    name: 'Rack A',
    capacity: 5000,
    used: 4500,
    type: 'High-Density Rack',
    utilizationPercent: 90,
  },
  {
    id: 'loc-5',
    name: 'Rack B',
    capacity: 1500,
    used: 850,
    type: 'Cantilever Rack',
    utilizationPercent: 56,
  },
];

const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    date: '2026-09-25 21:15',
    timestamp: Date.now() - 1000 * 60 * 45,
    reference: 'REC-1023',
    productName: 'Packaging Boxes',
    productId: 'prod-6',
    location: 'Main Warehouse',
    movementType: 'Receipt',
    quantityChange: 1500,
    beforeQuantity: 5446,
    afterQuantity: 6946,
    user: 'Alex Morgan',
    notes: 'Standard replenishment PO-8842',
  },
  {
    id: 'mov-2',
    date: '2026-09-25 18:40',
    timestamp: Date.now() - 1000 * 60 * 180,
    reference: 'TRF-0438',
    productName: 'Office Chairs',
    productId: 'prod-4',
    location: 'Main Warehouse',
    toLocation: 'Warehouse 02',
    movementType: 'Transfer',
    quantityChange: 25,
    beforeQuantity: 142,
    afterQuantity: 142,
    user: 'David Chen',
    notes: 'Relocated for showroom staging',
  },
  {
    id: 'mov-3',
    date: '2026-09-25 14:10',
    timestamp: Date.now() - 1000 * 60 * 480,
    reference: 'DEL-0912',
    productName: 'Copper Wire',
    productId: 'prod-2',
    location: 'Production Floor',
    movementType: 'Delivery',
    quantityChange: -120,
    beforeQuantity: 120,
    afterQuantity: 0,
    user: 'Sara Vance',
    notes: 'Urgent line supply requisition',
  },
  {
    id: 'mov-4',
    date: '2026-09-25 10:25',
    timestamp: Date.now() - 1000 * 60 * 720,
    reference: 'ADJ-0084',
    productName: 'Steel Rods',
    productId: 'prod-1',
    location: 'Main Warehouse',
    movementType: 'Adjustment',
    quantityChange: -8,
    beforeQuantity: 20,
    afterQuantity: 12,
    user: 'Marcus Lee',
    notes: 'Physical count discrepancy reconciliation',
  },
  {
    id: 'mov-5',
    date: '2026-09-24 16:00',
    timestamp: Date.now() - 1000 * 60 * 1500,
    reference: 'REC-1022',
    productName: 'Industrial Bolts',
    productId: 'prod-3',
    location: 'Rack A',
    movementType: 'Receipt',
    quantityChange: 2000,
    beforeQuantity: 2500,
    afterQuantity: 4500,
    user: 'Alex Morgan',
    notes: 'Bulk supplier batch intake',
  },
];

const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'rec-1',
    reference: 'REC-1024',
    supplier: 'Apex Metallics Ltd',
    productId: 'prod-1',
    productName: 'Steel Rods',
    quantity: 50,
    destinationLocation: 'Main Warehouse',
    date: '2026-09-25',
    status: 'Waiting',
    notes: 'High priority expedited delivery. Resolves low stock.',
  },
  {
    id: 'rec-2',
    reference: 'REC-1025',
    supplier: 'Volta Cable Co',
    productId: 'prod-2',
    productName: 'Copper Wire',
    quantity: 150,
    destinationLocation: 'Production Floor',
    date: '2026-09-26',
    status: 'Ready',
    notes: 'Critical line restock for electrical assembly.',
  },
  {
    id: 'rec-3',
    reference: 'REC-1022',
    supplier: 'Fastener Forge Int.',
    productId: 'prod-3',
    productName: 'Industrial Bolts',
    quantity: 2000,
    destinationLocation: 'Rack A',
    date: '2026-09-24',
    status: 'Done',
    notes: 'Verified and stocked into High-Density Rack A.',
  },
  {
    id: 'rec-4',
    reference: 'REC-1026',
    supplier: 'Nordic Ergonomics',
    productId: 'prod-4',
    productName: 'Office Chairs',
    quantity: 30,
    destinationLocation: 'Warehouse 02',
    date: '2026-09-28',
    status: 'Draft',
    notes: 'Scheduled monthly quota.',
  },
];

const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'del-1',
    reference: 'DEL-0914',
    customer: 'Titan Aerospace Corp',
    productId: 'prod-5',
    productName: 'Aluminium Sheets',
    quantity: 120,
    sourceLocation: 'Rack B',
    date: '2026-09-26',
    status: 'Ready',
    notes: 'Inspection cleared, awaiting carrier pickup.',
  },
  {
    id: 'del-2',
    reference: 'DEL-0912',
    customer: 'Apex Manufacturing',
    productId: 'prod-2',
    productName: 'Copper Wire',
    quantity: 120,
    sourceLocation: 'Production Floor',
    date: '2026-09-25',
    status: 'Done',
    notes: 'Delivered to assembly team on floor.',
  },
  {
    id: 'del-3',
    reference: 'DEL-0915',
    customer: 'Global Logistics Hub',
    productId: 'prod-6',
    productName: 'Packaging Boxes',
    quantity: 500,
    sourceLocation: 'Main Warehouse',
    date: '2026-09-27',
    status: 'Waiting',
    notes: 'Pack slip generated.',
  },
];

const INITIAL_TRANSFERS: TransferRecord[] = [
  {
    id: 'trf-1',
    reference: 'TRF-0438',
    productId: 'prod-4',
    productName: 'Office Chairs',
    fromLocation: 'Main Warehouse',
    toLocation: 'Warehouse 02',
    quantity: 25,
    date: '2026-09-25 18:40',
    user: 'David Chen',
    notes: 'Floor staging transfer',
  },
  {
    id: 'trf-2',
    reference: 'TRF-0437',
    productId: 'prod-6',
    productName: 'Packaging Boxes',
    fromLocation: 'Main Warehouse',
    toLocation: 'Production Floor',
    quantity: 200,
    date: '2026-09-24 11:20',
    user: 'Alex Morgan',
    notes: 'Packaging replenish for shift A',
  },
];

const INITIAL_ADJUSTMENTS: AdjustmentRecord[] = [
  {
    id: 'adj-1',
    reference: 'ADJ-0084',
    productId: 'prod-1',
    productName: 'Steel Rods',
    location: 'Main Warehouse',
    recordedQuantity: 20,
    physicalCount: 12,
    difference: -8,
    reason: 'Damaged during forklift transit',
    date: '2026-09-25 10:25',
    user: 'Marcus Lee',
  },
  {
    id: 'adj-2',
    reference: 'ADJ-0083',
    productId: 'prod-3',
    productName: 'Industrial Bolts',
    location: 'Rack A',
    recordedQuantity: 4450,
    physicalCount: 4500,
    difference: 50,
    reason: 'Found misplaced unopened carton',
    date: '2026-09-23 15:10',
    user: 'Sara Vance',
  },
];

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('stocksense_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [locations, setLocations] = useState<LocationCapacity[]>(() => {
    const saved = localStorage.getItem('stocksense_locations');
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('stocksense_movements');
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('stocksense_receipts');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    const saved = localStorage.getItem('stocksense_deliveries');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
  });

  const [transfers, setTransfers] = useState<TransferRecord[]>(() => {
    const saved = localStorage.getItem('stocksense_transfers');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
  });

  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>(() => {
    const saved = localStorage.getItem('stocksense_adjustments');
    return saved ? JSON.parse(saved) : INITIAL_ADJUSTMENTS;
  });

  const [activeRoute, setActiveRoute] = useState<NavRoute>('dashboard');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('stocksense_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('stocksense_locations', JSON.stringify(locations));
  }, [locations]);
  useEffect(() => {
    localStorage.setItem('stocksense_movements', JSON.stringify(movements));
  }, [movements]);
  useEffect(() => {
    localStorage.setItem('stocksense_receipts', JSON.stringify(receipts));
  }, [receipts]);
  useEffect(() => {
    localStorage.setItem('stocksense_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);
  useEffect(() => {
    localStorage.setItem('stocksense_transfers', JSON.stringify(transfers));
  }, [transfers]);
  useEffect(() => {
    localStorage.setItem('stocksense_adjustments', JSON.stringify(adjustments));
  }, [adjustments]);

  // Derived metrics
  const totalUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalSKUs = products.length;
  const totalLocations = locations.length;

  const healthyCount = products.filter((p) => p.status === 'healthy').length;
  const lowStockCount = products.filter((p) => p.status === 'low-stock').length;
  const outOfStockCount = products.filter((p) => p.status === 'out-of-stock').length;

  const healthyPercent = totalSKUs > 0 ? Math.round((healthyCount / totalSKUs) * 100) : 0;
  const lowStockPercent = totalSKUs > 0 ? Math.round((lowStockCount / totalSKUs) * 100) : 0;
  const outOfStockPercent = totalSKUs > 0 ? Math.round((outOfStockCount / totalSKUs) * 100) : 0;

  // Helper to re-evaluate product status based on current stock & reorder level
  const computeStatus = (stock: number, reorder: number): StockStatus => {
    if (stock <= 0) return 'out-of-stock';
    if (stock <= reorder) return 'low-stock';
    return 'healthy';
  };

  // Add Product
  const addProduct = (newProd: Omit<Product, 'id' | 'status' | 'lastUpdated'>) => {
    const status = computeStatus(newProd.currentStock, newProd.reorderLevel);
    const id = `prod-${Date.now()}`;
    const product: Product = {
      ...newProd,
      id,
      status,
      lastUpdated: 'Just now',
    };

    setProducts((prev) => [product, ...prev]);

    // If initial stock > 0, log an initial receipt movement
    if (product.currentStock > 0) {
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        date: nowStr,
        timestamp: Date.now(),
        reference: `INIT-${product.sku}`,
        productName: product.name,
        productId: product.id,
        location: product.location,
        movementType: 'Receipt',
        quantityChange: product.currentStock,
        beforeQuantity: 0,
        afterQuantity: product.currentStock,
        user: 'System Admin',
        notes: 'Initial inventory catalog registration',
      };
      setMovements((prev) => [movement, ...prev]);
    }

    showToast('Product Created', `${product.name} (${product.sku}) added to catalog.`, 'success');
  };

  // Update Product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const currentStock = updates.currentStock !== undefined ? updates.currentStock : p.currentStock;
        const reorderLevel = updates.reorderLevel !== undefined ? updates.reorderLevel : p.reorderLevel;
        const status = computeStatus(currentStock, reorderLevel);
        return {
          ...p,
          ...updates,
          status,
          lastUpdated: 'Just now',
        };
      })
    );
    showToast('Product Updated', 'Changes saved successfully.', 'info');
  };

  // Delete Product
  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product Removed', `${target.name} has been deleted.`, 'warning');
  };

  // Create Receipt
  const createReceipt = (data: Omit<Receipt, 'id' | 'reference' | 'date'>) => {
    const reference = `REC-${1026 + receipts.length}`;
    const date = new Date().toISOString().split('T')[0];
    const newReceipt: Receipt = {
      ...data,
      id: `rec-${Date.now()}`,
      reference,
      date,
    };
    setReceipts((prev) => [newReceipt, ...prev]);
    showToast('Receipt Created', `${reference} recorded as ${data.status}.`, 'info');
  };

  // Validate Receipt: Increases stock automatically & adds ledger entry
  const validateReceipt = (receiptId: string): boolean => {
    const receipt = receipts.find((r) => r.id === receiptId);
    if (!receipt) return false;
    if (receipt.status === 'Done') {
      showToast('Already Validated', `Receipt ${receipt.reference} was already completed.`, 'warning');
      return false;
    }

    const product = products.find((p) => p.id === receipt.productId);
    if (!product) {
      showToast('Error', 'Associated product not found in catalog.', 'error');
      return false;
    }

    const beforeQuantity = product.currentStock;
    const afterQuantity = beforeQuantity + receipt.quantity;
    const newStatus = computeStatus(afterQuantity, product.reorderLevel);

    // Update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              currentStock: afterQuantity,
              status: newStatus,
              lastUpdated: 'Just now',
            }
          : p
      )
    );

    // Update receipt status to Done
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'Done' } : r))
    );

    // Add Move History ledger entry
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: nowStr,
      timestamp: Date.now(),
      reference: receipt.reference,
      productName: product.name,
      productId: product.id,
      location: receipt.destinationLocation,
      movementType: 'Receipt',
      quantityChange: receipt.quantity,
      beforeQuantity,
      afterQuantity,
      user: 'Alex Morgan',
      notes: `Receipt intake validated from ${receipt.supplier}`,
    };
    setMovements((prev) => [movement, ...prev]);

    showToast(
      'Receipt Validated',
      `Stock increased by +${receipt.quantity} ${product.unit}. Total: ${afterQuantity} ${product.unit}.`,
      'success'
    );
    return true;
  };

  const cancelReceipt = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === receiptId ? { ...r, status: 'Canceled' } : r))
    );
    showToast('Receipt Canceled', 'Status marked as Canceled.', 'info');
  };

  // Create Delivery
  const createDelivery = (data: Omit<Delivery, 'id' | 'reference' | 'date'>): boolean => {
    const reference = `DEL-${916 + deliveries.length}`;
    const date = new Date().toISOString().split('T')[0];
    const newDelivery: Delivery = {
      ...data,
      id: `del-${Date.now()}`,
      reference,
      date,
    };
    setDeliveries((prev) => [newDelivery, ...prev]);
    showToast('Delivery Created', `Order ${reference} for ${data.customer} created.`, 'info');
    return true;
  };

  // Validate Delivery: Decreases stock, BLOCKS if quantity > available
  const validateDelivery = (deliveryId: string): boolean => {
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (!delivery) return false;
    if (delivery.status === 'Done') {
      showToast('Already Completed', `Delivery ${delivery.reference} is already completed.`, 'warning');
      return false;
    }

    const product = products.find((p) => p.id === delivery.productId);
    if (!product) {
      showToast('Error', 'Product not found.', 'error');
      return false;
    }

    // CHECK AVAILABILITY: Block if quantity > available
    if (delivery.quantity > product.currentStock) {
      showToast(
        'Delivery Blocked: Insufficient Stock',
        `Cannot fulfill ${delivery.quantity} ${product.unit}. Only ${product.currentStock} ${product.unit} available in stock!`,
        'error'
      );
      return false;
    }

    const beforeQuantity = product.currentStock;
    const afterQuantity = beforeQuantity - delivery.quantity;
    const newStatus = computeStatus(afterQuantity, product.reorderLevel);

    // Update product stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              currentStock: afterQuantity,
              status: newStatus,
              lastUpdated: 'Just now',
            }
          : p
      )
    );

    // Update delivery status
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, status: 'Done' } : d))
    );

    // Record in Move History ledger
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: nowStr,
      timestamp: Date.now(),
      reference: delivery.reference,
      productName: product.name,
      productId: product.id,
      location: delivery.sourceLocation,
      movementType: 'Delivery',
      quantityChange: -delivery.quantity,
      beforeQuantity,
      afterQuantity,
      user: 'Sara Vance',
      notes: `Order dispatched to ${delivery.customer}`,
    };
    setMovements((prev) => [movement, ...prev]);

    showToast(
      'Delivery Dispatched',
      `Fulfillment validated. Stock decreased by -${delivery.quantity} ${product.unit}. Remaining: ${afterQuantity} ${product.unit}.`,
      'success'
    );
    return true;
  };

  const cancelDelivery = (deliveryId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, status: 'Canceled' } : d))
    );
    showToast('Delivery Canceled', 'Delivery order status set to Canceled.', 'info');
  };

  // Internal Transfer: Keeps total company stock unchanged, updates per-location records
  const createTransfer = (
    data: Omit<TransferRecord, 'id' | 'reference' | 'date' | 'user'>
  ): boolean => {
    const product = products.find((p) => p.id === data.productId);
    if (!product) {
      showToast('Error', 'Product not found.', 'error');
      return false;
    }

    if (data.quantity > product.currentStock) {
      showToast('Transfer Failed', `Transfer quantity exceeds total available stock (${product.currentStock}).`, 'error');
      return false;
    }

    if (data.fromLocation === data.toLocation) {
      showToast('Invalid Transfer', 'Source and destination locations cannot be identical.', 'warning');
      return false;
    }

    const reference = `TRF-${440 + transfers.length}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newTransfer: TransferRecord = {
      ...data,
      id: `trf-${Date.now()}`,
      reference,
      date: nowStr,
      user: 'David Chen',
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    // Update location of the product if transferring the bulk of it or keeping track
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              location: data.toLocation,
              lastUpdated: 'Just now',
            }
          : p
      )
    );

    // Move History ledger entry (keeps total company stock unchanged, records transfer)
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: nowStr,
      timestamp: Date.now(),
      reference,
      productName: product.name,
      productId: product.id,
      location: data.fromLocation,
      toLocation: data.toLocation,
      movementType: 'Transfer',
      quantityChange: data.quantity,
      beforeQuantity: product.currentStock,
      afterQuantity: product.currentStock, // total company stock remains unchanged
      user: 'David Chen',
      notes: `Internal transfer: ${data.fromLocation} → ${data.toLocation} (${data.notes || 'Routine rebalance'})`,
    };
    setMovements((prev) => [movement, ...prev]);

    showToast(
      'Transfer Completed',
      `Transferred ${data.quantity} ${product.unit} from ${data.fromLocation} to ${data.toLocation}. Total stock preserved.`,
      'success'
    );
    return true;
  };

  // Inventory Adjustment: Difference = Physical Count - Recorded Quantity
  const createAdjustment = (
    data: Omit<AdjustmentRecord, 'id' | 'reference' | 'date' | 'user' | 'difference'>
  ) => {
    const product = products.find((p) => p.id === data.productId);
    if (!product) {
      showToast('Error', 'Product not found.', 'error');
      return;
    }

    const difference = data.physicalCount - data.recordedQuantity;
    const reference = `ADJ-${85 + adjustments.length}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newAdjustment: AdjustmentRecord = {
      ...data,
      id: `adj-${Date.now()}`,
      reference,
      difference,
      date: nowStr,
      user: 'Marcus Lee',
    };

    setAdjustments((prev) => [newAdjustment, ...prev]);

    // Apply difference to stock immediately
    const beforeQuantity = product.currentStock;
    const afterQuantity = Math.max(0, data.physicalCount);
    const newStatus = computeStatus(afterQuantity, product.reorderLevel);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              currentStock: afterQuantity,
              status: newStatus,
              lastUpdated: 'Just now',
            }
          : p
      )
    );

    // Ledger entry
    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      date: nowStr,
      timestamp: Date.now(),
      reference,
      productName: product.name,
      productId: product.id,
      location: data.location,
      movementType: 'Adjustment',
      quantityChange: difference,
      beforeQuantity,
      afterQuantity,
      user: 'Marcus Lee',
      notes: `Physical audit: ${data.reason} (Diff: ${difference > 0 ? '+' : ''}${difference})`,
    };
    setMovements((prev) => [movement, ...prev]);

    showToast(
      'Inventory Adjusted',
      `Reconciled stock to ${afterQuantity} ${product.unit} (Variance: ${difference > 0 ? '+' : ''}${difference}).`,
      difference === 0 ? 'info' : difference > 0 ? 'success' : 'warning'
    );
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
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
