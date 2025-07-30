from flask import Blueprint, request, jsonify
from flask_cors import CORS
import pyodbc
import os
from dotenv import load_dotenv
from datetime import datetime, date

software_center_api = Blueprint('software_center_api', __name__)
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

@software_center_api.route('/api/software-licenses', methods=['GET'])
def get_all_software_licenses():
    """Get all software licenses"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT 
                LicenseID,
                SoftwareName,
                Vendor,
                Category,
                LicenseType,
                TotalLicenses,
                UsedLicenses,
                AvailableLicenses,
                ExpiryDate,
                MonthlyCost,
                Status
            FROM dbo.SoftwareLicenses
            ORDER BY LicenseID
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        licenses = []
        for row in rows:
            # Calculate cost per license
            total_licenses = row[5] or 1
            monthly_cost = float(row[9] or 0)
            cost_per_license = monthly_cost / total_licenses if total_licenses > 0 else 0
            
            # Determine status based on expiry date if status is not set
            status = row[10] or "Active"
            expiry_date = row[8]
            if expiry_date:
                days_until_expiry = (expiry_date - date.today()).days
                if days_until_expiry <= 30 and status == "Active":
                    status = "Expiring Soon"
                elif days_until_expiry < 0:
                    status = "Expired"
            
            licenses.append({
                "id": row[0],
                "name": row[1] or "",
                "vendor": row[2] or "",
                "category": row[3] or "",
                "licenseType": row[4] or "",
                "totalLicenses": row[5] or 0,
                "usedLicenses": row[6] or 0,
                "availableLicenses": row[7] or 0,
                "expiryDate": row[8].strftime('%Y-%m-%d') if row[8] else "",
                "costPerLicense": round(cost_per_license, 2),
                "totalCost": monthly_cost,
                "status": status,
                "manager": "IT Department",  # Default, you may want to add this field
                "notes": ""  # Default, you may want to add this field
            })
        
        cursor.close()
        conn.close()
        return jsonify(licenses)
        
    except Exception as e:
        print("Error fetching software licenses:", str(e))
        return jsonify({"error": "Failed to fetch software licenses"}), 500

@software_center_api.route('/api/software-licenses', methods=['POST'])
def add_software_license():
    """Add a new software license"""
    try:
        data = request.get_json()
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get next LicenseID
        cursor.execute("SELECT MAX(LicenseID) FROM dbo.SoftwareLicenses")
        result = cursor.fetchone()
        next_id = (result[0] or 0) + 1
        
        total_licenses = int(data.get('totalLicenses', 0))
        used_licenses = int(data.get('usedLicenses', 0))
        available_licenses = total_licenses - used_licenses
        
        cursor.execute("""
            INSERT INTO dbo.SoftwareLicenses 
            (LicenseID, SoftwareName, Vendor, Category, LicenseType, TotalLicenses, 
             UsedLicenses, AvailableLicenses, ExpiryDate, MonthlyCost, Status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            next_id,
            data.get('name', ''),
            data.get('vendor', ''),
            data.get('category', ''),
            data.get('licenseType', ''),
            total_licenses,
            used_licenses,
            available_licenses,
            data.get('expiryDate') if data.get('expiryDate') else None,
            float(data.get('totalCost', 0)),
            data.get('status', 'Active')
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Software license added successfully", "licenseId": next_id}), 201
        
    except Exception as e:
        print("Error adding software license:", str(e))
        return jsonify({"error": "Failed to add software license"}), 500

@software_center_api.route('/api/software-licenses/<int:license_id>', methods=['PUT'])
def update_software_license(license_id):
    """Update an existing software license"""
    try:
        data = request.get_json()
        
        conn = get_connection()
        cursor = conn.cursor()
        
        total_licenses = int(data.get('totalLicenses', 0))
        used_licenses = int(data.get('usedLicenses', 0))
        available_licenses = total_licenses - used_licenses
        
        cursor.execute("""
            UPDATE dbo.SoftwareLicenses SET
                SoftwareName = ?,
                Vendor = ?,
                Category = ?,
                LicenseType = ?,
                TotalLicenses = ?,
                UsedLicenses = ?,
                AvailableLicenses = ?,
                ExpiryDate = ?,
                MonthlyCost = ?,
                Status = ?
            WHERE LicenseID = ?
        """, (
            data.get('name', ''),
            data.get('vendor', ''),
            data.get('category', ''),
            data.get('licenseType', ''),
            total_licenses,
            used_licenses,
            available_licenses,
            data.get('expiryDate') if data.get('expiryDate') else None,
            float(data.get('totalCost', 0)),
            data.get('status', 'Active'),
            license_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Software license updated successfully"})
        
    except Exception as e:
        print("Error updating software license:", str(e))
        return jsonify({"error": "Failed to update software license"}), 500

@software_center_api.route('/api/software-licenses/<int:license_id>', methods=['DELETE'])
def delete_software_license(license_id):
    """Delete a software license"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM dbo.SoftwareLicenses WHERE LicenseID = ?", (license_id,))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Software license not found"}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Software license deleted successfully"})
        
    except Exception as e:
        print("Error deleting software license:", str(e))
        return jsonify({"error": "Failed to delete software license"}), 500

@software_center_api.route('/api/software-licenses/stats', methods=['GET'])
def get_software_stats():
    """Get software license statistics for dashboard"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        # Get total licenses
        cursor.execute("SELECT SUM(TotalLicenses) FROM dbo.SoftwareLicenses")
        total_licenses = cursor.fetchone()[0] or 0
        
        # Get used licenses
        cursor.execute("SELECT SUM(UsedLicenses) FROM dbo.SoftwareLicenses")
        total_used = cursor.fetchone()[0] or 0
        
        # Get total monthly cost
        cursor.execute("SELECT SUM(MonthlyCost) FROM dbo.SoftwareLicenses")
        total_cost = cursor.fetchone()[0] or 0
        
        # Get expiring soon count (within 30 days)
        cursor.execute("""
            SELECT COUNT(*) FROM dbo.SoftwareLicenses 
            WHERE ExpiryDate <= DATEADD(day, 30, GETDATE()) AND ExpiryDate >= GETDATE()
        """)
        expiring_soon = cursor.fetchone()[0] or 0
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "totalLicenses": total_licenses,
            "totalUsed": total_used,
            "totalCost": float(total_cost),
            "expiringSoon": expiring_soon
        })
        
    except Exception as e:
        print("Error fetching software stats:", str(e))
        return jsonify({"error": "Failed to fetch software statistics"}), 500

@software_center_api.route('/api/software-licenses/renew', methods=['POST'])
def renew_software_license():
    """Renew a software license"""
    try:
        data = request.get_json()
        license_id = data.get('licenseId')
        new_expiry_date = data.get('newExpiryDate')
        
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE dbo.SoftwareLicenses SET
                ExpiryDate = ?,
                Status = 'Active'
            WHERE LicenseID = ?
        """, (new_expiry_date, license_id))
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Software license not found"}), 404
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Software license renewed successfully"})
        
    except Exception as e:
        print("Error renewing software license:", str(e))
        return jsonify({"error": "Failed to renew software license"}), 500

@software_center_api.route('/api/software-licenses/categories', methods=['GET'])
def get_software_categories():
    """Get software license analytics by category"""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                Category,
                SUM(TotalLicenses) as TotalLicenses,
                SUM(UsedLicenses) as UsedLicenses,
                SUM(AvailableLicenses) as AvailableLicenses,
                SUM(MonthlyCost) as MonthlyCost
            FROM dbo.SoftwareLicenses
            GROUP BY Category
            ORDER BY Category
        """)
        
        rows = cursor.fetchall()
        categories = []
        
        for row in rows:
            total_licenses = row[1] or 0
            used_licenses = row[2] or 0
            utilization_rate = (used_licenses / total_licenses * 100) if total_licenses > 0 else 0
            
            categories.append({
                "category": row[0],
                "totalLicenses": total_licenses,
                "usedLicenses": used_licenses,
                "availableLicenses": row[3] or 0,
                "utilizationRate": utilization_rate,
                "monthlyCost": float(row[4] or 0)
            })
        
        cursor.close()
        conn.close()
        
        return jsonify(categories)
        
    except Exception as e:
        print("Error fetching category analytics:", str(e))
        return jsonify({"error": "Failed to fetch category analytics"}), 500