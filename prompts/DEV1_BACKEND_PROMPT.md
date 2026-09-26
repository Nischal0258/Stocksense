# Dev 1 — Backend AI Agent Prompt

Copy-paste everything below this line into your AI agent to start working.

---

## SYSTEM CONTEXT

You are building the **backend** for **StockSense**, an Inventory Management System. You are **Dev 1 (Backend Developer)**. Another developer (Dev 2) is building the frontend simultaneously.

## CRITICAL RULES — READ BEFORE DOING ANYTHING

1. **READ FIRST**: Before writing any code, read `DEVLOG.md` in the project root. It contains the problem statement, API contract, and progress logs. Check if any phases have been completed already.

2. **FILE OWNERSHIP**: You own ONLY the `backend/` directory. **NEVER create, edit, or delete any file inside `frontend/`**. If you do, it will cause merge conflicts with Dev 2.

3. **YOUR FILES**:
   ```
   backend/                          ← You own EVERYTHING here
   ├── app/
   │   ├── __init__.py
   │   ├── main.py                   # FastAPI app, CORS, router includes
   │   ├── config.py                 # Settings (SECRET_KEY, DB_URL, etc.)
   │   ├── database.py               # SQLAlchemy engine, SessionLocal, Base
   │   ├── models/                   # ORM models
   │   │   ├── __init__.py
   │   │   ├── user.py               # User model
   │   │   ├── product.py            # Product, Category models
   │   │   ├── warehouse.py          # Warehouse, Location models
   │   │   └── stock.py              # StockQuant, StockOperation, StockMoveLine, StockLedger
   │   ├── schemas/                  # Pydantic schemas (request/response)
   │   │   ├── __init__.py
   │   │   ├── auth.py
   │   │   ├── product.py
   │   │   ├── warehouse.py
   │   │   └── stock.py
   │   ├── routers/                  # API endpoints
   │   │   ├── __init__.py
   │   │   ├── auth.py
   │   │   ├── dashboard.py
   │   │   ├── products.py
   │   │   ├── receipts.py
   │   │   ├── deliveries.py
   │   │   ├── transfers.py
   │   │   ├── adjustments.py
   │   │   ├── moves.py
   │   │   ├── warehouses.py
   │   │   └── profile.py
   │   ├── services/                 # Business logic
   │   │   ├── __init__.py
   │   │   ├── auth_service.py
   │   │   ├── stock_service.py      # CRITICAL: validate receipts/deliveries/transfers/adjustments
   │   │   └── alert_service.py      # Low stock detection
   │   └── utils/
   │       ├── security.py           # JWT create/verify, password hash/verify
   │       └── otp.py                # OTP generate/verify
   ├── requirements.txt
   ├── seed_data.py                  # Demo data for presentation
   └── tests/
       ├── __init__.py
       ├── test_auth.py
       └── test_stock.py
   ```

4. **DEVLOG UPDATES**: After completing each phase, append a log entry to the **"Backend Progress Log"** section in `DEVLOG.md`. Use this format:
   ```markdown
   ### [Phase ID] — [YYYY-MM-DD HH:MM]

   **Status:** ✅ Complete
   **Files Created/Modified:**
   - `backend/app/models/user.py` — Created User model
   - `backend/app/routers/auth.py` — Login/Signup endpoints

   **What Was Done:**
   - Brief description of what was implemented

   **API Contract Updates:**
   - Updated status of relevant endpoints in the API Contract section from ⬜ to ✅

   **Next Phase:** [Phase ID]
   ```

5. **API CONTRACT**: When you complete an API endpoint, update its status in the "API Contract" section of `DEVLOG.md` from `⬜ Not Started` to `✅ Done`. Dev 2 relies on this to know which APIs are ready.

6. **CORS**: Enable CORS in `main.py` for `http://localhost:5173` (Vite dev server).

7. **Server runs on**: `http://localhost:8000`

## DATABASE MODELS

### User
- id (int, PK, autoincrement)
- name (string, required)
- email (string, unique, required)
- password_hash (string, required)
- role (string: "inventory_manager" | "warehouse_staff")
- otp (string, nullable)
- otp_expiry (datetime, nullable)
- created_at (datetime, default=now)

### Category
- id (int, PK)
- name (string, unique, required)
- description (string, optional)

