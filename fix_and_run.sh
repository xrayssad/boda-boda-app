#!/bin/bash
echo "================================================"
echo "  TwendeGo MQTT Setup Fix"
echo "================================================"

# 1. Fix mosquitto container conflict
echo ""
echo "STEP 1: Fix Mosquitto container..."
docker stop mosquitto 2>/dev/null && echo "  Stopped old container"
docker rm mosquitto 2>/dev/null && echo "  Removed old container"

# Start fresh with config that allows anonymous + websockets
docker run -d \
  --name mosquitto \
  -p 1883:1883 \
  -p 9001:9001 \
  eclipse-mosquitto:latest \
  sh -c "echo 'listener 1883
listener 9001
protocol websockets
allow_anonymous true' > /mosquitto/config/mosquitto.conf && mosquitto -c /mosquitto/config/mosquitto.conf"

sleep 3
docker ps | grep mosquitto && echo "  ✅ Mosquitto running!" || echo "  ❌ Failed"

# 2. Install paho-mqtt
echo ""
echo "STEP 2: Install paho-mqtt..."
pip install paho-mqtt --break-system-packages -q
echo "  ✅ paho-mqtt installed!"

# 3. Test MQTT using Python (no need for mosquitto_sub/pub commands)
echo ""
echo "STEP 3: Testing MQTT publish/subscribe..."
python3 << 'PYEOF'
import paho.mqtt.client as mqtt
import json
import time
import threading

received = []

def on_message(client, userdata, msg):
    data = msg.payload.decode()
    received.append(data)
    print(f"  ✅ Received on '{msg.topic}': {data}")

# Subscriber
sub = mqtt.Client(client_id="test_sub")
sub.on_message = on_message
sub.connect("localhost", 1883, 60)
sub.subscribe("test", qos=1)
sub.loop_start()
time.sleep(1)

# Publisher
pub = mqtt.Client(client_id="test_pub")
pub.connect("localhost", 1883, 60)
pub.publish("test", "Hello MQTT from TwendeGo!", qos=1)
time.sleep(2)

sub.loop_stop()
sub.disconnect()
pub.disconnect()

if received:
    print(f"\n  ✅ MQTT TEST PASSED — Message delivered successfully!")
else:
    print(f"\n  ❌ No message received — check broker")
PYEOF

echo ""
echo "================================================"
echo "  All done! Run: python mqtt_test.py"
echo "================================================"
