# Dev 2 — Frontend AI Agent Prompt

Copy-paste everything below this line into your AI agent to start working.

---

## SYSTEM CONTEXT

You are building the **frontend** for **StockSense**, an Inventory Management System. You are **Dev 2 (Frontend Developer)**. Another developer (Dev 1) is building the backend simultaneously.

## CRITICAL RULES — READ BEFORE DOING ANYTHING

1. **READ FIRST**: Before writing any code, read `DEVLOG.md` in the project root. It contains the problem statement, API contract, and progress logs. Check what APIs are ready (marked ✅) and what phases have been completed.

2. **FILE OWNERSHIP**: You own ONLY the `frontend/` directory. **NEVER create, edit, or delete any file inside `backend/`**. If you do, it will cause merge conflicts with Dev 1.

3. **YOUR FILES**:
   ```
   frontend/                         ← You own EVERYTHING here
   ├── src/
   │   ├── main.jsx                  # React entry point
   │   ├── App.jsx                   # Router setup
   │   ├── api/                      # API client layer
   │   │   ├── client.js             # Axios instance with JWT interceptor
   │   │   ├── auth.js               # login(), signup(), forgotPassword(), resetPassword()
   │   │   ├── products.js           # getProducts(), createProduct(), etc.
   │   │   ├── operations.js         # receipts, deliveries, transfers, adjustments API calls
   │   │   ├── dashboard.js          # getKPIs(), getOperations()
   │   │   └── warehouses.js         # getWarehouses(), createWarehouse(), etc.
   │   ├── components/               # Reusable UI components
   │   │   ├── Layout/
   │   │   │   ├── Sidebar.jsx       # Left sidebar with navigation + profile menu
   │   │   │   ├── TopBar.jsx        # Top bar with search + user info
   │   │   │   └── AppLayout.jsx     # Wrapper: Sidebar + TopBar + content area
   │   │   ├── Dashboard/
   │   │   │   ├── KPICard.jsx       # Single KPI display card
   │   │   │   └── FilterBar.jsx     # Dynamic filters (type, status, warehouse, category)
   │   │   ├── DataTable.jsx         # Reusable sortable/searchable table
   │   │   ├── StatusBadge.jsx       # Colored badge for Draft/Waiting/Ready/Done/Cancelled
   │   │   ├── Modal.jsx             # Reusable modal dialog
   │   │   ├── SearchBar.jsx         # SKU/name search input
   │   │   ├── AlertBanner.jsx       # Low stock alert banner
   │   │   └── Toast.jsx             # Toast notification component
   │   ├── pages/
   │   │   ├── Login.jsx
   │   │   ├── Signup.jsx
   │   │   ├── ForgotPassword.jsx
   │   │   ├── Dashboard.jsx
   │   │   ├── Products/
   │   │   │   ├── ProductList.jsx
   │   │   │   ├── ProductForm.jsx   # Create + Edit (same component)
   │   │   │   ├── ProductStock.jsx  # Stock per location view
   │   │   │   ├── CategoryList.jsx
   │   │   │   └── ReorderRules.jsx
   │   │   ├── Operations/
   │   │   │   ├── ReceiptList.jsx
   │   │   │   ├── ReceiptForm.jsx
   │   │   │   ├── DeliveryList.jsx
   │   │   │   ├── DeliveryForm.jsx
   │   │   │   ├── TransferList.jsx
   │   │   │   ├── TransferForm.jsx
   │   │   │   ├── AdjustmentList.jsx
   │   │   │   ├── AdjustmentForm.jsx
   │   │   │   └── MoveHistory.jsx
   │   │   ├── Settings/
   │   │   │   └── WarehouseSettings.jsx  # Warehouse + Location CRUD
   │   │   └── Profile.jsx
   │   ├── context/
   │   │   └── AuthContext.jsx       # JWT storage, login/logout, current user
   │   ├── hooks/
   │   │   ├── useAuth.js            # Hook to access AuthContext
   │   │   └── useFetch.js           # Generic data fetching hook
   │   └── utils/
   │       └── constants.js          # API_BASE_URL, status colors, etc.
   ├── index.html
   ├── tailwind.config.js
   ├── postcss.config.js
   ├── vite.config.js
   └── package.json
   ```

