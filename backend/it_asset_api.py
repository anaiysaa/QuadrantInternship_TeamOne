from flask import Blueprint, request, jsonify
from flask_cors import CORS
import pyodbc
import os
from dotenv import load_dotenv
from datetime import datetime

it_asset_api = Blueprint('it_asset_api', __name__)
load_dotenv()

def get_connection():
    # Use Azure SQL connection since that's what you have in your .env
    return pyodbc.connect(
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={os.getenv('AZURE_SQL_SERVER')};"
        f"DATABASE={os.getenv('AZURE_SQL_DB')};"
        f"UID={os.getenv('AZURE_SQL_USER')};"
        f"PWD={os.getenv('AZURE_SQL_PASSWORD')};"
        "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
    )

@it_asset_api.route('/api/it-assets', methods=['GET'])
def get_all_assets():
    """Get all IT assets with employee information"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Join IT_Assets with Employees to get employee details
        query = """
    SELECT 
        a.AssetID,
        e.Name as EmployeeName,
        a.Department,
        a.AssetType,
        a.BrandModel,
        a.SerialNumber,
        a.Status,
        a.Condition,
        a.Location,
        a.EmployeeID,
        a.DateAssigned
    FROM dbo.IT_Assets a
    LEFT JOIN dbo.Employees e ON a.EmployeeID = e.ID
    ORDER BY a.AssetID
"""
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        assets = []
        for row in rows:
            # Split BrandModel if it contains both brand and model
            brand_model = row[4] or ""
            brand, model = "", ""
            if " " in brand_model:
                parts = brand_model.split(" ", 1)
                brand = parts[0]
                model = parts[1]
            else:
                brand = brand_model
                model = ""
            
            assets.append({
                "id": row[0],
                "employee": row[1] or "Unassigned",
                "department": row[2] or "N/A",
                "assetType": row[3] or "",
                "brand": brand,
                "model": model,
                "serialNumber": row[5] or "",
                "DateAssigned": row[10].strftime("%Y-%m-%d") if row[10] else None,
                "status": row[6] or "Unknown",
                "condition": row[7] or "Unknown",
                "location": row[8] or "",
                "employeeId": row[9]
            })
        
        cursor.close()
        conn.close()
        return jsonify(assets)
        
    except Exception as e:
        print("Error fetching assets:", str(e))
        return jsonify({"error": "Failed to fetch assets"}), 500

@it_asset_api.route('/api/it-assets', methods=['POST'])
def add_asset():
    """Add a new IT asset"""
    try:
        data = request.get_json()
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get next AssetID (or use auto-increment if available)
        cursor.execute("SELECT MAX(CAST(SUBSTRING(AssetID, 5, LEN(AssetID)) AS INT)) FROM dbo.IT_Assets WHERE AssetID LIKE 'AST-%'")
        result = cursor.fetchone()
        next_num = (result[0] or 0) + 1
        asset_id = f"AST-{next_num:03d}"
        
        # Combine brand and model for BrandModel field
        brand_model = f"{data.get('brand', '')} {data.get('model', '')}".strip()
        
        # Find employee ID if employee name is provided
        employee_id = None
        if data.get('employeeName'):
            cursor.execute("SELECT ID FROM dbo.Employees WHERE Name = ?", (data['employeeName'],))
            emp_result = cursor.fetchone()
            if emp_result:
                employee_id = emp_result[0]
        
        cursor.execute("""
            INSERT INTO dbo.IT_Assets 
            (AssetID, EmployeeID, Department, AssetType, BrandModel, SerialNumber, Status, Condition, Location, DateAssigned)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            asset_id,
            employee_id,
            data.get('department', ''),
            data.get('assetType', ''),
            brand_model,
            data.get('serialNumber', ''),
            data.get('status', 'Active'),
            data.get('condition', 'Good'),
            data.get('location', ''),
            datetime.now()  # or parse from frontend: datetime.strptime(data['DateAssigned'], '%Y-%m-%d')
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Asset added successfully", "assetId": asset_id}), 201
        
    except Exception as e:
        print("Error adding asset:", str(e))
        return jsonify({"error": "Failed to add asset"}), 500