### Warehouse
- id (int, PK)
- name (string, required)
- code (string, unique, required)
- address (string, optional)
- is_active (bool, default=True)

### Location
- id (int, PK)
- warehouse_id (FK → Warehouse)
- name (string, required)
- code (string, required)
- type (string: "internal" | "vendor" | "customer")

### Product
- id (int, PK)
- name (string, required)
- sku (string, unique, required)
- category_id (FK → Category, nullable)
- unit_of_measure (string, required — e.g., "kg", "units", "pcs")
- reorder_level (float, default=0)
- reorder_qty (float, default=0)
- created_at (datetime, default=now)

### StockQuant (tracks quantity per product per location)
- id (int, PK)
- product_id (FK → Product)
- location_id (FK → Location)
- quantity (float, default=0)
- last_updated (datetime)
- UNIQUE constraint on (product_id, location_id)

### StockOperation (receipts, deliveries, transfers, adjustments)
- id (int, PK)
- reference (string, unique, auto-generated — e.g., "REC-00001", "DEL-00001")
- type (string: "receipt" | "delivery" | "internal" | "adjustment")
- status (string: "draft" | "waiting" | "ready" | "done" | "cancelled")
- source_location_id (FK → Location, nullable)
- dest_location_id (FK → Location, nullable)
- supplier_name (string, nullable — for receipts)
- notes (string, nullable)
- created_by (FK → User)
- scheduled_date (datetime, nullable)
- done_date (datetime, nullable)
- created_at (datetime, default=now)

### StockMoveLine (line items within an operation)
- id (int, PK)
- operation_id (FK → StockOperation)
- product_id (FK → Product)
- demand_qty (float, required)
- done_qty (float, default=0)

### StockLedger (immutable audit log)
- id (int, PK)
- product_id (FK → Product)
- location_id (FK → Location)
- operation_id (FK → StockOperation)
- move_type (string: "receipt" | "delivery" | "transfer_in" | "transfer_out" | "adjustment")
- qty_change (float — positive for increase, negative for decrease)
- qty_after (float — stock quantity after this change)
- timestamp (datetime, default=now)
- remarks (string, nullable)

## CORE BUSINESS LOGIC (stock_service.py)

### validate_receipt(operation_id):
```python
for line in operation.move_lines:
    quant = get_or_create_quant(line.product_id, operation.dest_location_id)
    quant.quantity += line.done_qty
    create_ledger_entry(product, dest_location, +done_qty, qty_after=quant.quantity, "receipt")
operation.status = "done"
operation.done_date = now()
```

### validate_delivery(operation_id):
```python
for line in operation.move_lines:
    quant = get_quant(line.product_id, operation.source_location_id)
    if quant.quantity < line.done_qty:
        raise HTTPException(400, f"Insufficient stock for {product.name}")
    quant.quantity -= line.done_qty
    create_ledger_entry(product, source_location, -done_qty, qty_after=quant.quantity, "delivery")
operation.status = "done"
operation.done_date = now()
```

### validate_transfer(operation_id):
```python
for line in operation.move_lines:
    source_quant = get_quant(line.product_id, operation.source_location_id)
    dest_quant = get_or_create_quant(line.product_id, operation.dest_location_id)
    if source_quant.quantity < line.done_qty:
        raise HTTPException(400, f"Insufficient stock at source")
    source_quant.quantity -= line.done_qty
    dest_quant.quantity += line.done_qty
    create_ledger_entry(product, source, -done_qty, source_quant.quantity, "transfer_out")
    create_ledger_entry(product, dest, +done_qty, dest_quant.quantity, "transfer_in")
operation.status = "done"
```

### validate_adjustment(operation_id):
```python
for line in operation.move_lines:
    quant = get_or_create_quant(line.product_id, operation.dest_location_id)
    recorded = quant.quantity
    counted = line.done_qty  # done_qty holds the counted value
    diff = counted - recorded
    quant.quantity = counted
    create_ledger_entry(product, location, diff, qty_after=counted, "adjustment")
operation.status = "done"
```

### Delivery State Transitions:
- `POST /api/deliveries` → status = "draft"
- `POST /api/deliveries/:id/pick` → status = "waiting"
- `POST /api/deliveries/:id/pack` → status = "ready"
- `POST /api/deliveries/:id/validate` → status = "done" (stock decreases here)

