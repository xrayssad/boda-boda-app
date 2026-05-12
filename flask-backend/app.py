from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import json
import os

app = Flask(__name__)
CORS(app)

DATA_FILE = 'rides.json'

def load_rides():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def save_rides(rides):
    with open(DATA_FILE, 'w') as f:
        json.dump(rides, f, indent=2)

@app.route('/api/request-ride', methods=['POST'])
def request_ride():
    data = request.get_json()
    ride_id = str(uuid.uuid4())[:8]
    ride = {
        "ride_id": ride_id,
        "pickup": data.get('pickup'),
        "dropoff": data.get('dropoff'),
        "customer": data.get('customer', 'Demo User'),
        "status": "pending"
    }
    rides = load_rides()
    rides.append(ride)
    save_rides(rides)
    return jsonify({"message": "Ride request received!", "ride_id": ride_id, "ride": ride})

@app.route('/api/rides', methods=['GET'])
def get_rides():
    return jsonify(load_rides())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
