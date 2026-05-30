#!/usr/bin/env python3
import paho.mqtt.client as mqtt
import json
import sys

def on_connect(client, userdata, flags, rc):
    print(f"✅ Connected to MQTT broker with code {rc}")
    client.subscribe("ride/status/#")
    print("📡 Subscribed to 'ride/status/#'")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        status = payload.get('status', 'unknown')
        ride_id = payload.get('ride_id')
        
        print(f"\n{'='*50}")
        print(f"📢 RIDE UPDATE: {status.upper()}")
        print(f"   Ride ID: {ride_id}")
        
        if status == 'requested':
            print(f"   Pickup: {payload.get('pickup_location')}")
            print(f"   Dropoff: {payload.get('dropoff_location')}")
        elif status == 'accepted':
            print(f"   Rider: {payload.get('rider_id')} accepted the ride!")
        elif status == 'completed':
            print(f"   Ride completed to {payload.get('dropoff_location')}!")
        print(f"   Time: {payload.get('timestamp')}")
        print(f"{'='*50}")
    except Exception as e:
        print(f"Error: {e}")

def main():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    
    client.connect("localhost", 1883, 60)
    client.loop_forever()

if __name__ == "__main__":
    print("🎧 MQTT Subscriber Started - Waiting for ride updates...")
    main()
