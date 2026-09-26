import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.warehouse import Warehouse, Location
from app.models.product import Category, Product
from app.models.stock import StockQuant, StockOperation, StockLedger

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def get_auth_token():
    # Login or create test user
    resp = client.post("/api/auth/login", json={
        "email": "admin@stocksense.com",
        "password": "Password123"
    })
    if resp.status_code == 200:
        return resp.json()["token"]
    
    # Otherwise signup
    signup_resp = client.post("/api/auth/signup", json={
        "name": "Test Manager",
        "email": "testmgr@stocksense.com",
        "password": "Password123",
        "role": "inventory_manager"
    })
    return signup_resp.json()["token"]

def test_auth_login():
    resp = client.post("/api/auth/login", json={
        "email": "admin@stocksense.com",
        "password": "Password123"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert data["user"]["role"] in ["inventory_manager", "warehouse_staff"]

def test_product_creation_and_search():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch existing or create product
    resp = client.get("/api/products?search=STL-ROD-10")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) >= 1
    assert items[0]["sku"] == "STL-ROD-10"

def test_receipt_increases_stock():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Get a product and location
    prod = client.get("/api/products?search=STL-ROD-10").json()[0]
    locs = client.get("/api/locations").json()
    assert len(locs) > 0
    target_loc = locs[0]

    initial_stock = prod["total_stock"]

    # Create and validate receipt
    rec_resp = client.post("/api/receipts", json={
        "supplier_name": "Test Metals",
        "dest_location_id": target_loc["id"],
        "lines": [{"product_id": prod["id"], "demand_qty": 25.0}]
    }, headers=headers)
    assert rec_resp.status_code == 201
    rec_id = rec_resp.json()["id"]

    val_resp = client.post(f"/api/receipts/{rec_id}/validate", headers=headers)
    assert val_resp.status_code == 200
    assert val_resp.json()["status"] == "done"

    # Verify stock increased by 25
    after_prod = client.get(f"/api/products/{prod['id']}").json()
    assert after_prod["total_stock"] == initial_stock + 25.0

def test_delivery_decreases_stock():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    prod = client.get("/api/products?search=STL-ROD-10").json()[0]
    locs = client.get(f"/api/products/{prod['id']}/stock").json()
    loc_with_stock = next(l for l in locs if l["quantity"] >= 10.0)

    initial_stock = prod["total_stock"]

    # Delivery workflow: draft -> pick -> pack -> validate
    del_resp = client.post("/api/deliveries", json={
        "source_location_id": loc_with_stock["location_id"],
        "lines": [{"product_id": prod["id"], "demand_qty": 10.0}]
    }, headers=headers)
    assert del_resp.status_code == 201
    del_id = del_resp.json()["id"]

    pick_resp = client.post(f"/api/deliveries/{del_id}/pick", headers=headers)
    assert pick_resp.json()["status"] == "waiting"

    pack_resp = client.post(f"/api/deliveries/{del_id}/pack", headers=headers)
    assert pack_resp.json()["status"] == "ready"

    val_resp = client.post(f"/api/deliveries/{del_id}/validate", headers=headers)
    assert val_resp.status_code == 200
    assert val_resp.json()["status"] == "done"

    # Verify stock decreased by 10
    after_prod = client.get(f"/api/products/{prod['id']}").json()
    assert after_prod["total_stock"] == initial_stock - 10.0

def test_delivery_rejects_insufficient_stock():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    prod = client.get("/api/products?search=STL-ROD-10").json()[0]
    locs = client.get(f"/api/products/{prod['id']}/stock").json()
    source_loc_id = locs[0]["location_id"]

    del_resp = client.post("/api/deliveries", json={
        "source_location_id": source_loc_id,
        "lines": [{"product_id": prod["id"], "demand_qty": 99999.0}]
    }, headers=headers)
    del_id = del_resp.json()["id"]

    val_resp = client.post(f"/api/deliveries/{del_id}/validate", headers=headers)
    assert val_resp.status_code == 400
    assert "Insufficient stock" in val_resp.json()["detail"]

def test_internal_transfer_maintains_total_stock():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    prod = client.get("/api/products?search=STL-ROD-10").json()[0]
    all_locs = client.get("/api/locations").json()
    assert len(all_locs) >= 2
    src_loc = all_locs[0]
    dst_loc = all_locs[1]

    initial_total_stock = prod["total_stock"]

    # Transfer 5 units
    trf_resp = client.post("/api/transfers", json={
        "source_location_id": src_loc["id"],
        "dest_location_id": dst_loc["id"],
        "lines": [{"product_id": prod["id"], "demand_qty": 5.0}]
    }, headers=headers)
    assert trf_resp.status_code == 201
    trf_id = trf_resp.json()["id"]

    val_resp = client.post(f"/api/transfers/{trf_id}/validate", headers=headers)
    assert val_resp.status_code == 200
    assert val_resp.json()["status"] == "done"

    # Total stock across system must be identical
    after_prod = client.get(f"/api/products/{prod['id']}").json()
    assert after_prod["total_stock"] == initial_total_stock

def test_stock_adjustment():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}

    prod = client.get("/api/products?search=STL-ROD-10").json()[0]
    locs = client.get("/api/locations").json()
    loc = locs[0]

    # Adjust stock to exactly 88 units
    adj_resp = client.post("/api/adjustments", json={
        "location_id": loc["id"],
        "notes": "Physical cycle count verification",
        "lines": [{"product_id": prod["id"], "counted_qty": 88.0}]
    }, headers=headers)
    assert adj_resp.status_code == 201
    adj_id = adj_resp.json()["id"]

    val_resp = client.post(f"/api/adjustments/{adj_id}/validate", headers=headers)
    assert val_resp.status_code == 200
    assert val_resp.json()["status"] == "done"

    # Verify quant is now 88
    stock_breakdown = client.get(f"/api/products/{prod['id']}/stock").json()
    adjusted_loc = next(l for l in stock_breakdown if l["location_id"] == loc["id"])
    assert adjusted_loc["quantity"] == 88.0

def test_move_history_and_dashboard_kpis():
    # Verify move history
    moves = client.get("/api/moves").json()
    assert len(moves) > 0
    first_move = moves[0]
    assert "qty_change" in first_move
    assert "qty_after" in first_move
    assert "move_type" in first_move

    # Verify dashboard KPIs
    kpis = client.get("/api/dashboard/kpis").json()
    assert kpis["total_products"] > 0
    assert "low_stock_count" in kpis
    assert "pending_receipts" in kpis
    assert "pending_deliveries" in kpis
