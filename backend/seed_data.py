import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.models.product import Category, Product
from app.models.warehouse import Warehouse, Location
from app.models.stock import StockQuant, StockOperation, StockMoveLine, StockLedger
from app.utils.security import hash_password

def seed_database():
    print("[*] Rebuilding & Seeding StockSense database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        now = datetime.now(timezone.utc)

        # 1. Users
        admin_user = User(
            name="Sarah Jenkins",
            email="admin@stocksense.com",
            password_hash=hash_password("Password123"),
            role="inventory_manager",
            created_at=now - timedelta(days=30)
        )
        staff_user = User(
            name="Alex Rivera",
            email="staff@stocksense.com",
            password_hash=hash_password("Password123"),
            role="warehouse_staff",
            created_at=now - timedelta(days=20)
        )
        db.add_all([admin_user, staff_user])
        db.commit()
        db.refresh(admin_user)
        db.refresh(staff_user)
        print("  [+] Users created (admin@stocksense.com / staff@stocksense.com, pw: Password123)")

        # 2. Warehouses & Locations
        wh_central = Warehouse(
            name="Central Warehouse",
            code="WH-CENTRAL",
            address="Plot 42, Logistics Park, North Zone",
            is_active=True
        )
        wh_east = Warehouse(
            name="East Coast Hub",
            code="WH-EAST",
            address="Building 7, Harbor Logistics Area",
            is_active=True
        )
        db.add_all([wh_central, wh_east])
        db.commit()
        db.refresh(wh_central)
        db.refresh(wh_east)

        loc_main = Location(warehouse_id=wh_central.id, name="Main Storage", code="WH-CENTRAL-MAIN", type="internal")
        loc_prod = Location(warehouse_id=wh_central.id, name="Production Floor", code="WH-CENTRAL-PROD", type="internal")
        loc_pack = Location(warehouse_id=wh_central.id, name="Packaging Bay", code="WH-CENTRAL-PACK", type="internal")
        loc_east_main = Location(warehouse_id=wh_east.id, name="General Shelf A", code="WH-EAST-A", type="internal")
        
        db.add_all([loc_main, loc_prod, loc_pack, loc_east_main])
        db.commit()
        db.refresh(loc_main)
        db.refresh(loc_prod)
        db.refresh(loc_pack)
        db.refresh(loc_east_main)
        print("  [+] Warehouses & Locations configured")

        # 3. Categories
        cat_raw = Category(name="Raw Materials", description="Industrial metals, plastics, and feedstocks")
        cat_elec = Category(name="Electronics", description="Sensors, PCBs, and microcontroller modules")
        cat_fin = Category(name="Finished Goods", description="Ready-to-ship assembled products")
        cat_pkg = Category(name="Packaging Supplies", description="Cardboard boxes, foam, and shipping accessories")
        db.add_all([cat_raw, cat_elec, cat_fin, cat_pkg])
        db.commit()
        db.refresh(cat_raw)
        db.refresh(cat_elec)
        db.refresh(cat_fin)
        db.refresh(cat_pkg)
        print("  [+] Categories created")

        # 4. Products
        p_steel = Product(
            name="Steel Rods 10mm",
            sku="STL-ROD-10",
            category_id=cat_raw.id,
            unit_of_measure="kg",
            reorder_level=50.0,
            reorder_qty=100.0,
            created_at=now - timedelta(days=25)
        )
        p_alu = Product(
            name="Aluminum Sheets 2x1m",
            sku="ALU-SHT-02",
            category_id=cat_raw.id,
            unit_of_measure="sheets",
            reorder_level=20.0,
            reorder_qty=50.0,
            created_at=now - timedelta(days=20)
        )
        p_iot = Product(
            name="IoT Sensor Node v2",
            sku="IOT-SEN-02",
            category_id=cat_elec.id,
            unit_of_measure="units",
            reorder_level=15.0,
            reorder_qty=30.0,
            created_at=now - timedelta(days=15)
        )
        p_chair = Product(
            name="Ergonomic Office Chair",
            sku="FURN-CHR-01",
            category_id=cat_fin.id,
            unit_of_measure="units",
            reorder_level=10.0,
            reorder_qty=20.0,
            created_at=now - timedelta(days=10)
        )
        p_box = Product(
            name="Corrugated Shipping Box L",
            sku="PKG-BOX-LRG",
            category_id=cat_pkg.id,
            unit_of_measure="pcs",
            reorder_level=100.0,
            reorder_qty=400.0,
            created_at=now - timedelta(days=8)
        )
        db.add_all([p_steel, p_alu, p_iot, p_chair, p_box])
        db.commit()
        db.refresh(p_steel)
        db.refresh(p_alu)
        db.refresh(p_iot)
        db.refresh(p_chair)
        db.refresh(p_box)
        print("  [+] Products created with SKU & reorder thresholds")

        # 5. Initial Stock Quants & Ledger Setup
        # Steel: 50 kg in Main Storage, 27 kg in Production Floor (Total = 77 kg)
        # Alu: 12 sheets in Main Storage (Low stock: 12 <= 20)
        # IoT: 85 units in Main Storage
        # Chair: 0 units (Out of stock: 0 <= 10)
        # Box: 450 pcs in Packaging Bay
        quants = [
            StockQuant(product_id=p_steel.id, location_id=loc_main.id, quantity=50.0, last_updated=now),
            StockQuant(product_id=p_steel.id, location_id=loc_prod.id, quantity=27.0, last_updated=now),
            StockQuant(product_id=p_alu.id, location_id=loc_main.id, quantity=12.0, last_updated=now),
            StockQuant(product_id=p_iot.id, location_id=loc_main.id, quantity=85.0, last_updated=now),
            StockQuant(product_id=p_chair.id, location_id=loc_main.id, quantity=0.0, last_updated=now),
            StockQuant(product_id=p_box.id, location_id=loc_pack.id, quantity=450.0, last_updated=now)
        ]
        db.add_all(quants)
        db.commit()
        print("  [+] Initial stock balances set up (including low stock & out-of-stock items for alert demo)")

        # 6. Seed Operations & Ledger reflecting the complete problem statement demo flow:
        # Step 1: Receipt 100 kg Steel from SteelCorp
        op_rec1 = StockOperation(
            reference="REC-00001",
            type="receipt",
            status="done",
            dest_location_id=loc_main.id,
            supplier_name="Global Steel Industries",
            notes="Initial shipment of raw steel rods",
            created_by=admin_user.id,
            scheduled_date=now - timedelta(days=5),
            done_date=now - timedelta(days=5),
            created_at=now - timedelta(days=5)
        )
        db.add(op_rec1)
        db.flush()
        db.add(StockMoveLine(operation_id=op_rec1.id, product_id=p_steel.id, demand_qty=100.0, done_qty=100.0))
        db.add(StockLedger(
            product_id=p_steel.id,
            location_id=loc_main.id,
            operation_id=op_rec1.id,
            move_type="receipt",
            qty_change=100.0,
            qty_after=100.0,
            timestamp=now - timedelta(days=5),
            remarks="Receipt REC-00001 from Global Steel Industries"
        ))

        # Step 2: Internal Transfer 30 kg Steel from Main Storage to Production Floor
        op_trf1 = StockOperation(
            reference="TRF-00001",
            type="internal",
            status="done",
            source_location_id=loc_main.id,
            dest_location_id=loc_prod.id,
            notes="Transfer raw rods to cutting line",
            created_by=staff_user.id,
            scheduled_date=now - timedelta(days=3),
            done_date=now - timedelta(days=3),
            created_at=now - timedelta(days=3)
        )
        db.add(op_trf1)
        db.flush()
        db.add(StockMoveLine(operation_id=op_trf1.id, product_id=p_steel.id, demand_qty=30.0, done_qty=30.0))
        db.add(StockLedger(
            product_id=p_steel.id,
            location_id=loc_main.id,
            operation_id=op_trf1.id,
            move_type="transfer_out",
            qty_change=-30.0,
            qty_after=70.0,
            timestamp=now - timedelta(days=3),
            remarks="Internal transfer TRF-00001 to Production Floor"
        ))
        db.add(StockLedger(
            product_id=p_steel.id,
            location_id=loc_prod.id,
            operation_id=op_trf1.id,
            move_type="transfer_in",
            qty_change=30.0,
            qty_after=30.0,
            timestamp=now - timedelta(days=3),
            remarks="Internal transfer TRF-00001 from Main Storage"
        ))

        # Step 3: Delivery 20 kg Steel from Main Storage
        op_del1 = StockOperation(
            reference="DEL-00001",
            type="delivery",
            status="done",
            source_location_id=loc_main.id,
            notes="Customer order for steel sample batch",
            created_by=admin_user.id,
            scheduled_date=now - timedelta(days=2),
            done_date=now - timedelta(days=2),
            created_at=now - timedelta(days=2)
        )
        db.add(op_del1)
        db.flush()
        db.add(StockMoveLine(operation_id=op_del1.id, product_id=p_steel.id, demand_qty=20.0, done_qty=20.0))
        db.add(StockLedger(
            product_id=p_steel.id,
            location_id=loc_main.id,
            operation_id=op_del1.id,
            move_type="delivery",
            qty_change=-20.0,
            qty_after=50.0,
            timestamp=now - timedelta(days=2),
            remarks="Delivery order DEL-00001 shipped"
        ))

        # Step 4: Adjustment - 3 kg damaged steel at Production Floor
        op_adj1 = StockOperation(
            reference="ADJ-00001",
            type="adjustment",
            status="done",
            dest_location_id=loc_prod.id,
            notes="Damaged steel rods bent during tooling setup",
            created_by=staff_user.id,
            scheduled_date=now - timedelta(days=1),
            done_date=now - timedelta(days=1),
            created_at=now - timedelta(days=1)
        )
        db.add(op_adj1)
        db.flush()
        db.add(StockMoveLine(operation_id=op_adj1.id, product_id=p_steel.id, demand_qty=30.0, done_qty=27.0))
        db.add(StockLedger(
            product_id=p_steel.id,
            location_id=loc_prod.id,
            operation_id=op_adj1.id,
            move_type="adjustment",
            qty_change=-3.0,
            qty_after=27.0,
            timestamp=now - timedelta(days=1),
            remarks="Stock adjustment ADJ-00001: counted 27.0, recorded 30.0 (diff -3.00)"
        ))

        # Additional live pending operations for video recording demo:
        # 1. Receipt in "waiting" state (ready for 1-click "Validate")
        op_rec2 = StockOperation(
            reference="REC-00002",
            type="receipt",
            status="waiting",
            dest_location_id=loc_main.id,
            supplier_name="Apex Micro Systems",
            notes="Inbound electronics shipment verified at dock",
            created_by=admin_user.id,
            scheduled_date=now + timedelta(days=1),
            created_at=now - timedelta(hours=4)
        )
        db.add(op_rec2)
        db.flush()
        db.add(StockMoveLine(operation_id=op_rec2.id, product_id=p_iot.id, demand_qty=50.0, done_qty=50.0))

        # 2. Receipt in "draft" state
        op_rec3 = StockOperation(
            reference="REC-00003",
            type="receipt",
            status="draft",
            dest_location_id=loc_main.id,
            supplier_name="Northern Industrial Supplies",
            notes="Scheduled raw steel shipment awaiting delivery",
            created_by=admin_user.id,
            scheduled_date=now + timedelta(days=2),
            created_at=now - timedelta(hours=2)
        )
        db.add(op_rec3)
        db.flush()
        db.add(StockMoveLine(operation_id=op_rec3.id, product_id=p_steel.id, demand_qty=80.0, done_qty=0.0))

        # 3. Delivery in "draft" state (ready for "Pick" -> waiting)
        op_del_draft = StockOperation(
            reference="DEL-00002",
            type="delivery",
            status="draft",
            source_location_id=loc_main.id,
            notes="TechPark Inc. - Priority Electronics Batch",
            created_by=admin_user.id,
            scheduled_date=now + timedelta(hours=4),
            created_at=now - timedelta(hours=3)
        )
        db.add(op_del_draft)
        db.flush()
        db.add(StockMoveLine(operation_id=op_del_draft.id, product_id=p_iot.id, demand_qty=10.0, done_qty=0.0))

        # 4. Delivery in "waiting" state (ready for "Pack" -> ready)
        op_del_waiting = StockOperation(
            reference="DEL-00003",
            type="delivery",
            status="waiting",
            source_location_id=loc_main.id,
            notes="Metro Builders - Heavy Construction Order",
            created_by=staff_user.id,
            scheduled_date=now + timedelta(hours=3),
            created_at=now - timedelta(hours=5)
        )
        db.add(op_del_waiting)
        db.flush()
        db.add(StockMoveLine(operation_id=op_del_waiting.id, product_id=p_steel.id, demand_qty=15.0, done_qty=15.0))

        # 5. Delivery in "ready" state (ready for "Validate & Ship" -> done)
        op_del_ready = StockOperation(
            reference="DEL-00004",
            type="delivery",
            status="ready",
            source_location_id=loc_pack.id,
            notes="Swift Delivery Hub - Packaged Shipping Containers",
            created_by=staff_user.id,
            scheduled_date=now + timedelta(hours=1),
            created_at=now - timedelta(hours=6)
        )
        db.add(op_del_ready)
        db.flush()
        db.add(StockMoveLine(operation_id=op_del_ready.id, product_id=p_box.id, demand_qty=50.0, done_qty=50.0))

        # 6. Scheduled internal transfer in "waiting" state
        op_trf2 = StockOperation(
            reference="TRF-00002",
            type="internal",
            status="waiting",
            source_location_id=loc_pack.id,
            dest_location_id=loc_east_main.id,
            notes="Inter-warehouse stock replenishment",
            created_by=admin_user.id,
            scheduled_date=now + timedelta(days=2),
            created_at=now - timedelta(hours=2)
        )
        db.add(op_trf2)
        db.flush()
        db.add(StockMoveLine(operation_id=op_trf2.id, product_id=p_box.id, demand_qty=100.0, done_qty=0.0))

        db.commit()
        print("  [+] Full operation history & pending demo flows populated in Stock Ledger")
        print("\n[SUCCESS] Seed data populated successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
