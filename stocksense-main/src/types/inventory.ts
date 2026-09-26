export type StockStatus = 'healthy' | 'low-stock' | 'out-of-stock';

export type MovementType = 'Receipt' | 'Delivery' | 'Transfer' | 'Adjustment';

export type ReceiptStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';

export type DeliveryStatus = 'Draft' | 'Waiting' | 'Ready' | 'Done' | 'Canceled';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  location: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  unitCost: number;
  status: StockStatus;
  lastUpdated: string;
}

export interface LocationCapacity {
  id: string;
  name: string;
  capacity: number;
  used: number;
  type: string;
  utilizationPercent: number;
}

export interface StockMovement {
  id: string;
  date: string;
  timestamp: number;
  reference: string;
  productName: string;
  productId: string;
  location: string;
  toLocation?: string;
  movementType: MovementType;
  quantityChange: number;
  beforeQuantity: number;
  afterQuantity: number;
  user: string;
  notes?: string;
}

export interface Receipt {
  id: string;
  reference: string;
  supplier: string;
  productId: string;
  productName: string;
  quantity: number;
  destinationLocation: string;
  date: string;
  status: ReceiptStatus;
  notes?: string;
}

export interface Delivery {
  id: string;
  reference: string;
  customer: string;
  productId: string;
  productName: string;
  quantity: number;
  sourceLocation: string;
  date: string;
  status: DeliveryStatus;
  notes?: string;
}

export interface TransferRecord {
  id: string;
  reference: string;
  productId: string;
  productName: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  date: string;
  user: string;
  notes?: string;
}

export interface AdjustmentRecord {
  id: string;
  reference: string;
  productId: string;
  productName: string;
  location: string;
  recordedQuantity: number;
  physicalCount: number;
  difference: number;
  reason: string;
  date: string;
  user: string;
}

export type NavRoute = 
  | 'dashboard'
  | 'products'
  | 'receipts'
  | 'deliveries'
  | 'transfers'
  | 'adjustments'
  | 'move-history';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'error' | 'info';
}