@it_asset_api.route('/api/it-assets/<asset_id>', methods=['PUT'])
def update_asset(asset_id):
    """Update an existing IT asset"""
    try:
        data = request.get_json()
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Combine brand and model for BrandModel field
        brand_model = f"{data.get('brand', '')} {data.get('model', '')}".strip()
        
        # Find employee ID if employee name is provided
        employee_id = None
        if data.get('employeeName'):
            cursor.execute("SELECT ID FROM dbo.Employees WHERE Name = ?", (data['employeeName'],))
            emp_result = cursor.fetchone()
            if emp_result:
                employee_id = emp_result[0]
        
        cursor.execute("""
            UPDATE dbo.IT_Assets SET
                EmployeeID = ?,
                Department = ?,
                AssetType = ?,
                BrandModel = ?,
                SerialNumber = ?,
                Status = ?,
                Condition = ?,
                Location = ?
            WHERE AssetID = ?
        """, (
            employee_id,
            data.get('department', ''),
            data.get('assetType', ''),
            brand_model,
            data.get('serialNumber', ''),
            data.get('status', 'Active'),
            data.get('condition', 'Good'),
            data.get('location', ''),
            asset_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Asset updated successfully"})
        
    except Exception as e:
        print("Error updating asset:", str(e))
        return jsonify({"error": "Failed to update asset"}), 500

@it_asset_api.route('/api/it-assets/<asset_id>', methods=['DELETE'])
def delete_asset(asset_id):
    """Delete an IT asset"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM dbo.IT_Assets WHERE AssetID = ?", (asset_id,))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Asset not found"}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Asset deleted successfully"})
        
    except Exception as e:
        print("Error deleting asset:", str(e))
        return jsonify({"error": "Failed to delete asset"}), 500

@it_asset_api.route('/api/it-assets/transfer', methods=['POST'])
def transfer_asset():
    """Transfer an asset to another employee"""
    try:
        data = request.get_json()
        asset_id = data.get('assetId')
        new_employee_name = data.get('newEmployee')
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Find new employee ID
        cursor.execute("SELECT ID FROM dbo.Employees WHERE Name = ?", (new_employee_name,))
        emp_result = cursor.fetchone()
        
        if not emp_result:
            return jsonify({"error": "Employee not found"}), 404
        
        new_employee_id = emp_result[0]
        
        # Update asset with new employee
        cursor.execute("""
            UPDATE dbo.IT_Assets SET
                EmployeeID = ?,
                Location = ?
            WHERE AssetID = ?
        """, (
            new_employee_id,
            data.get('newLocation', ''),
            asset_id
        ))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Asset not found"}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Asset transferred successfully"})
        
    except Exception as e:
        print("Error transferring asset:", str(e))
        return jsonify({"error": "Failed to transfer asset"}), 500

@it_asset_api.route('/api/it-assets/stats', methods=['GET'])
def get_asset_stats():
    """Get asset statistics for dashboard"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get total assets
        cursor.execute("SELECT COUNT(*) FROM dbo.IT_Assets")
        total_assets = cursor.fetchone()[0]
        
        # Get active assets
        cursor.execute("SELECT COUNT(*) FROM dbo.IT_Assets WHERE Status = 'Active'")
        active_assets = cursor.fetchone()[0]
        
        # Get assets in maintenance
        cursor.execute("SELECT COUNT(*) FROM dbo.IT_Assets WHERE Status = 'Maintenance'")
        maintenance_assets = cursor.fetchone()[0]
        
        # Get number of employees with assets
        cursor.execute("SELECT COUNT(DISTINCT EmployeeID) FROM dbo.IT_Assets WHERE EmployeeID IS NOT NULL")
        employees_with_assets = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "totalAssets": total_assets,
            "activeAssets": active_assets,
            "maintenanceAssets": maintenance_assets,
            "employeesWithAssets": employees_with_assets
        })
        
    except Exception as e:
        print("Error fetching stats:", str(e))
        return jsonify({"error": "Failed to fetch statistics"}), 500

@it_asset_api.route('/api/employees/search', methods=['GET'])
def search_employees():
    """Search employees for asset assignment"""
    try:
        search_term = request.args.get('q', '')
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT ID, Name, Department 
            FROM dbo.Employees 
            WHERE Name LIKE ? OR Department LIKE ?
            ORDER BY Name
        """, (f"%{search_term}%", f"%{search_term}%"))
        
        rows = cursor.fetchall()
        employees = []
        
        for row in rows:
            employees.append({
                "id": row[0],
                "name": row[1],
                "department": row[2]
            })
        
        cursor.close()
        conn.close()
        
        return jsonify(employees)
        
    except Exception as e:
        print("Error searching employees:", str(e))
        return jsonify({"error": "Failed to search employees"}), 500