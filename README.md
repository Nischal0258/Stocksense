# StockSense — Inventory Management System

> A modular, real-time Inventory Management System that replaces manual registers, Excel sheets, and scattered tracking with a centralized web application.

Built for the **Odoo Hackathon** by a two-person team using AI-assisted development.

---

## Features

### Authentication & Security
- User signup and login with **JWT access tokens**
- **OTP-based password reset** flow
- Role-based access: `Inventory Manager` and `Warehouse Staff`
- Secure password hashing with **bcrypt**

### Dashboard
- **5 Real-Time KPIs** — Total Products, Low Stock Items, Pending Receipts, Pending Deliveries, Scheduled Transfers
- **Dynamic Filters** — Filter operations by document type, status, warehouse, location, and product category
- Low stock alert items with reorder suggestions

### Core Inventory Operations

| Operation | Description |
|:---|:---|
| **Receipts** | Receive goods from suppliers — stock increases at destination location |
| **Deliveries** | Ship goods to customers via 3-step workflow: **Pick → Pack → Validate** — stock decreases with insufficient-stock protection |
| **Internal Transfers** | Move stock between warehouse locations — source decreases, destination increases, total unchanged |
| **Stock Adjustments** | Reconcile physical count vs. system records — auto-calculates delta and adjusts stock |

### Products & Inventory
- Full CRUD with **SKU**, categories, and unit of measure (kg, units, pcs, etc.)
- **Initial stock** setup on product creation
- **Per-location stock breakdown** (see exactly how much of each product is at each shelf/rack)
- **Reorder rules** — configurable minimum threshold and reorder quantity per product

### Multi-Warehouse Architecture
- Multiple warehouses with unique codes and addresses
- Hierarchical locations within each warehouse (internal, vendor, customer)
- Auto-generated default location on warehouse creation

### Audit Trail — Stock Ledger
- **Immutable move history** — every stock change is permanently logged
- Records product, location, operation reference, signed quantity delta, resulting balance, timestamp, and remarks
- Filterable by product, location, move type, and date range

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Backend** | Python · FastAPI · SQLAlchemy · Pydantic |
| **Frontend** | React 18 · Vite · Tailwind CSS *(in progress)* |
| **Database** | SQLite |
| **Auth** | JWT (PyJWT) · bcrypt · OTP |
| **Testing** | pytest · httpx |

---

## Project Structure

```
StockSense/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint with CORS & lifespan
│   │   ├── config.py            # Application settings
│   │   ├── database.py          # SQLAlchemy engine & session
│   │   ├── models/              # ORM models
│   │   │   ├── user.py          # User with roles, OTP fields
│   │   │   ├── product.py       # Product, Category
│   │   │   ├── warehouse.py     # Warehouse, Location
│   │   │   └── stock.py         # StockQuant, StockOperation, StockMoveLine, StockLedger
│   │   ├── routers/             # API endpoint handlers
│   │   │   ├── auth.py          # Signup, Login, OTP reset, /me
│   │   │   ├── dashboard.py     # KPIs & operations listing
│   │   │   ├── products.py      # Product CRUD & stock breakdown
│   │   │   ├── categories.py    # Category CRUD
│   │   │   ├── receipts.py      # Incoming goods workflow
│   │   │   ├── deliveries.py    # Outgoing goods (Pick → Pack → Validate)
│   │   │   ├── transfers.py     # Internal location transfers
│   │   │   ├── adjustments.py   # Physical count reconciliation
│   │   │   ├── moves.py         # Stock ledger & reorder rules
│   │   │   ├── warehouses.py    # Warehouse & Location management
│   │   │   └── profile.py       # User profile management
│   │   ├── schemas/             # Pydantic request/response models
│   │   ├── services/            # Business logic
│   │   │   ├── auth_service.py  # Auth operations
│   │   │   ├── stock_service.py # Receipt/Delivery/Transfer/Adjustment validation
│   │   │   └── alert_service.py # Dashboard KPI aggregation
│   │   └── utils/               # Security, OTP, JWT utilities
│   ├── tests/
│   │   └── test_stock.py        # 8 automated end-to-end tests
│   ├── seed_data.py             # Demo data generator
│   └── requirements.txt
├── frontend/                    # React frontend (Dev 2 — in progress)
├── API_CONTRACT.md              # Complete API documentation for frontend integration
├── DEVLOG.md                    # Development log, progress tracker, and API contract
└── prompts/                     # AI agent prompts for each developer
```

---

## Getting Started

### Prerequisites

- **Python 3.10+**
- **pip** (Python package manager)

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/Nischal0258/Stocksense.git
cd Stocksense

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Seed the database with demo data
python seed_data.py

# 4. Start the backend server
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**

### Interactive API Documentation

Once the server is running, visit:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Demo Credentials

| Role | Email | Password |
|:---|:---|:---|
| Inventory Manager | `admin@stocksense.com` | `Password123` |
| Warehouse Staff | `staff@stocksense.com` | `Password123` |

---

## API Endpoints

> Full specification with request/response bodies is available in [`API_CONTRACT.md`](API_CONTRACT.md)

