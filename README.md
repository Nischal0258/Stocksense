# StockSense — Enterprise Inventory & Warehouse Management System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0%2B-D71F00?logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen)

<p align="center">
  <strong>A modern, high-performance Inventory and Warehouse Management System (IMS) engineered for multi-facility visibility, automated replenishment, strict role-based access control, and immutable double-entry stock ledger auditing.</strong>
</p>

[Key Capabilities](#-key-capabilities) • [System Architecture](#-system-architecture) • [Quick Start](#-quick-start-guide) • [Security & RBAC](#-role-based-access-control-rbac) • [API Reference](#-rest-api-contract) • [Automated Verification](#-testing--quality-assurance)

</div>

---

## 📌 Executive Overview

**StockSense** is an enterprise-grade inventory management platform designed to replace fragmented spreadsheets and paper registers with a centralized, real-time operating system. Engineered for high-throughput distribution hubs, retail networks, and manufacturing facilities, StockSense ensures end-to-end inventory integrity from supplier intake to final customer dispatch.

### Core Value Propositions
- **Unified Inventory Intelligence**: Real-time telemetry tracking SKU velocities, stock levels, and safety thresholds across all regional facilities and internal rack locations.
- **Strict Role-Based Access Control (RBAC)**: Enforced separation of duties between **Inventory Managers** (catalog administration, facility configuration, threshold policies) and **Warehouse Staff** (dock receipts, pick-pack fulfillment, physical cycle counting).
- **Zero-Drift Stock Integrity**: All physical stock mutations are verified against an **immutable, double-entry stock ledger**, preventing over-shipments and guaranteeing complete audit traceability.
- **Automated Replenishment**: Dynamic deficit calculations trigger automated purchase consignment recommendations before out-of-stock events impact operations.

---

## 🚀 Key Capabilities

### 1. Operations Telemetry & Dashboard
- **5 High-Impact Real-Time KPIs**: Total SKUs, Low Stock warnings, Pending Inbound Consignments, Pending Outbound Deliveries, and Scheduled Internal Transfers.
- **Stock Movement Analytics**: Interactive velocity visualization comparing 7-day inbound freight arrivals against outbound customer fulfillment dispatches.
- **Warehouse Capacity Pulse**: Instant storage utilization tracking across active distribution centers.
- **Inventory Health Analysis**: Categorization of the entire product catalog into Healthy, Under-Threshold, and Depleted stock states.

### 2. Product Catalog & Storage Taxonomy
- **Product Catalog Management**: SKU registration with unit costs, categories, units of measure (units, kg, liters, meters, boxes), and initial location balances.
- **Stock Availability per Location**: Granular bin-level breakdown displaying exact quantities across distinct warehouses (e.g., `Central Distribution Center`, `East Hub`) and rack bays (`Main Storage`, `Rack A-01`, `Cold Zone`).
- **Product Categories**: Structured taxonomy management with live roll-up SKU counts and valuation metrics.
- **Reordering Rules**: Automated replenishment rules with minimum safe stock limits, batch order sizes, and **1-Click Restock PO Generation**.

### 3. Core Warehouse Operations
```
                 ┌─────────────────────────────────────────┐
                 │             SUPPLIER / VENDOR           │
                 └────────────────────┬────────────────────┘
                                      │
                             [ 1. Inbound Receipt ]
                           (Draft → Ready → Done)
                                      │
                                      ▼
                 ┌─────────────────────────────────────────┐
                 │       RECEIVING / MAIN STORAGE          │
                 │              (WH1-MAIN)                 │
                 └──────┬───────────────────────────┬──────┘
                        │                           │
            [ 2. Internal Transfer ]     [ 3. Outbound Delivery ]
             (Bay A-01 → Staging)         (Pick → Pack → Validate)
                        │                           │
                        ▼                           ▼
            ┌───────────────────────┐   ┌──────────────────────────┐
            │   PRODUCTION / ZONE   │   │  CUSTOMER FULFILLMENT    │
            │      (WH2-ZONE-B)     │   │      (Dispatch Bay)      │
            └───────────┬───────────┘   └──────────────────────────┘
                        │
            [ 4. Stock Adjustment ]
             (Physical Count Audit)
                        │
                        ▼
            ┌───────────────────────────────────┐
            │    PERMANENT DOUBLE-ENTRY LEDGER  │
            │   (Immutable Audit Trail Record)  │
            └───────────────────────────────────┘
```
- **Inbound Receipts**: Validate supplier consignments against purchase orders, automatically updating warehouse balances.
- **Three-Stage Outbound Deliveries**: 
  - **Stage 1 (Pick)**: Allocates stock from designated bins (`Draft` $\rightarrow$ `Waiting`).
  - **Stage 2 (Pack)**: Prepares physical parcel packaging (`Waiting` $\rightarrow$ `Ready`).
  - **Stage 3 (Validate & Ship)**: Atomically deducts inventory with **strict insufficient stock protection** preventing over-allocation (`Ready` $\rightarrow$ `Done`).
- **Internal Transfers**: Coordinates balanced bay-to-bay and warehouse-to-warehouse stock relocations with dual-sided ledger tracking (`transfer_out` and `transfer_in`).
- **Physical Stock Adjustments**: Fast cycle count auditing tool calculating physical-vs-system variance with mandatory audit reasoning notes.

### 4. Facility Infrastructure & Settings
- **Warehouse Configuration**: Provision independent physical distribution hubs with custom facility codes, geographical addresses, and operational statuses.
- **Storage Rack & Bin Management**: Define granular locations categorized as `Internal Storage`, `Vendor Inbound Dock`, or `Customer Dispatch Bay`.
- **Zero-Accident Safety Deletion**: System blocks the deletion of any warehouse or location actively holding non-zero stock.

### 5. Account Profile & Security
- **Left Sidebar Profile Menu**: User identity pill with real-time online status and role badge.
- **User Account Modal ("My Profile")**: View account details, update display name and email address, and change passwords with current-password verification.
- **Session Termination**: Direct, single-click logout with complete token purge and state reset.

---

## 🔒 Role-Based Access Control (RBAC)

StockSense implements strict principle-of-least-privilege access control:

| Operational Capability | Inventory Manager | Warehouse Staff | Enforcement Mechanism |
|:---|:---:|:---:|:---|
| **View Dashboard & Operations** | ✅ Full Access | ✅ Full Access | Open Telemetry |
| **View Product Catalog & Stock** | ✅ Full Access | ✅ Full Access | Read-Only View |
| **Create / Edit / Delete Products** | ✅ Permitted | ❌ Blocked | Backend `require_manager` (HTTP 403) + UI Lock |
| **Configure Reorder Thresholds** | ✅ Permitted | ❌ Blocked | Backend `require_manager` (HTTP 403) + UI Lock |
| **Create / Manage Categories** | ✅ Permitted | ❌ Blocked | Backend `require_manager` (HTTP 403) + UI Lock |
| **Configure Warehouses & Locations** | ✅ Permitted | ❌ Blocked | Backend `require_manager` (HTTP 403) + UI Lock |
| **Receive Goods (Receipts)** | ✅ Permitted | ✅ Permitted | Operational Workflow |
| **Deliveries (Pick, Pack, Ship)** | ✅ Permitted | ✅ Permitted | Operational Workflow |
| **Execute Stock Adjustments** | ✅ Permitted | ✅ Permitted | Operational Workflow |
| **Internal Stock Transfers** | ✅ Permitted | ✅ Permitted | Operational Workflow |
| **Audit Stock Ledger** | ✅ Permitted | ✅ Permitted | Read-Only Audit Trail |

---

## 🏗️ System Architecture

StockSense is architected as a decoupled, full-stack application following clean Domain-Driven Design (DDD) principles:

```
StockSense/
├── backend/                  ← High-Performance Python API (FastAPI)
│   ├── app/
│   │   ├── main.py           ← ASGI Application Entrypoint & Middleware
│   │   ├── config.py         ← Configuration & Environment Bindings
│   │   ├── database.py       ← SQLAlchemy 2.0 Engine & Foreign Key Pragmas
│   │   ├── models/           ← Relational ORM Entities (User, Product, Stock, Warehouse)
│   │   ├── schemas/          ← Pydantic v2 Serialization & Request Contracts
│   │   ├── routers/          ← REST Endpoints (Auth, Dashboard, Products, Operations, Warehouses)
│   │   ├── services/         ← Transaction Services & Stock State Machines
│   │   └── utils/            ← Security, JWT Cryptography, & RBAC Dependencies
│   ├── tests/
│   │   └── test_stock.py     ← Automated Pytest Integration Suite
│   ├── seed_data.py          ← Enterprise Database Seeder & Mock Activity Engine
│   └── requirements.txt      ← Production Backend Dependencies
├── frontend/                 ← Modern SPA Frontend (React 19 + TypeScript + Vite)
│   ├── src/
│   │   ├── api/              ← Typed Client with Bearer Token Injection & Service Handlers
│   │   ├── context/          ← React Context Providers (AuthContext, InventoryContext, ToastContext)
│   │   ├── components/
│   │   │   ├── auth/         ← Authentication Screen with 1-Click Demo Profiles
│   │   │   ├── dashboard/    ← Telemetry Bento Grid, Hero Pulse, Stock Velocity Chart
│   │   │   ├── products/     ← Product Catalog, Stock per Location, Categories, Reorder Rules
│   │   │   ├── operations/   ← Receipts, Deliveries, Transfers, Adjustments
│   │   │   ├── history/      ← Immutable Movement Ledger Table
│   │   │   ├── settings/     ← Warehouse & Storage Location Administration
│   │   │   ├── profile/      ← User Profile Modal & Security Credentials Form
│   │   │   └── ui/           ← Reusable Glassmorphism Modals, Badges, & Navigation
│   │   ├── types/            ← Shared Domain Type Definitions
│   │   └── App.tsx           ← Top-Level Navigation Router & Layout Wrapper
│   └── vite.config.ts        ← Vite Development Server with Automatic API Proxying
├── API_CONTRACT.md           ← Complete Technical REST API Specification
├── DEVLOG.md                 ← Development Audit Trail & Engineering Notes
└── README.md                 ← System Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (Tested on Python 3.10 through 3.14)
- **Node.js 18+** and **npm**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Nischal0258/Stocksense.git
cd Stocksense
```

---

### Step 2: Backend Setup & Database Seeding

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```bash
   # Windows:
   python -m venv .venv
   .venv\Scripts\activate

   # macOS / Linux:
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install production dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Populate the database with enterprise demonstration data:
   ```bash
   python seed_data.py
   ```

5. Launch the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   * **API Service**: [http://localhost:8000](http://localhost:8000)
   * **Interactive Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
   * **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Step 3: Frontend Setup & Launch

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install client dependencies:
   ```bash
   npm install
   ```

3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   * **Application Interface**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Pre-Seeded Demonstration Accounts

For immediate testing, use the pre-configured credentials:

| Role | Email | Password | Scope & Authority |
|:---|:---|:---|:---|
| **Inventory Manager** | `admin@stocksense.com` | `Password123` | Master Catalog, Warehouse Settings, Reorder Rules, Full Approval Rights |
| **Warehouse Staff** | `staff@stocksense.com` | `Password123` | Operational Dock Intake, Pick-Pack Fulfillment, Physical Cycle Counting |

*(Note: In the sign-in screen, click **"1-Click Manager Demo"** or **"1-Click Staff Demo"** to log in instantly without typing).*

---

## 📡 REST API Contract

StockSense exposes a fully typed REST API conforming to OpenAPI 3.1 specifications.

| Group | Method | Endpoint | Purpose | Access |
|:---|:---:|:---|:---|:---:|
| **Auth** | `POST` | `/api/auth/login` | Authenticate and obtain JWT Bearer Token | Public |
| | `POST` | `/api/auth/signup` | Register new user account | Public |
| | `GET` | `/api/auth/me` | Fetch active authenticated identity | Authenticated |
| **Profile** | `GET` | `/api/profile` | Retrieve user profile information | Authenticated |
| | `PUT` | `/api/profile` | Update user name, email, or password | Authenticated |
| **Dashboard** | `GET` | `/api/dashboard/kpis` | Aggregate 5 real-time KPIs and deficit alerts | Authenticated |
| | `GET` | `/api/operations` | Query filtered operational transactions | Authenticated |
| **Products** | `GET` | `/api/products` | Search SKUs with category filtering | Authenticated |
| | `POST` | `/api/products` | Create new catalog item | Manager Only |
| | `PUT` | `/api/products/{id}` | Update product parameters | Manager Only |
| | `DELETE` | `/api/products/{id}` | Remove product from catalog | Manager Only |
| | `GET` | `/api/products/{id}/stock` | Query stock availability per location | Authenticated |
| | `PUT` | `/api/products/{id}/reorder` | Update safety thresholds & replenishment qty | Manager Only |
| **Categories** | `GET` | `/api/categories` | List categories with SKU counts | Authenticated |
| | `POST` | `/api/categories` | Create new inventory category | Manager Only |
| | `DELETE` | `/api/categories/{id}` | Delete category and unassign products | Manager Only |
| **Warehouses** | `GET` | `/api/warehouses` | List facilities and storage zones | Authenticated |
| | `POST` | `/api/warehouses` | Register new warehouse facility | Manager Only |
| | `DELETE` | `/api/warehouses/{id}` | Decommission warehouse (if stock is zero) | Manager Only |
| | `GET` | `/api/locations` | List internal storage bin locations | Authenticated |
| | `POST` | `/api/locations` | Add storage bin location to warehouse | Manager Only |
| **Receipts** | `POST` | `/api/receipts` | Create inbound vendor consignment | Authenticated |
| | `POST` | `/api/receipts/{id}/validate` | Validate goods intake and increment stock | Authenticated |
| **Deliveries** | `POST` | `/api/deliveries` | Create customer dispatch order | Authenticated |
| | `POST` | `/api/deliveries/{id}/validate` | Validate dispatch, deduct stock, & check availability | Authenticated |
| **Transfers** | `POST` | `/api/transfers` | Schedule inter-bin or inter-facility transfer | Authenticated |
| | `POST` | `/api/transfers/{id}/validate` | Commit transfer with balanced double ledger entry | Authenticated |
| **Adjustments** | `POST` | `/api/adjustments` | Record physical inventory count audit | Authenticated |
| | `POST` | `/api/adjustments/{id}/validate` | Reconcile discrepancy delta into stock ledger | Authenticated |
| **Move Ledger** | `GET` | `/api/moves` | Immutable historical stock movement audit trail | Authenticated |

---

## 🧪 Testing & Quality Assurance

StockSense includes an end-to-end integration test suite verifying state machines, ledger consistency, and RBAC constraints:

```bash
cd backend
python -m pytest tests/test_stock.py -v
```

### Verified Test Results (100% Passing)
```text
tests/test_stock.py::test_auth_login PASSED                              [ 11%]
tests/test_stock.py::test_product_creation_and_search PASSED             [ 22%]
tests/test_stock.py::test_receipt_increases_stock PASSED                 [ 33%]
tests/test_stock.py::test_delivery_decreases_stock PASSED                [ 44%]
tests/test_stock.py::test_delivery_rejects_insufficient_stock PASSED     [ 55%]
tests/test_stock.py::test_internal_transfer_maintains_total_stock PASSED [ 66%]
tests/test_stock.py::test_stock_adjustment PASSED                        [ 77%]
tests/test_stock.py::test_move_history_and_dashboard_kpis PASSED         [ 88%]
tests/test_stock.py::test_rbac_manager_vs_staff PASSED                   [100%]

============================== 9 passed in 9.38s ==============================
```

### Quality Assurance Highlights
- **Mathematical Balance Conservation**: Confirms internal transfers preserve global quantity while updating localized location quants.
- **Over-Shipment Guard**: Proves any delivery order attempting to dispatch more units than physically on hand is rejected immediately with HTTP 400.
- **Role Enforcement Validation**: Proves warehouse staff attempting catalog deletion, product creation, or warehouse modification are denied with HTTP 403 Forbidden.
- **Zero Frontend Errors**: Clean TypeScript compilation (`npm run lint` $\rightarrow$ 0 errors) and optimized Vite production build.

---

## 📄 License

StockSense is distributed under the **MIT License**. See [`LICENSE`](LICENSE) for complete terms.
