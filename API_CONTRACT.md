# StockSense — API Contract & Specification

> **Base URL:** `http://localhost:8000`  
> **Interactive Swagger Documentation:** `http://localhost:8000/docs`  
> **OpenAPI JSON:** `http://localhost:8000/openapi.json`  
> **Authentication Header:** `Authorization: Bearer <access_token>`

---

## 1. Authentication (`/api/auth`)

### 1.1 Sign Up
- **Method & Route:** `POST /api/auth/signup`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "Alex Johnson",
    "email": "alex@stocksense.com",
    "password": "Password123",
    "role": "inventory_manager"
  }
  ```
  *(Note: `role` must be `"inventory_manager"` or `"warehouse_staff"`)*
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "name": "Alex Johnson",
    "email": "alex@stocksense.com",
    "role": "inventory_manager",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer"
  }
  ```

### 1.2 Login
- **Method & Route:** `POST /api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "admin@stocksense.com",
    "password": "Password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Inventory Admin",
      "email": "admin@stocksense.com",
      "role": "inventory_manager"
    }
  }
  ```

### 1.3 Forgot Password (Request OTP)
- **Method & Route:** `POST /api/auth/forgot-password`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "admin@stocksense.com"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Password reset OTP generated successfully",
    "detail": "For demonstration/hackathon testing, your OTP is: 123456"
  }
  ```

### 1.4 Reset Password (Submit OTP)
- **Method & Route:** `POST /api/auth/reset-password`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "admin@stocksense.com",
    "otp": "123456",
    "new_password": "NewSecurePassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Password reset successfully. You can now login with your new password."
  }
  ```

### 1.5 Get Current User (`/me`)
- **Method & Route:** `GET /api/auth/me`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "Inventory Admin",
    "email": "admin@stocksense.com",
    "role": "inventory_manager",
    "created_at": "2026-09-26T10:00:00"
  }
  ```

---

## 2. Dashboard & Operations (`/api/dashboard`, `/api/operations`)

### 2.1 Dashboard KPIs
- **Method & Route:** `GET /api/dashboard/kpis`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  {
    "total_products": 5,
    "low_stock_count": 1,
    "out_of_stock_count": 1,
    "pending_receipts": 1,
    "pending_deliveries": 1,
    "scheduled_transfers": 1,
    "low_stock_items": [
      {
        "id": 2,
        "name": "Aluminum Sheets 2mm",
        "sku": "RAW-ALU-02",
        "current_stock": 12.0,
        "reorder_level": 20.0,
        "reorder_qty": 50.0,
        "unit_of_measure": "sheets"
      },
      {
        "id": 4,
        "name": "Ergonomic Office Chair V2",
        "sku": "FURN-CHR-01",
        "current_stock": 0.0,
        "reorder_level": 10.0,
        "reorder_qty": 20.0,
        "unit_of_measure": "units"
      }
    ]
  }
  ```

### 2.2 Operations List with Dynamic Filters
- **Method & Route:** `GET /api/operations`
- **Auth Required:** Yes
- **Query Parameters:**
  - `type` (optional): `"receipt" | "delivery" | "internal" | "adjustment"`
  - `status` (optional): `"draft" | "waiting" | "ready" | "done" | "cancelled"`
  - `warehouse_id` (optional, integer)
  - `location_id` (optional, integer)
  - `category_id` (optional, integer)
  - `search` (optional, string)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "reference": "REC-00001",
      "type": "receipt",
      "status": "done",
      "source_location_id": null,
      "source_location_name": null,
      "dest_location_id": 1,
      "dest_location_name": "Main Storage",
      "supplier_name": "Global Steel Industries",
      "notes": "Initial shipment of raw steel rods",
      "created_by": 1,
      "created_by_name": "Inventory Admin",
      "scheduled_date": "2026-09-21T10:00:00",
      "done_date": "2026-09-21T10:00:00",
      "created_at": "2026-09-21T10:00:00",
      "lines": [
        {
          "id": 1,
          "product_id": 1,
          "product_name": "Steel Rods 20mm",
          "product_sku": "RAW-STL-01",
          "unit_of_measure": "kg",
          "demand_qty": 100.0,
          "done_qty": 100.0
        }
      ]
    }
  ]
  ```

---

## 3. Products & Categories (`/api/products`, `/api/categories`)

### 3.1 List Products
- **Method & Route:** `GET /api/products`
- **Auth Required:** Yes
- **Query Parameters:**
  - `search` (optional): searches by name or SKU
  - `category_id` (optional, integer)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Steel Rods 20mm",
      "sku": "RAW-STL-01",
      "category_id": 1,
      "category_name": "Raw Materials",
      "unit_of_measure": "kg",
      "reorder_level": 50.0,
      "reorder_qty": 100.0,
      "total_stock": 77.0,
      "is_low_stock": false,
      "created_at": "2026-09-12T10:00:00"
    }
  ]
  ```