## PHASE EXECUTION ORDER

Execute phases in this order. After EACH phase, update DEVLOG.md.

### Phase B1 — Project Setup + All DB Models
1. Create `backend/` directory with all subdirectories
2. Create `requirements.txt`: fastapi, uvicorn, sqlalchemy, pydantic, python-jose, passlib, bcrypt, python-multipart
3. Create `config.py`, `database.py` (SQLite at `backend/stocksense.db`)
4. Create ALL model files with ALL columns as specified above
5. Create `main.py` with CORS for `http://localhost:5173` and all router includes
6. Run: `pip install -r requirements.txt`
7. Verify: `uvicorn app.main:app --reload` starts without errors

### Phase B2 — Auth APIs
1. `utils/security.py`: JWT create/verify (HS256, 24h expiry), password hash/verify with bcrypt
2. `utils/otp.py`: generate 6-digit OTP, verify OTP with expiry check
3. `schemas/auth.py`: SignupRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest, TokenResponse
4. `routers/auth.py`: POST signup, login, forgot-password, reset-password
5. `services/auth_service.py`: signup logic, login logic, OTP logic
6. Auth dependency: `get_current_user()` extracts user from JWT in Authorization header

### Phase B3 — Product + Category APIs
1. `schemas/product.py`: ProductCreate (with optional initial_stock, initial_location_id), ProductResponse, CategoryCreate, CategoryResponse
2. `routers/products.py`: GET (list+search), POST (create with optional initial stock), PUT, DELETE, GET /:id/stock
3. `routers/categories.py`: full CRUD (not in separate file, can be in products.py — your call)
4. When creating product with initial_stock: create a StockQuant row at the given location

### Phase B4 — Receipt + Delivery APIs
1. `schemas/stock.py`: OperationCreate, OperationResponse, MoveLineCreate, ValidateRequest
2. `routers/receipts.py`: GET list, POST create, GET detail, POST validate
3. `routers/deliveries.py`: GET list, POST create, GET detail, POST pick, POST pack, POST validate
4. `services/stock_service.py`: validate_receipt(), validate_delivery()
5. Auto-generate references: "REC-00001", "DEL-00001" (use operation count)

### Phase B5 — Transfer + Adjustment APIs
1. `routers/transfers.py`: GET list, POST create, GET detail, POST validate
2. `routers/adjustments.py`: GET list, POST create, POST validate
3. `services/stock_service.py`: validate_transfer(), validate_adjustment()
4. Auto-generate references: "TRF-00001", "ADJ-00001"

### Phase B6 — Dashboard + Operations Listing
1. `routers/dashboard.py`: GET /kpis (aggregate counts from DB)
2. `GET /api/operations` with filters: type, status, warehouse_id, category_id
3. `services/alert_service.py`: get_low_stock_products() — products where any quant.qty <= reorder_level

### Phase B7 — Move History + Reorder Rules
1. `routers/moves.py`: GET /moves with filters (product_id, location_id, type, date range)
2. Reorder rules endpoint: GET /reorder-rules (join products + quants, compute is_below_threshold)
3. PUT /products/:id/reorder to update reorder_level and reorder_qty

### Phase B8 — Warehouse + Location + Profile APIs
1. `routers/warehouses.py`: full CRUD + GET /:id/locations
2. `routers/profile.py`: GET + PUT current user profile (from JWT)
3. Locations: POST, PUT, DELETE under /api/locations

### Phase B9 — Seed Data + Tests
1. `seed_data.py`: Create demo warehouses, locations, products, categories, a sample receipt+delivery flow
2. `tests/test_stock.py`: Test receipt validation (stock increases), delivery validation (stock decreases, insufficient stock error), transfer (source decreases, dest increases), adjustment (quantity corrected)
3. Final review of all endpoints against API contract

## REQUIREMENTS.TXT
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.35
pydantic==2.9.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.12
```

## HOW TO RUN
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## REMEMBER
- Always update DEVLOG.md after each phase
- Always update API contract statuses from ⬜ to ✅
- Never touch frontend/ directory
- If you need to communicate something to Dev 2, write it in the "Integration Notes" section of DEVLOG.md
