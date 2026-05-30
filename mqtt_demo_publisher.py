import paho.mqtt.client as mqtt
import json
import time
from datetime import datetime

def publish_update(topic, message):
    client = mqtt.Client()
    client.connect("localhost", 1883, 60)
    client.publish(topic, json.dumps(message))
    client.disconnect()
    print(f"📤 Published: {message.get('status', 'update')}")

# Simulate ride lifecycle
ride_id = 1001
updates = [
    {
        "topic": "twendego/ride/request",
        "message": {
            "ride_id": ride_id,
            "status": "requested",
            "customer": "John Doe",
            "pickup": "Kariakoo",
            "dropoff": "Mlimani City",
            "timestamp": datetime.now().isoformat()
        }
    },
    {
        "topic": "twendego/ride/status",
        "message": {
            "ride_id": ride_id,
            "status": "accepted",
            "rider": "Juma",
            "eta": 5,
            "timestamp": datetime.now().isoformat()
        }
    },
    {
        "topic": "twendego/ride/status",
        "message": {
            "ride_id": ride_id,
            "status": "started",
            "timestamp": datetime.now().isoformat()
        }
    },
    {
        "topic": "twendego/ride/status",
        "message": {
            "ride_id": ride_id,
            "status": "completed",
            "timestamp": datetime.now().isoformat()
        }
    }
]

print("🎙️ Sending ride status updates...\n")
for update in updates:
    publish_update(update["topic"], update["message"])
    time.sleep(3)
print("\n✅ Demo completed!")