### 3.2 Create Product
- **Method & Route:** `POST /api/products`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "name": "Copper Wire 1mm",
    "sku": "RAW-CPR-01",
    "category_id": 1,
    "unit_of_measure": "m",
    "reorder_level": 100.0,
    "reorder_qty": 200.0,
    "initial_stock": 500.0,
    "initial_location_id": 1
  }
  ```
- **Response (201 Created):** Same schema as Product Item.

### 3.3 Product Per-Location Stock Breakdown
- **Method & Route:** `GET /api/products/:id/stock`
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  [
    {
      "location_id": 1,
      "location_name": "Main Storage",
      "location_code": "LOC-MAIN-01",
      "warehouse_name": "Central Distribution Warehouse",
      "quantity": 50.0,
      "last_updated": "2026-09-26T10:50:00"
    },
    {
      "location_id": 2,
      "location_name": "Production Floor",
      "location_code": "LOC-PROD-01",
      "warehouse_name": "Central Distribution Warehouse",
      "quantity": 27.0,
      "last_updated": "2026-09-26T10:50:00"
    }
  ]
  ```

### 3.4 Categories CRUD
- `GET /api/categories` — List all categories with product counts
- `POST /api/categories` — `{ "name": "Tools", "description": "Hand & machine tools" }`
- `PUT /api/categories/:id` — Update category
- `DELETE /api/categories/:id` — Delete category

---

## 4. Receipts (`/api/receipts`)

### 4.1 List Receipts
- **Method & Route:** `GET /api/receipts?status=draft`
- **Response:** Array of receipts with line items.

### 4.2 Create Receipt
- **Method & Route:** `POST /api/receipts`
- **Request Body:**
  ```json
  {
    "supplier_name": "Acme Metals Ltd",
    "dest_location_id": 1,
    "scheduled_date": "2026-09-28T14:00:00",
    "notes": "Fast-tracked delivery",
    "lines": [
      {
        "product_id": 1,
        "demand_qty": 100.0
      }
    ]
  }
  ```

### 4.3 Validate Receipt
- **Method & Route:** `POST /api/receipts/:id/validate`
- **Request Body:**
  ```json
  {
    "lines": [
      {
        "id": 1,
        "done_qty": 100.0
      }
    ]
  }
  ```
  *(Effect: atomically increments destination location `StockQuant` and adds a `"receipt"` entry to `StockLedger`)*

---

## 5. Deliveries (`/api/deliveries`)

### 5.1 Three-Step Outgoing Workflow
1. **Create Delivery (`POST /api/deliveries`):**
   ```json
   {
     "source_location_id": 1,
     "scheduled_date": "2026-09-27T10:00:00",
     "notes": "Customer Order #4921",
     "lines": [
       {
         "product_id": 1,
         "demand_qty": 20.0
       }
     ]
   }
   ```
   *Initial Status: `"draft"`*

2. **Pick Delivery (`POST /api/deliveries/:id/pick`):**
   *Transitions status from `"draft"` to `"waiting"`.*

3. **Pack Delivery (`POST /api/deliveries/:id/pack`):**
   *Transitions status from `"waiting"` to `"ready"`.*

4. **Validate & Ship (`POST /api/deliveries/:id/validate`):**
   ```json
   {
     "lines": [
       {
         "id": 1,
         "done_qty": 20.0
       }
     ]
   }
   ```
   *Transitions status to `"done"`. Checks available stock; if insufficient, returns `400 Bad Request`. Deducts stock from source location and writes negative delta to `StockLedger`.*

---

## 6. Internal Transfers (`/api/transfers`)

