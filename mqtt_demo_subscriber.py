import paho.mqtt.client as mqtt
import json
import sys
import time

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker")
        client.subscribe("twendego/ride/#")
        print("📡 Listening for ride updates on 'twendego/ride/#'")
    else:
        print(f"❌ Connection failed with code {rc}")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        print(f"\n{'='*60}")
        print(f"🔔 RIDE UPDATE RECEIVED!")
        print(f"   Topic: {msg.topic}")
        print(f"   Data: {json.dumps(payload, indent=2)}")
        print(f"{'='*60}")
    except:
        print(f"\n📨 Raw message on {msg.topic}: {msg.payload.decode()}")

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect("localhost", 1883, 60)
client.loop_forever()
