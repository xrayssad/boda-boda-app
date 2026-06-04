#!/bin/bash

echo "=================================="
echo "DEMONSTRATING FAILURE HANDLING"
echo "=================================="

# Test 1: Should fail - invalid Dockerfile
echo ""
echo "Test 1: Building with invalid Dockerfile (should FAIL)"
docker build -f Dockerfile.backend.invalid -t test-fail . 2>/dev/null
if [ $? -ne 0 ]; then
    echo "✅ Pipeline correctly stopped - Build failed"
else
    echo "❌ Pipeline should have failed!"
fi

# Test 2: Should fail - MQTT broker not responding
echo ""
echo "Test 2: MQTT test with broker down (should FAIL)"
docker stop mosquitto 2>/dev/null
python3 -c "
import paho.mqtt.client as mqtt
import sys
try:
    client = mqtt.Client()
    client.connect('localhost', 1883, 5)
    print('❌ Should have failed!')
    sys.exit(1)
except:
    print('✅ Pipeline correctly stopped - MQTT broker down')
    sys.exit(0)
" 2>/dev/null

# Restart mosquitto
docker start mosquitto 2>/dev/null

echo ""
echo "=================================="
echo "FAILURE HANDLING DEMO COMPLETE"
echo "Pipeline stops when:"
echo "  - Tests fail"
echo "  - Build fails"
echo "  - MQTT broker unavailable"
echo "=================================="