| Module | Endpoints | Description |
|:---|:---|:---|
| **Auth** | `POST /api/auth/signup`, `login`, `forgot-password`, `reset-password`, `GET /me` | JWT auth with OTP reset |
| **Dashboard** | `GET /api/dashboard/kpis`, `GET /api/operations` | 5 KPIs + filtered operations |
| **Products** | `GET/POST/PUT/DELETE /api/products`, `GET /:id/stock` | CRUD with per-location stock |
| **Categories** | `GET/POST/PUT/DELETE /api/categories` | Product categorization |
| **Receipts** | `GET/POST /api/receipts`, `POST /:id/validate` | Incoming goods |
| **Deliveries** | `GET/POST /api/deliveries`, `POST /:id/pick`, `pack`, `validate` | 3-step outgoing workflow |
| **Transfers** | `GET/POST /api/transfers`, `POST /:id/validate` | Internal location moves |
| **Adjustments** | `GET/POST /api/adjustments`, `POST /:id/validate` | Physical count reconciliation |
| **Moves** | `GET /api/moves` | Immutable stock audit ledger |
| **Warehouses** | `GET/POST/PUT/DELETE /api/warehouses`, `/api/locations` | Multi-warehouse management |
| **Reorder** | `GET /api/reorder-rules`, `PUT /api/products/:id/reorder` | Safety stock thresholds |
| **Profile** | `GET/PUT /api/profile` | User profile management |

---

## Running Tests

```bash
cd backend
python -m pytest tests/test_stock.py -v
```

**Test Suite (8 tests):**
| Test | What It Verifies |
|:---|:---|
| `test_auth_login` | User authentication and JWT token generation |
| `test_product_creation_and_search` | Product CRUD and SKU search |
| `test_receipt_increases_stock` | Receiving goods increases location stock |
| `test_delivery_decreases_stock` | Shipping goods decreases location stock |
| `test_delivery_rejects_insufficient_stock` | Over-shipping blocked with HTTP 400 |
| `test_internal_transfer_maintains_total_stock` | Transfers move stock without changing total |
| `test_stock_adjustment` | Physical count delta correctly adjusts stock |
| `test_move_history_and_dashboard_kpis` | Ledger entries recorded and KPIs calculated |

---

## Problem Statement Demo Flow

The seed data reproduces the exact scenario from the problem statement:

```
Step 1: Receipt (REC-00001)
         Receive 100 kg Steel from Global Steel Industries
         → Stock: +100 kg at Main Storage

Step 2: Internal Transfer (TRF-00001)
         Move 30 kg Steel from Main Storage → Production Floor
         → Main Storage: 70 kg | Production Floor: 30 kg | Total: 100 kg

Step 3: Delivery (DEL-00001)
         Ship 20 kg Steel to customer (Pick → Pack → Validate)
         → Main Storage: 50 kg | Total: 80 kg

Step 4: Adjustment (ADJ-00001)
         Physical count finds 3 kg damaged at Production Floor
         Counted: 27 kg | Recorded: 30 kg | Delta: -3 kg
         → Production Floor: 27 kg | Total: 77 kg

All 4 operations are permanently recorded in the Stock Ledger.
```

---

## Database Schema

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │   Category   │     │  Warehouse   │
│──────────────│     │──────────────│     │──────────────│
│ id           │     │ id           │     │ id           │
│ name         │     │ name         │     │ name         │
│ email        │     │ description  │     │ code         │
│ password_hash│     └──────┬───────┘     │ address      │
│ role         │            │             └──────┬───────┘
│ otp          │            │                    │
│ otp_expiry   │     ┌──────┴───────┐     ┌──────┴───────┐
└──────┬───────┘     │   Product    │     │   Location   │
       │             │──────────────│     │──────────────│
       │             │ id           │     │ id           │
       │             │ name         │     │ warehouse_id │
       │             │ sku          │     │ name         │
       │             │ category_id  │     │ code         │
       │             │ unit_of_meas │     │ type         │
       │             │ reorder_level│     └──────┬───────┘
       │             │ reorder_qty  │            │
       │             └──────┬───────┘            │
       │                    │                    │
       │             ┌──────┴────────────────────┴──────┐
       │             │          StockQuant               │
       │             │  product_id + location_id → qty   │
       │             └──────────────────────────────────┘
       │
┌──────┴────────────────────────────────────────────────┐
│                  StockOperation                        │
│  id | reference | type | status | source | dest | ... │
├────────────────────────────────────────────────────────┤
│                  StockMoveLine                         │
│  operation_id | product_id | demand_qty | done_qty     │
├────────────────────────────────────────────────────────┤
│                  StockLedger (Immutable Audit Trail)    │
│  product_id | location_id | operation_id | move_type   │
│  qty_change | qty_after | timestamp | remarks          │
└────────────────────────────────────────────────────────┘
```

---

## Team

| Role | Scope |
|:---|:---|
| **Dev 1 (Backend)** | FastAPI, database models, all APIs, business logic, seed data, tests |
| **Dev 2 (Frontend)** | React, Tailwind CSS, all pages, components, API integration |

---

## License

This project was built for the Odoo Hackathon.
