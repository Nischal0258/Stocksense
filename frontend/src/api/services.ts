/**
 * StockSense API Services
 * Typed endpoint service functions corresponding to API_CONTRACT.md
 */

import { apiRequest } from './client';

// ==========================================
// 1. Auth Types & Services
// ==========================================
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: 'inventory_manager' | 'warehouse_staff';
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'inventory_manager' | 'warehouse_staff';
  };
}

export interface SignupResponse {
  id: number;
  name: string;
  email: string;
  role: 'inventory_manager' | 'warehouse_staff';
  token: string;
  token_type: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: 'inventory_manager' | 'warehouse_staff';
  created_at?: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  signup: (payload: SignupPayload) =>
    apiRequest<SignupResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => apiRequest<UserProfile>('/api/auth/me'),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string; detail: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, otp: string, new_password: string) =>
    apiRequest<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, new_password }),
    }),
};

// ==========================================
// 2. Dashboard KPIs & Operations Types & Services
// ==========================================
export interface DashboardKPIs {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_receipts: number;
  pending_deliveries: number;
  scheduled_transfers: number;
  low_stock_items: Array<{
    id: number;
    name: string;
    sku: string;
    total_stock: number;
    reorder_level: number;
    reorder_qty: number;
    deficit: number;
  }>;
}

export interface OperationItem {
  id: number;
  reference: string;
  type: 'receipt' | 'delivery' | 'transfer' | 'adjustment';
  status: string;
  source_location_name?: string | null;
  dest_location_name?: string | null;
  supplier_name?: string | null;
  scheduled_date?: string | null;
  created_at: string;
  lines: Array<{
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    demand_qty?: number;
    done_qty?: number;
    counted_qty?: number;
  }>;
}

export const dashboardApi = {
  getKPIs: () => apiRequest<DashboardKPIs>('/api/dashboard/kpis'),

  getOperations: (params?: {
    type?: string;
    status?: string;
    warehouse_id?: number;
    location_id?: number;
    category_id?: number;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<OperationItem[]>(`/api/operations${query}`);
  },
};

// ==========================================
// 3. Products & Categories Types & Services
// ==========================================
export interface ProductItem {
  id: number;
  name: string;
  sku: string;
  category_id: number;
  category_name?: string;
  warehouse_name?: string;
  location_name?: string;
  primary_location?: string;
  unit_of_measure: string;
  total_stock: number;
  is_low_stock: boolean;
  reorder_level: number;
  reorder_qty: number;
}

export interface ProductStockLocation {
  location_id: number;
  location_name: string;
  location_code: string;
  warehouse_name: string;
  quantity: number;
  last_updated: string;
}

export interface ProductCreatePayload {
  name: string;
  sku: string;
  category_id: number;
  unit_of_measure: string;
  reorder_level?: number;
  reorder_qty?: number;
  initial_stock?: number;
  initial_location_id?: number;
}

export interface CategoryItem {
  id: number;
  name: string;
  description?: string | null;
  product_count: number;
}

export const productsApi = {
  getProducts: (params?: { search?: string; category_id?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.category_id) searchParams.append('category_id', String(params.category_id));
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<ProductItem[]>(`/api/products${query}`);
  },

  getProduct: (id: number) => apiRequest<ProductItem>(`/api/products/${id}`),

  createProduct: (payload: ProductCreatePayload) =>
    apiRequest<ProductItem>('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProduct: (id: number, payload: Partial<ProductCreatePayload>) =>
    apiRequest<ProductItem>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id: number) =>
    apiRequest<{ message: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    }),

  getProductStock: (id: number) =>
    apiRequest<ProductStockLocation[]>(`/api/products/${id}/stock`),
};