### 6.1 Create Transfer
- **Method & Route:** `POST /api/transfers`
- **Request Body:**
  ```json
  {
    "source_location_id": 1,
    "dest_location_id": 2,
    "scheduled_date": "2026-09-26T16:00:00",
    "notes": "Transfer 30 kg steel to cutting bay",
    "lines": [
      {
        "product_id": 1,
        "demand_qty": 30.0
      }
    ]
  }
  ```

### 6.2 Validate Transfer
- **Method & Route:** `POST /api/transfers/:id/validate`
- **Request Body:**
  ```json
  {
    "lines": [
      {
        "id": 1,
        "done_qty": 30.0
      }
    ]
  }
  ```
  *(Effect: atomically checks source stock, decreases source `StockQuant`, increases destination `StockQuant`, logs `"transfer_out"` and `"transfer_in"` ledger rows).*

---

## 7. Physical Stock Adjustments (`/api/adjustments`)

### 7.1 Create Adjustment
- **Method & Route:** `POST /api/adjustments`
- **Request Body:**
  ```json
  {
    "location_id": 2,
    "notes": "Annual physical count check",
    "lines": [
      {
        "product_id": 1,
        "counted_qty": 27.0
      }
    ]
  }
  ```

### 7.2 Validate Adjustment
- **Method & Route:** `POST /api/adjustments/:id/validate`
- **Request Body:** `{}` (or empty)
  *(Effect: calculates delta between physical count and system recorded quantity, updates stock to counted value, logs `"adjustment"` delta in ledger).*

---

## 8. Move History / Stock Ledger (`/api/moves`)

- **Method & Route:** `GET /api/moves`
- **Auth Required:** Yes
- **Query Parameters:**
  - `product_id` (optional, integer)
  - `location_id` (optional, integer)
  - `type` (optional: `"receipt" | "delivery" | "transfer_in" | "transfer_out" | "adjustment"`)
  - `from_date` (optional, ISO format e.g. `2026-09-01T00:00:00`)
  - `to_date` (optional, ISO format)
  - `search` (optional, string)
- **Response (200 OK):**
  ```json
  [
    {
      "id": 4,
      "product_id": 1,
      "product_name": "Steel Rods 20mm",
      "product_sku": "RAW-STL-01",
      "location_id": 2,
      "location_name": "Production Floor",
      "warehouse_name": "Central Distribution Warehouse",
      "operation_id": 4,
      "operation_reference": "ADJ-00001",
      "move_type": "adjustment",
      "qty_change": -3.0,
      "qty_after": 27.0,
      "timestamp": "2026-09-25T10:00:00",
      "remarks": "Stock adjustment ADJ-00001: counted 27.0, recorded 30.0 (diff -3.00)"
    }
  ]
  ```

---

## 9. Warehouses & Locations (`/api/warehouses`, `/api/locations`)

### 9.1 Warehouses
- `GET /api/warehouses` — List all warehouses with nested locations
- `POST /api/warehouses` — `{ "name": "South DC", "code": "WH-SOUTH", "address": "45 Industrial Ave" }`
- `GET /api/warehouses/:id`
- `PUT /api/warehouses/:id`
- `DELETE /api/warehouses/:id`
- `GET /api/warehouses/:id/locations` — List locations under specific warehouse

### 9.2 Locations
- `GET /api/locations` — List all locations across warehouses
- `POST /api/locations` — `{ "warehouse_id": 1, "name": "Cold Storage A", "code": "LOC-COLD-A", "type": "internal" }`
- `PUT /api/locations/:id`
- `DELETE /api/locations/:id`

---

## 10. Reorder Rules (`/api/reorder-rules`, `/api/products/:id/reorder`)

- `GET /api/reorder-rules?below_threshold=true` — Evaluates current stock against configured min/max safety rules.
- `PUT /api/products/:id/reorder` — `{ "reorder_level": 50.0, "reorder_qty": 100.0 }`

---

## 11. Profile (`/api/profile`)

- `GET /api/profile` — Returns current logged-in user profile.
- `PUT /api/profile` — Update name, email, or change password:
  ```json
  {
    "name": "New Name",
    "email": "updated@stocksense.com",
    "current_password": "Password123",
    "new_password": "NewStrongPassword456"
  }
  ```
