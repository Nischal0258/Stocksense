# StockSense — Intelligent Modular Inventory Management System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0%2B-D71F00?logo=sqlalchemy&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)
![Pytest](https://img.shields.io/badge/Testing-Pytest-0A9EDC?logo=pytest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Status](https://img.shields.io/badge/Status-Production--Ready-brightgreen)

<p align="center">
  <strong>A high-performance, real-time inventory management platform engineered to eliminate paper registers and error-prone spreadsheets with centralized stock control, automated reordering, multi-warehouse routing, and complete ledger auditability.</strong>
</p>

[Key Features](#key-features) • [System Architecture](#system-architecture) • [Getting Started](#getting-started) • [API Contract](#api-endpoints) • [Verification & Testing](#testing--verification)

</div>

---

## 📌 Overview

**StockSense** is an enterprise-grade Inventory Management System (IMS) designed for manufacturers, logistics centers, and retail distribution hubs. Built with **FastAPI** and modern asynchronous Python, StockSense centralizes operations across distributed warehouses, coordinates item receipts, governs internal facility transfers, executes picking/packing/shipping fulfillment workflows, and guarantees zero stock drift through physical cycle counting reconciliations.

Every movement in the system is immutably recorded in a **double-entry-style Stock Ledger**, giving organizations cryptographic precision and traceability over their physical inventory assets.

---

## ✨ Key Features

### 🔐 Security & Access Control
- **Stateless JWT Authentication**: Secure Bearer tokens with configurable expiration and automatic verification middleware.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions separating `Inventory Manager` (administering warehouses, products, rules, and global approvals) from `Warehouse Staff` (executing operational transfers, packing, and physical audits).
- **Self-Service Password Recovery**: Time-bounded, 6-digit OTP verification protocol with secure state invalidation.
- **Enterprise Password Hashing**: Passwords encrypted with salted `bcrypt`.

### 📊 Real-Time Operations Dashboard & Analytics
- **5 High-Impact Operational KPIs**:
  - **Total Products Tracked**: Active catalog volume across all categories.
  - **Low Stock & Out-of-Stock Counts**: Instant visibility into SKU depletion.
  - **Pending Receipts**: Scheduled supplier deliveries awaiting dock verification.
  - **Pending Deliveries**: Open customer orders in picking/packing/dispatch pipelines.
  - **Internal Transfers Scheduled**: Inter-location replenishment movements in transit.
- **Dynamic Multi-Vector Filters**: Drill into operations in real-time by document type (`receipt`, `delivery`, `internal`, `adjustment`), status (`draft`, `waiting`, `ready`, `done`, `cancelled`), source/dest warehouse, individual location, and category.
- **Proactive Reorder Alerts**: Automated inventory evaluation flagging SKUs operating beneath defined safety thresholds.

### 🔄 End-to-End Stock Operations

```
                   ┌─────────────────────────────────────────┐
                   │             SUPPLIER / VENDOR           │
                   └────────────────────┬────────────────────┘
                                        │
                               [ 1. Inbound Receipt ]
                                        │
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │           RECEIVING / STORAGE           │
                   │              (Main Storage)             │
                   └──────┬───────────────────────────┬──────┘
                          │                           │
              [ 2. Internal Transfer ]     [ 3. Outbound Delivery ]
                          │                 (Pick → Pack → Ship)
                          ▼                           │
              ┌───────────────────────┐               ▼
              │   PRODUCTION FLOOR    │     ┌──────────────────┐
              │     (Tooling Bay)     │     │  CUSTOMER ORDER  │
              └───────────┬───────────┘     └──────────────────┘
                          │
              [ 4. Stock Adjustment ]
                 (Damaged / Scrap)
                          │
                          ▼
              ┌───────────────────────┐
              │  PERMANENT AUDIT LOG  │
              │     (Stock Ledger)    │
              └───────────────────────┘
```

1. **Inbound Receipts (`REC-xxxxx`)**:
   - Manage incoming goods from commercial vendors.
   - Validating receipts atomically increases destination `StockQuant` and commits receipt ledger entries.
2. **Three-Stage Outbound Deliveries (`DEL-xxxxx`)**:
   - **Pick (`draft` $\rightarrow$ `waiting`)**: Allocates demand from designated stock bays.
   - **Pack (`waiting` $\rightarrow$ `ready`)**: Stages packaged items for courier dispatch.
   - **Validate & Ship (`ready` $\rightarrow$ `done`)**: Deducts physical inventory with **strict insufficient stock protection** preventing over-allocation (HTTP 400 rejection).
3. **Internal Warehouse Transfers (`TRF-xxxxx`)**:
   - Facilitates balanced moves between bays, shelves, and facilities (e.g. Storage $\rightarrow$ Assembly Line).
   - Generates coordinated two-sided ledger records (`transfer_out` and `transfer_in`) preserving total stock conservation.
4. **Physical Stock Adjustments (`ADJ-xxxxx`)**:
   - Reconciles physical counts against digital records during cycle audits.
   - Auto-calculates discrepancies (delta diff) and updates location counts with auditable variance notes.

### 🏢 Multi-Warehouse & Location Hierarchy
- **Isolated Warehouse Management**: Manage independent distribution centers, regional hubs, and facilities.
- **Granular Location Typology**: Partition warehouses into `internal` storage zones, `vendor` transit interfaces, and `customer` drop-off locations.
- **Zero-Accident Safety Deletion**: Prevents accidental decommissioning of warehouses or locations holding positive stock balances.

### 📜 Immutable Stock Ledger (Audit Trail)
- Every transaction creates a permanent, non-destructive ledger entry recording:
  - Timestamp & User Attribution
  - Product ID & SKU
  - Location & Warehouse Reference
  - Associated Operation Document (`REC`, `DEL`, `TRF`, `ADJ`)
  - Movement Classification (`receipt`, `delivery`, `transfer_in`, `transfer_out`, `adjustment`)
  - Signed Delta (`qty_change`) and Resulting Balance (`qty_after`)
  - Operational Remarks & Context Notes

---

## 🏗️ System Architecture

StockSense follows a domain-driven, layered service architecture separating concerns between persistent ORM storage, domain validation services, API schemas, and transport routers.

```
StockSense/
├── backend/
│   ├── app/
│   │   ├── main.py              # Application entrypoint, CORS & DB lifespan
│   │   ├── config.py            # Environment settings & DB connection string
│   │   ├── database.py          # SQLAlchemy 2.0 Engine & SQLite Foreign Key enforcement
│   │   ├── models/              # Relational database models
│   │   │   ├── user.py          # User accounts, RBAC roles, OTP states
│   │   │   ├── product.py       # Products, categories, UoM, reorder rules
│   │   │   ├── warehouse.py     # Warehouses & hierarchical locations
│   │   │   └── stock.py         # StockQuant, StockOperation, MoveLine, StockLedger
│   │   ├── schemas/             # Pydantic v2 validation contracts
│   │   │   ├── auth.py          # Auth & token schemas
│   │   │   ├── product.py       # Product & category DTOs
│   │   │   ├── stock.py         # Operation, lines, ledger & reorder DTOs
│   │   │   └── warehouse.py     # Warehouse & location DTOs
│   │   ├── services/            # Pure domain logic & business rules
│   │   │   ├── auth_service.py  # User lifecycle & credential verification
│   │   │   ├── stock_service.py # Core stock transactions & state machine
│   │   │   └── alert_service.py # Real-time KPI aggregation & low stock detection
│   │   ├── routers/             # FastAPI REST endpoints
│   │   │   ├── auth.py          # /api/auth
│   │   │   ├── dashboard.py     # /api/dashboard & /api/operations
│   │   │   ├── products.py      # /api/products
│   │   │   ├── categories.py    # /api/categories
│   │   │   ├── receipts.py      # /api/receipts
│   │   │   ├── deliveries.py    # /api/deliveries
│   │   │   ├── transfers.py     # /api/transfers
│   │   │   ├── adjustments.py   # /api/adjustments
│   │   │   ├── moves.py         # /api/moves & /api/reorder-rules
│   │   │   ├── warehouses.py    # /api/warehouses & /api/locations
│   │   │   └── profile.py       # /api/profile
│   │   └── utils/               # Security, password hashing & token utilities
│   ├── tests/
│   │   └── test_stock.py        # Automated test suite (Pytest + HTTPX)
│   ├── seed_data.py             # Enterprise seed generator & flow simulator
│   └── requirements.txt         # Production dependencies
├── frontend/                    # Single-Page Application (React + Vite + Tailwind)
├── API_CONTRACT.md              # REST API specification & contract documentation
└── DEVLOG.md                    # Development ledger & coordination tracker
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** (Tested on Python 3.10, 3.11, 3.12, and 3.14)
- **pip** package manager

### 1. Clone the Repository
```bash
git clone https://github.com/Nischal0258/Stocksense.git
cd Stocksense
```

### 2. Environment Setup & Installation
```bash
# Navigate to backend
cd backend

# (Optional) Create and activate a virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Initialize & Seed Database
Initialize the database tables and populate standard enterprise seed data (warehouses, locations, products, safety thresholds, and sample lifecycle operations):
```bash
python seed_data.py
```

### 4. Run the API Server
Start the Uvicorn ASGI server with automatic reload:
```bash
uvicorn app.main:app --reload --port 8000
```

The REST API is live at **`http://localhost:8000`**.

---

## 📖 Interactive Documentation

Once the backend server is running, explore and test the endpoints interactively:

- **Swagger UI (Interactive API Explorer)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc (Technical API Reference)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema (Raw JSON)**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 🔑 Pre-Configured Test Credentials

The database seeder provisions two default user profiles for immediate testing:

| Role | Email | Password | Permissions |
|:---|:---|:---|:---|
| **Inventory Manager** | `admin@stocksense.com` | `Password123` | Full access: configure warehouses, adjust stock, manage master data |
| **Warehouse Staff** | `staff@stocksense.com` | `Password123` | Operational access: execute picking, packing, transfers, and counts |

---

## 📡 API Endpoints Summary

For complete JSON request payloads, headers, query parameters, and response schemas, refer to the [API Contract Documentation](API_CONTRACT.md).

| Resource | Method | Path | Description |
|:---|:---:|:---|:---|
| **Authentication** | `POST` | `/api/auth/signup` | Register new user account |
| | `POST` | `/api/auth/login` | Authenticate and obtain JWT access token |
| | `POST` | `/api/auth/forgot-password` | Generate 6-digit password reset OTP |
| | `POST` | `/api/auth/reset-password` | Validate OTP and set new password |
| | `GET` | `/api/auth/me` | Fetch active authenticated identity |
| **Dashboard** | `GET` | `/api/dashboard/kpis` | Compute 5 real-time KPIs and low stock warnings |
| | `GET` | `/api/operations` | Query operations with dynamic multi-criteria filters |
| **Products** | `GET` | `/api/products` | Search catalog by name/SKU with category filter |
| | `POST` | `/api/products` | Create product with optional initial stock balance |
| | `GET` | `/api/products/{id}/stock` | Retrieve granular per-location stock counts |
| **Categories** | `GET` | `/api/categories` | List categories with active product count |
| | `POST` | `/api/categories` | Create product category |
| **Receipts** | `POST` | `/api/receipts` | Create inbound supplier delivery note |
| | `POST` | `/api/receipts/{id}/validate` | Validate goods receipt and increment inventory |
| **Deliveries** | `POST` | `/api/deliveries` | Create outbound shipment order |
| | `POST` | `/api/deliveries/{id}/pick` | Mark shipment as picked (`draft` $\rightarrow$ `waiting`) |
| | `POST` | `/api/deliveries/{id}/pack` | Mark shipment as packed (`waiting` $\rightarrow$ `ready`) |
| | `POST` | `/api/deliveries/{id}/validate` | Validate dispatch, deduct inventory, and record ledger |
| **Transfers** | `POST` | `/api/transfers` | Schedule internal bay-to-bay stock move |
| | `POST` | `/api/transfers/{id}/validate` | Atomically transfer stock and create double ledger entry |
| **Adjustments** | `POST` | `/api/adjustments` | Record physical inventory count audit |
| | `POST` | `/api/adjustments/{id}/validate` | Reconcile system counts with physical counts |
| **Move Ledger** | `GET` | `/api/moves` | Search immutable historical audit ledger |
| **Reorder Rules**| `GET` | `/api/reorder-rules` | Query safety stock levels and threshold alerts |
| | `PUT` | `/api/products/{id}/reorder`| Update minimum reorder level and replenishment qty |
| **Warehouses** | `GET` | `/api/warehouses` | List warehouses with nested physical locations |
| | `POST` | `/api/warehouses` | Provision new warehouse and default main storage |

---

## 🧪 Testing & Verification

StockSense incorporates an automated integration test suite built with **pytest** and **httpx**, validating the complete operational lifecycle:

```bash
cd backend
python -m pytest tests/test_stock.py -v
```

### Test Suite Execution Output
```text
============================= test session starts ==============================
collected 8 items

tests/test_stock.py::test_auth_login PASSED                              [ 12%]
tests/test_stock.py::test_product_creation_and_search PASSED             [ 25%]
tests/test_stock.py::test_receipt_increases_stock PASSED                 [ 37%]
tests/test_stock.py::test_delivery_decreases_stock PASSED                [ 50%]
tests/test_stock.py::test_delivery_rejects_insufficient_stock PASSED     [ 62%]
tests/test_stock.py::test_internal_transfer_maintains_total_stock PASSED [ 75%]
tests/test_stock.py::test_stock_adjustment PASSED                        [ 87%]
tests/test_stock.py::test_move_history_and_dashboard_kpis PASSED         [100%]

============================== 8 passed in 14.99s ===============================
```

### Verification Highlights
- **Inventory Balance Integrity**: Confirms internal transfers preserve global quantity while updating localized location quants.
- **Over-Shipment Defense**: Verifies that any delivery attempting to dispatch more stock than physically available at the source location is immediately blocked with HTTP 400.
- **Audit Consistency**: Verifies that all valid stock mutations generate immutable corresponding entries in `StockLedger`.

---

## 🔒 Security Practices

1. **Password Encryption**: Employs industry-standard `bcrypt` hashing with individual random salts. Plaintext passwords are never persisted.
2. **Access Token Security**: Access tokens are signed using `HS256` HMAC with a high-entropy secret key and enforced expiration timestamps.
3. **Database Constraints**: SQLite foreign keys are explicitly enforced at the engine connection level via `PRAGMA foreign_keys = ON`, guaranteeing referential integrity.
4. **CORS Hardening**: Cross-Origin Resource Sharing is configured to protect against unauthorized cross-site invocations while facilitating seamless development with frontend clients.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details. Free for commercial and private use.
