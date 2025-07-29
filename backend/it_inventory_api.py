from flask import Blueprint, request, jsonify
from flask_cors import CORS
import pyodbc
import os
from dotenv import load_dotenv
from datetime import datetime

it_inventory_api = Blueprint('it_inventory_api', __name__)
load_dotenv()

def get_connection():
    return pyodbc.connect(
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={os.getenv('AZURE_SQL_SERVER')};"
        f"DATABASE={os.getenv('AZURE_SQL_DB')};"
        f"UID={os.getenv('AZURE_SQL_USER')};"
        f"PWD={os.getenv('AZURE_SQL_PASSWORD')};"
        "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    )

@it_inventory_api.route('/api/it-inventory', methods=['GET'])
def get_all_inventory():
    """Get all IT inventory items"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Query based on your actual table structure
        query = """
            SELECT 
                ItemID,
                Category,
                BrandModel,
                TotalQty,
                Assigned,
                Available,
                StockLevel,
                Location,
                UnitCost,
                Maintenance,
                Retired
            FROM dbo.InventoryItems
            ORDER BY ItemID
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        inventory = []
        for row in rows:
            # Split BrandModel into brand and model
            brand_model = row[2] or ""
            brand, model = "", ""
            if " - " in brand_model:
                parts = brand_model.split(" - ", 1)
                brand = parts[0]
                model = parts[1]
            elif " " in brand_model:
                parts = brand_model.split(" ", 1)
                brand = parts[0]
                model = parts[1]
            else:
                brand = brand_model
                model = ""
            
            # Determine status based on stock level and quantities
            total_qty = row[3] or 0
            available = row[5] or 0
            stock_level = row[6] or ""
            
            if stock_level == "Low Stock":
                status = "Low Stock"
            elif available == 0:
                status = "Out of Stock"
            elif total_qty > 0:
                status = "In Stock"
            else:
                status = "Unknown"
            
            # Calculate unit price and total value
            unit_cost = float(row[8] or 0)
            total_value = unit_cost * total_qty
            
            inventory.append({
                "id": row[0],
                "name": brand_model,  # Use full brand model as name
                "category": row[1] or "",
                "brand": brand,
                "model": model,
                "quantity": total_qty,
                "available": available,
                "allocated": (row[4] or 0),  # Assigned
                "unitPrice": unit_cost,
                "totalValue": total_value,
                "supplier": "",  # Not in your schema
                "location": row[7] or "",
                "reorderLevel": 5,  # Default, you may want to add this column
                "status": status
            })
        
        cursor.close()
        conn.close()
        return jsonify(inventory)
        
    except Exception as e:
        print("Error fetching inventory:", str(e))
        return jsonify({"error": "Failed to fetch inventory"}), 500

@it_inventory_api.route('/api/it-inventory', methods=['POST'])
def add_inventory_item():
    """Add a new inventory item"""
    try:
        data = request.get_json()
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get next ItemID
        cursor.execute("SELECT MAX(CAST(SUBSTRING(ItemID, 5, LEN(ItemID)) AS INT)) FROM dbo.InventoryItems WHERE ItemID LIKE 'INV-%'")
        result = cursor.fetchone()
        next_num = (result[0] or 0) + 1
        item_id = f"INV-{next_num:03d}"
        
        # Combine brand and model for BrandModel field
        brand_model = f"{data.get('brand', '')} - {data.get('model', '')}".strip(" - ")
        if not brand_model:
            brand_model = data.get('name', '')
        
        quantity = int(data.get('quantity', 0))
        available = int(data.get('available', quantity))
        assigned = quantity - available
        unit_cost = float(data.get('unitPrice', 0))
        
        # Determine stock level
        stock_level = "Medium Stock"  # Default
        if quantity <= 5:
            stock_level = "Low Stock"
        elif quantity >= 20:
            stock_level = "High Stock"
        
        cursor.execute("""
            INSERT INTO dbo.InventoryItems 
            (ItemID, Category, BrandModel, TotalQty, Assigned, Available, StockLevel, Location, UnitCost, Maintenance, Retired)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            item_id,
            data.get('category', ''),
            brand_model,
            quantity,
            assigned,
            available,
            stock_level,
            data.get('location', ''),
            unit_cost,
            0,  # Maintenance count
            0   # Retired count
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Inventory item added successfully", "itemId": item_id}), 201
        
    except Exception as e:
        print("Error adding inventory item:", str(e))
        return jsonify({"error": "Failed to add inventory item"}), 500

@it_inventory_api.route('/api/it-inventory/<item_id>', methods=['PUT'])
def update_inventory_item(item_id):
    """Update an existing inventory item"""
    try:
        data = request.get_json()
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Combine brand and model for BrandModel field
        brand_model = f"{data.get('brand', '')} - {data.get('model', '')}".strip(" - ")
        if not brand_model:
            brand_model = data.get('name', '')
        
        quantity = int(data.get('quantity', 0))
        available = int(data.get('available', 0))
        assigned = quantity - available
        unit_cost = float(data.get('unitPrice', 0))
        
        # Determine stock level
        stock_level = "Medium Stock"  # Default
        if quantity <= 5:
            stock_level = "Low Stock"
        elif quantity >= 20:
            stock_level = "High Stock"
        
        cursor.execute("""
            UPDATE dbo.InventoryItems SET
                Category = ?,
                BrandModel = ?,
                TotalQty = ?,
                Assigned = ?,
                Available = ?,
                StockLevel = ?,
                Location = ?,
                UnitCost = ?
            WHERE ItemID = ?
        """, (
            data.get('category', ''),
            brand_model,
            quantity,
            assigned,
            available,
            stock_level,
            data.get('location', ''),
            unit_cost,
            item_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Inventory item updated successfully"})
        
    except Exception as e:
        print("Error updating inventory item:", str(e))
        return jsonify({"error": "Failed to update inventory item"}), 500

@it_inventory_api.route('/api/it-inventory/<item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    """Delete an inventory item"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM dbo.InventoryItems WHERE ItemID = ?", (item_id,))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Inventory item not found"}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Inventory item deleted successfully"})
        
    except Exception as e:
        print("Error deleting inventory item:", str(e))
        return jsonify({"error": "Failed to delete inventory item"}), 500