export const categoriesApi = {
  getCategories: () => apiRequest<CategoryItem[]>('/api/categories'),

  createCategory: (payload: { name: string; description?: string }) =>
    apiRequest<CategoryItem>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateCategory: (id: number, payload: { name: string; description?: string }) =>
    apiRequest<CategoryItem>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteCategory: (id: number) =>
    apiRequest<{ message: string }>(`/api/categories/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// 4. Warehouses & Locations
// ==========================================
export interface LocationItem {
  id: number;
  warehouse_id: number;
  warehouse_name: string;
  name: string;
  code: string;
  type: string;
}

export interface WarehouseItem {
  id: number;
  name: string;
  code: string;
  address?: string | null;
  is_active: boolean;
  location_count: number;
  locations?: LocationItem[];
}

export const warehousesApi = {
  getWarehouses: () => apiRequest<WarehouseItem[]>('/api/warehouses'),

  getLocations: () => apiRequest<LocationItem[]>('/api/locations'),

  createWarehouse: (payload: { name: string; code: string; address?: string; is_active?: boolean }) =>
    apiRequest<WarehouseItem>('/api/warehouses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateWarehouse: (id: number, payload: { name?: string; code?: string; address?: string; is_active?: boolean }) =>
    apiRequest<WarehouseItem>(`/api/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteWarehouse: (id: number) =>
    apiRequest<{ message: string }>(`/api/warehouses/${id}`, {
      method: 'DELETE',
    }),

  createLocation: (payload: { warehouse_id: number; name: string; code: string; type: string }) =>
    apiRequest<LocationItem>('/api/locations', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteLocation: (id: number) =>
    apiRequest<{ message: string }>(`/api/locations/${id}`, {
      method: 'DELETE',
    }),

  getWarehouseStock: (warehouseId: number) =>
    apiRequest<Array<{
      product_id: number;
      product_name: string;
      product_sku: string;
      location_id: number;
      location_name: string;
      location_code: string;
      quantity: number;
    }>>(`/api/warehouses/${warehouseId}/stock`),
};

// ==========================================
// 5. Inbound Receipts
// ==========================================
export interface ReceiptItem {
  id: number;
  reference: string;
  supplier_name: string;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'cancelled';
  dest_location_id: number;
  dest_location_name?: string;
  scheduled_date?: string | null;
  notes?: string | null;
  line_count: number;
  lines: Array<{
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    demand_qty: number;
    done_qty: number;
  }>;
}

export interface ReceiptCreatePayload {
  supplier_name: string;
  dest_location_id: number;
  scheduled_date?: string;
  notes?: string;
  lines: Array<{
    product_id: number;
    demand_qty: number;
  }>;
}

export const receiptsApi = {
  getReceipts: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<ReceiptItem[]>(`/api/receipts${query}`);
  },

  getReceipt: (id: number) => apiRequest<ReceiptItem>(`/api/receipts/${id}`),

  createReceipt: (payload: ReceiptCreatePayload) =>
    apiRequest<ReceiptItem>('/api/receipts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  validateReceipt: (id: number, lines?: Array<{ id: number; done_qty: number }>) =>
    apiRequest<ReceiptItem>(`/api/receipts/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify(lines ? { lines } : {}),
    }),
};

// ==========================================
// 6. Outbound Deliveries
// ==========================================
export interface DeliveryItem {
  id: number;
  reference: string;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'cancelled';
  source_location_id: number;
  source_location_name?: string;
  scheduled_date?: string | null;
  notes?: string | null;
  line_count: number;
  lines: Array<{
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    demand_qty: number;
    done_qty: number;
  }>;
}

export interface DeliveryCreatePayload {
  source_location_id: number;
  scheduled_date?: string;
  notes?: string;
  lines: Array<{
    product_id: number;
    demand_qty: number;
  }>;
}

export const deliveriesApi = {
  getDeliveries: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<DeliveryItem[]>(`/api/deliveries${query}`);
  },

  getDelivery: (id: number) => apiRequest<DeliveryItem>(`/api/deliveries/${id}`),

  createDelivery: (payload: DeliveryCreatePayload) =>
    apiRequest<DeliveryItem>('/api/deliveries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  pickDelivery: (id: number) =>
    apiRequest<DeliveryItem>(`/api/deliveries/${id}/pick`, {
      method: 'POST',
    }),

  packDelivery: (id: number) =>
    apiRequest<DeliveryItem>(`/api/deliveries/${id}/pack`, {
      method: 'POST',
    }),

  validateDelivery: (id: number, lines?: Array<{ id: number; done_qty: number }>) =>
    apiRequest<DeliveryItem>(`/api/deliveries/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify(lines ? { lines } : {}),
    }),
};

// ==========================================
// 7. Internal Transfers
// ==========================================
export interface TransferItem {
  id: number;
  reference: string;
  source_location_id: number;
  source_location_name?: string;
  dest_location_id: number;
  dest_location_name?: string;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'cancelled';
  scheduled_date?: string | null;
  lines: Array<{
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    demand_qty: number;
    done_qty: number;
  }>;
}

export interface TransferCreatePayload {
  source_location_id: number;
  dest_location_id: number;
  scheduled_date?: string;
  lines: Array<{
    product_id: number;
    demand_qty: number;
  }>;
}

export const transfersApi = {
  getTransfers: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<TransferItem[]>(`/api/transfers${query}`);
  },

  getTransfer: (id: number) => apiRequest<TransferItem>(`/api/transfers/${id}`),

  createTransfer: (payload: TransferCreatePayload) =>
    apiRequest<TransferItem>('/api/transfers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  validateTransfer: (id: number, lines?: Array<{ id: number; done_qty: number }>) =>
    apiRequest<TransferItem>(`/api/transfers/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify(lines ? { lines } : {}),
    }),
};

// ==========================================
// 8. Physical Stock Adjustments
// ==========================================
export interface AdjustmentItem {
  id: number;
  reference: string;
  location_id: number;
  location_name?: string;
  status: 'draft' | 'done' | 'cancelled';
  notes?: string | null;
  created_at: string;
  lines: Array<{
    id: number;
    product_id: number;
    product_name: string;
    product_sku: string;
    theoretical_qty: number;
    counted_qty: number;
    difference: number;
  }>;
}

export interface AdjustmentCreatePayload {
  location_id: number;
  notes?: string;
  lines: Array<{
    product_id: number;
    counted_qty: number;
  }>;
}

export const adjustmentsApi = {
  getAdjustments: (status?: string) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest<AdjustmentItem[]>(`/api/adjustments${query}`);
  },

  getAdjustment: (id: number) => apiRequest<AdjustmentItem>(`/api/adjustments/${id}`),

  createAdjustment: (payload: AdjustmentCreatePayload) =>
    apiRequest<AdjustmentItem>('/api/adjustments', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  validateAdjustment: (id: number) =>
    apiRequest<AdjustmentItem>(`/api/adjustments/${id}/validate`, {
      method: 'POST',
    }),
};

// ==========================================
// 9. Move History / Stock Ledger
// ==========================================
export interface MoveItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  location_id: number;
  location_name: string;
  warehouse_name: string;
  operation_reference?: string | null;
  move_type: string;
  qty_change: number;
  qty_after: number;
  timestamp: string;
  remarks?: string | null;
}

export const movesApi = {
  getMoves: (params?: {
    product_id?: number;
    location_id?: number;
    type?: string;
    from_date?: string;
    to_date?: string;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest<MoveItem[]>(`/api/moves${query}`);
  },
};

// ==========================================
// 10. Reorder Rules
// ==========================================
export interface ReorderRuleItem {
  product_id: number;
  product_name: string;
  sku: string;
  current_stock: number;
  reorder_level: number;
  reorder_qty: number;
  is_below_threshold: boolean;
}

export const reorderApi = {
  getReorderRules: () => apiRequest<ReorderRuleItem[]>('/api/reorder-rules'),

  updateReorderRule: (productId: number, payload: { reorder_level: number; reorder_qty: number }) =>
    apiRequest<ProductItem>(`/api/products/${productId}/reorder`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};

// ==========================================
// 11. Profile Services
// ==========================================
export interface ProfileUpdatePayload {
  name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

export const profileApi = {
  getProfile: () => apiRequest<UserProfile>('/api/profile'),
  updateProfile: (payload: ProfileUpdatePayload) =>
    apiRequest<UserProfile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
