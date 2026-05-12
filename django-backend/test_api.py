import requests
import json

# Test creating a ride request
url = "http://localhost:8000/api/request-ride/"
data = {
    "pickup_location": "Kariakoo, Dar es Salaam",
    "dropoff_location": "Mlimani City, Dar es Salaam",
    "distance_km": 5.2,
    "estimated_cost": 8000,
    "customer_name": "Test Customer",
    "customer_phone": "+255 712 345 678"
}

try:
    response = requests.post(url, json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
