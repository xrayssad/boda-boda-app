import paho.mqtt.client as mqtt
import json
import logging
from datetime import datetime
import time
import threading

logger = logging.getLogger(__name__)

class MQTTService:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        self.client = None
        self.broker = "mosquitto"
        self.port = 1883
        self._connected = False
        self.connect()
    
    def connect(self):
        try:
            if self.client is None:
                self.client = mqtt.Client()
                self.client.on_connect = self._on_connect
                self.client.on_disconnect = self._on_disconnect
                self.client.connect(self.broker, self.port, 60)
                self.client.loop_start()
                print("✅ MQTT: Connecting to Mosquitto broker...")
                return True
        except Exception as e:
            print(f"❌ MQTT Connection Failed: {e}")
            self.client = None
            self._connected = False
            return False
    
    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self._connected = True
            print("✅ MQTT Connected successfully")
        else:
            self._connected = False
            print(f"❌ MQTT Connection failed with code {rc}")
    
    def _on_disconnect(self, client, userdata, rc):
        self._connected = False
        print("⚠️ MQTT Disconnected. Reconnecting...")
        time.sleep(2)
        self.connect()
    
    def is_connected(self):
        return self._connected and self.client is not None
    
    def publish_ride_request(self, ride_id, customer_name, customer_phone=None,
                              pickup_location=None, dropoff_location=None,
                              pickup_lat=None, pickup_lon=None,
                              dropoff_lat=None, dropoff_lon=None,
                              distance_km=None, estimated_cost=None):
        try:
            if not self.is_connected():
                self.connect()
                time.sleep(1)
            
            message = {
                "ride_id": ride_id,
                "customer_name": customer_name,
                "customer_phone": customer_phone,
                "pickup_location": pickup_location,
                "dropoff_location": dropoff_location,
                "pickup_lat": pickup_lat,
                "pickup_lon": pickup_lon,
                "dropoff_lat": dropoff_lat,
                "dropoff_lon": dropoff_lon,
                "distance_km": str(distance_km) if distance_km else None,
                "estimated_cost": str(estimated_cost) if estimated_cost else None,
                "status": "requested",
                "timestamp": time.time()
            }
            
            topic = "twendego/ride/request"
            # retain=True — message inabaki broker hadi rider asubscribe
            result = self.client.publish(topic, json.dumps(message), qos=1, retain=True)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"✅ MQTT Published ride request (retained): {ride_id}")
                return True
            else:
                print(f"❌ MQTT Publish failed: {result.rc}")
                return False
                
        except Exception as e:
            print(f"❌ MQTT publish_ride_request failed: {e}")
            return False
    
    def publish_ride_status(self, ride_id, status, **kwargs):
        try:
            if not self.is_connected():
                self.connect()
                time.sleep(1)
            
            message = {
                "ride_id": ride_id,
                "status": status,
                "timestamp": datetime.now().isoformat(),
                **kwargs
            }
            
            topic = "twendego/ride/status"
            result = self.client.publish(topic, json.dumps(message), qos=1, retain=False)
            
            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"✅ MQTT Published status '{status}' for ride {ride_id}")
                return True
            else:
                print(f"❌ MQTT Publish failed: {result.rc}")
                return False
                
        except Exception as e:
            print(f"❌ MQTT publish_ride_status failed: {e}")
            return False

    def clear_ride_request(self, ride_id):
        """Clear retained message after ride is accepted/cancelled"""
        try:
            if not self.is_connected():
                return
            # Empty retained message = broker anafuta retained message
            self.client.publish("twendego/ride/request", "", qos=1, retain=True)
            print(f"✅ Cleared retained ride request for ride {ride_id}")
        except Exception as e:
            print(f"❌ Failed to clear retained message: {e}")

mqtt_service = MQTTService()