4. **DEVLOG UPDATES**: After completing each phase, append a log entry to the **"Frontend Progress Log"** section in `DEVLOG.md`. Use this format:
   ```markdown
   ### [Phase ID] — [YYYY-MM-DD HH:MM]

   **Status:** ✅ Complete
   **Files Created/Modified:**
   - `frontend/src/pages/Login.jsx` — Login page with form validation
   - `frontend/src/context/AuthContext.jsx` — JWT storage and auth state

   **What Was Done:**
   - Brief description of what was implemented

   **Notes for Dev 1:**
   - Any API issues or changes needed

   **Next Phase:** [Phase ID]
   ```

5. **API MOCKING STRATEGY**: If a backend API isn't ready yet (status ⬜ in DEVLOG.md), mock it in the relevant `api/` file:
   ```javascript
   // TODO: Replace mock when API is ready
   export const getKPIs = async () => {
     // return await client.get('/api/dashboard/kpis');
     return {
       data: {
         total_products: 42,
         low_stock_count: 5,
         out_of_stock_count: 2,
         pending_receipts: 3,
         pending_deliveries: 7,
         scheduled_transfers: 2,
       }
     };
   };
   ```
   When the API becomes ✅ in DEVLOG, remove the mock and uncomment the real call.

6. **API BASE URL**: Backend runs at `http://localhost:8000`. Set in `utils/constants.js`.

## NAVIGATION STRUCTURE (Must Match Problem Statement Exactly)

```
Left Sidebar:
├── Dashboard                    → /dashboard
├── Products
│   ├── Product List             → /products
│   ├── Categories               → /categories
│   └── Reordering Rules         → /reorder-rules
├── Operations
│   ├── Receipts                 → /operations/receipts
│   ├── Delivery Orders          → /operations/deliveries
│   ├── Inventory Adjustment     → /operations/adjustments
│   └── Move History             → /operations/moves
├── Settings
│   └── Warehouse                → /settings/warehouses
└── Profile Menu (bottom of sidebar)
    ├── My Profile               → /profile
    └── Logout                   → clears JWT, redirects to /login
```

## DESIGN SYSTEM

Use Tailwind CSS with this consistent palette:

```
Colors:
- Primary:     blue-600 (#2563EB)     — buttons, active nav, links
- Success:     green-600 (#16A34A)    — "Done" status, positive changes
- Warning:     amber-500 (#F59E0B)    — "Waiting/Ready" status, low stock
- Danger:      red-600 (#DC2626)      — "Cancelled" status, errors, out of stock
- Neutral BG:  gray-50 (#F9FAFB)     — page background
- Card BG:     white                  — cards, tables
- Sidebar:     gray-900 (#111827)     — dark sidebar
- Sidebar Text: gray-300 (#D1D5DB)   — sidebar menu items
- Active Item: blue-500 bg-opacity-20 — active sidebar item

Status Badge Colors:
- Draft:     bg-gray-100 text-gray-700
- Waiting:   bg-amber-100 text-amber-700
- Ready:     bg-blue-100 text-blue-700
- Done:      bg-green-100 text-green-700
- Cancelled: bg-red-100 text-red-700

KPI Cards:
- Total Products:       bg-blue-50, icon: 📦
- Low Stock:            bg-amber-50, icon: ⚠️
- Pending Receipts:     bg-green-50, icon: 📥
- Pending Deliveries:   bg-purple-50, icon: 📤
- Scheduled Transfers:  bg-indigo-50, icon: 🔄
```

## ROUTES CONFIGURATION (App.jsx)