@it_inventory_api.route('/api/it-inventory/stats', methods=['GET'])
def get_inventory_stats():
    """Get inventory statistics for dashboard"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get total items
        cursor.execute("SELECT SUM(TotalQty) FROM dbo.InventoryItems")
        total_items = cursor.fetchone()[0] or 0
        
        # Get total value (calculate from unit cost * quantity)
        cursor.execute("SELECT SUM(TotalQty * UnitCost) FROM dbo.InventoryItems")
        total_value = cursor.fetchone()[0] or 0
        
        # Get low stock items
        cursor.execute("SELECT COUNT(*) FROM dbo.InventoryItems WHERE StockLevel = 'Low Stock'")
        low_stock_items = cursor.fetchone()[0] or 0
        
        # Get out of stock items (available = 0)
        cursor.execute("SELECT COUNT(*) FROM dbo.InventoryItems WHERE Available = 0")
        out_of_stock_items = cursor.fetchone()[0] or 0
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "totalItems": total_items,
            "totalValue": float(total_value),
            "lowStockItems": low_stock_items,
            "outOfStockItems": out_of_stock_items
        })
        
    except Exception as e:
        print("Error fetching inventory stats:", str(e))
        return jsonify({"error": "Failed to fetch inventory statistics"}), 500

@it_inventory_api.route('/api/it-inventory/order', methods=['POST'])
def order_inventory_item():
    """Place an order for inventory item"""
    try:
        data = request.get_json()
        item_id = data.get('itemId')
        order_quantity = data.get('quantity', 1)
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # For now, just update stock level to indicate order placed
        # You could create an Orders table for more detailed tracking
        cursor.execute("""
            UPDATE dbo.InventoryItems SET
                StockLevel = 'Ordered'
            WHERE ItemID = ?
        """, (item_id,))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Inventory item not found"}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Order placed successfully"})
        
    except Exception as e:
        print("Error placing order:", str(e))
        return jsonify({"error": "Failed to place order"}), 500

@it_inventory_api.route('/api/it-inventory/categories', methods=['GET'])
def get_inventory_categories():
    """Get inventory analytics by category"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                Category,
                SUM(TotalQty) as TotalQuantity,
                SUM(Available) as TotalAvailable,
                SUM(Assigned) as TotalAllocated,
                SUM(TotalQty * UnitCost) as TotalValue,
                COUNT(CASE WHEN StockLevel = 'Low Stock' THEN 1 END) as LowStockCount
            FROM dbo.InventoryItems
            GROUP BY Category
            ORDER BY Category
        """)
        
        rows = cursor.fetchall()
        categories = []
        
        for row in rows:
            total_quantity = row[1] or 0
            total_allocated = row[3] or 0
            utilization_rate = (total_allocated / total_quantity * 100) if total_quantity > 0 else 0
            
            categories.append({
                "category": row[0],
                "totalQuantity": total_quantity,
                "available": row[2] or 0,
                "allocated": total_allocated,
                "totalValue": float(row[4] or 0),
                "lowStockCount": row[5] or 0,
                "utilizationRate": utilization_rate
            })
        
        cursor.close()
        conn.close()
        
        return jsonify(categories)
        
    except Exception as e:
        print("Error fetching category analytics:", str(e))
        return jsonify({"error": "Failed to fetch category analytics"}), 500