import paho.mqtt.client as mqtt
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class MQTTManager:
    _instance = None
    _client = None
    _connected = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def connect(self, broker="mosquitto", port=1883):
        if self._client is None:
            self._client = mqtt.Client()
            self._client.on_connect = self._on_connect
            self._client.on_publish = self._on_publish
            try:
                self._client.connect(broker, port, 60)
                self._client.loop_start()
                logger.info(f"MQTT: Connecting to {broker}:{port}")
            except Exception as e:
                logger.error(f"MQTT Connection failed: {e}")
        return self._client
    
    def _on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            self._connected = True
            logger.info("MQTT: Connected successfully")
        else:
            logger.error(f"MQTT: Connection failed with code {rc}")
    
    def _on_publish(self, client, userdata, mid):
        logger.debug(f"MQTT: Message published (mid: {mid}")
    
    def publish_ride_status(self, ride_id, status, customer_id=None, rider_id=None, 
                           pickup_location=None, dropoff_location=None):
        if not self._connected:
            logger.warning("MQTT: Not connected, message not sent")
            return None
        
        message = {
            "ride_id": ride_id,
            "customer_id": customer_id,
            "rider_id": rider_id,
            "status": status,
            "timestamp": datetime.now().isoformat(),
            "pickup_location": pickup_location,
            "dropoff_location": dropoff_location
        }
        
        topic = f"ride/status/{ride_id}"
        result = self._client.publish(topic, json.dumps(message), qos=1)
        
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            logger.info(f"MQTT: Published to {topic} - {status}")
        else:
            logger.error(f"MQTT: Publish failed with code {result.rc}")
        
        return message

mqtt_manager = MQTTManager()