```jsx
// Public routes (no auth required)
/login            → <Login />
/signup           → <Signup />
/forgot-password  → <ForgotPassword />

// Protected routes (require JWT in AuthContext)
/dashboard                      → <Dashboard />
/products                       → <ProductList />
/products/new                   → <ProductForm />
/products/:id/edit              → <ProductForm />
/products/:id/stock             → <ProductStock />
/categories                     → <CategoryList />
/reorder-rules                  → <ReorderRules />
/operations/receipts            → <ReceiptList />
/operations/receipts/new        → <ReceiptForm />
/operations/receipts/:id        → <ReceiptForm />  (view/validate mode)
/operations/deliveries          → <DeliveryList />
/operations/deliveries/new      → <DeliveryForm />
/operations/deliveries/:id      → <DeliveryForm />  (view/pick/pack/validate)
/operations/adjustments         → <AdjustmentList />
/operations/adjustments/new     → <AdjustmentForm />
/operations/adjustments/:id     → <AdjustmentForm />
/operations/transfers           → <TransferList />
/operations/transfers/new       → <TransferForm />
/operations/transfers/:id       → <TransferForm />
/operations/moves               → <MoveHistory />
/settings/warehouses            → <WarehouseSettings />
/profile                        → <Profile />
```

## KEY UI PATTERNS

### 1. Operation Form Pattern (Receipts, Deliveries, Transfers, Adjustments)
All operation forms follow the same structure:
```
┌──────────────────────────────────────────────┐
│ Header: "New Receipt" + Status Badge         │
├──────────────────────────────────────────────┤
│ Reference: REC-00001 (auto, readonly)        │
│ Supplier: [input]  (receipts only)           │
│ Source Location: [dropdown] (deliveries/transfers)│
│ Dest Location: [dropdown]  (receipts/transfers)  │
│ Scheduled Date: [date picker]                │
│ Notes: [textarea]                            │
├──────────────────────────────────────────────┤
│ Line Items:                                  │
│ ┌─────────┬──────────┬──────────┬─────────┐ │
│ │ Product │ Demand   │ Done Qty │ Remove  │ │
│ ├─────────┼──────────┼──────────┼─────────┤ │
│ │ [select]│ [number] │ [number] │ [x]     │ │
│ │ [select]│ [number] │ [number] │ [x]     │ │
│ └─────────┴──────────┴──────────┴─────────┘ │
│ [+ Add Line]                                 │
├──────────────────────────────────────────────┤
│ [Save Draft]  [Validate]                     │
│ (Deliveries: [Pick] [Pack] [Validate])       │
└──────────────────────────────────────────────┘
```

### 2. Dashboard Layout
```
┌──────────────────────────────────────────────┐
│ KPI Cards Row (5 cards, responsive grid)     │
│ [📦 Total] [⚠️ Low] [📥 Recv] [📤 Del] [🔄 Trf] │
├──────────────────────────────────────────────┤
│ Filter Bar                                   │
│ [Type ▼] [Status ▼] [Warehouse ▼] [Category ▼] │
├──────────────────────────────────────────────┤
│ Operations Table                             │
│ Reference | Type | Status | Date | Actions   │
│ REC-001   | Receipt | Done | ...  | View     │
│ DEL-002   | Delivery| Draft| ...  | View     │
└──────────────────────────────────────────────┘
```

### 3. Delivery-Specific Flow
Deliveries have 3 action buttons depending on status:
- `status === "draft"` → Show **[Pick Items]** button
- `status === "waiting"` → Show **[Pack Items]** button
- `status === "ready"` → Show **[Validate & Ship]** button
- `status === "done"` → All fields readonly, no buttons

## PHASE EXECUTION ORDER

Execute phases in this order. After EACH phase, update DEVLOG.md.

### Phase F1 — Project Setup
1. `npm create vite@latest frontend -- --template react`
2. `cd frontend && npm install`
3. `npm install -D tailwindcss @tailwindcss/vite` and configure
4. `npm install react-router-dom axios react-hot-toast react-icons`
5. Create folder structure: `api/`, `components/`, `pages/`, `context/`, `hooks/`, `utils/`
6. Set up `utils/constants.js` with `API_BASE_URL = 'http://localhost:8000'`
7. Set up `api/client.js` with Axios instance + JWT interceptor
8. Verify: `npm run dev` runs at localhost:5173

### Phase F2 — Layout + Auth
1. Build `Sidebar.jsx` — dark sidebar matching navigation structure exactly
2. Build `TopBar.jsx` — page title + user info
3. Build `AppLayout.jsx` — sidebar + topbar + `<Outlet />` content area
4. Build `AuthContext.jsx` — stores JWT in localStorage, provides `user`, `login()`, `logout()`, `isAuthenticated`
5. Build `Login.jsx`, `Signup.jsx`, `ForgotPassword.jsx` — clean forms with validation
6. Set up `App.jsx` with React Router — public routes + protected routes wrapped in AppLayout
7. After login success → redirect to `/dashboard`

### Phase F3 — Dashboard
1. Build `KPICard.jsx` — icon + label + value + color
2. Build `FilterBar.jsx` — dropdowns for type, status, warehouse, category
3. Build `Dashboard.jsx` — fetches KPIs, renders 5 cards + filter bar + operations table
4. Build `DataTable.jsx` — reusable table with column definitions, sorting, click-to-view
5. Build `StatusBadge.jsx` — colored pill showing operation status

### Phase F4 — Products Module
1. Build `ProductList.jsx` — DataTable with columns: Name, SKU, Category, UoM, Stock, Actions
2. Add `SearchBar.jsx` in header — search by SKU or product name
3. Build `ProductForm.jsx` — create/edit form with all fields including optional initial stock
4. Build `ProductStock.jsx` — table showing stock per location for a product
5. Build `CategoryList.jsx` — simple CRUD list for categories
6. Build `ReorderRules.jsx` — table showing products + reorder_level + reorder_qty + current stock + alert indicator

### Phase F5 — Receipts + Deliveries
1. Build `ReceiptList.jsx` — table with status filter, "New Receipt" button
2. Build `ReceiptForm.jsx` — form following Operation Form Pattern above
3. Build `DeliveryList.jsx` — table with status filter
4. Build `DeliveryForm.jsx` — form with Pick/Pack/Validate buttons based on status
5. Wire up validate actions with confirmation dialogs

### Phase F6 — Transfers + Adjustments
1. Build `TransferList.jsx` + `TransferForm.jsx`
2. Build `AdjustmentList.jsx` + `AdjustmentForm.jsx`
   - Adjustment form shows "Recorded Qty" (readonly from API) and "Counted Qty" (input)
   - Diff is computed client-side for preview

### Phase F7 — Move History
1. Build `MoveHistory.jsx` — DataTable showing stock ledger entries
2. Filters: product, location, move type, date range
3. Columns: Timestamp, Reference, Product, Location, Type, Qty Change, Qty After, Remarks
4. Color-code qty_change: green for positive, red for negative

### Phase F8 — Settings + Profile
1. Build `WarehouseSettings.jsx` — Warehouse list with expand to show locations
2. CRUD modals for adding/editing warehouses and locations
3. Build `Profile.jsx` — show user info, edit name/email, change password (optional)
4. Logout functionality in sidebar

### Phase F9 — Polish
1. `AlertBanner.jsx` — banner at top of dashboard showing low stock products
2. `Toast.jsx` — success/error toast notifications (use react-hot-toast)
3. Loading spinners on all data fetches
4. Empty states ("No products found", "No pending receipts")
5. Error states (API failures gracefully handled)
6. Responsive: sidebar collapses on mobile
7. Remove all API mocks and verify real API integration

## DEPENDENCIES (package.json)
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "axios": "^1.7.0",
    "react-hot-toast": "^2.4.0",
    "react-icons": "^5.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "autoprefixer": "^10.4.0"
  }
}
```

## REMEMBER
- Always read DEVLOG.md before starting any phase — check if APIs are ready
- Always update DEVLOG.md after each phase
- Never touch backend/ directory
- Mock APIs that aren't ready yet, remove mocks when they become available
- If you need an API change, write it in "Integration Notes" section of DEVLOG.md
- Follow the exact navigation structure from the problem statement
- Use consistent Tailwind color scheme defined above
