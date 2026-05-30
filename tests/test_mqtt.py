import paho.mqtt.client as mqtt
import time

BROKER = "localhost"
PORT = 1883
TOPIC = "twendego/test"

message_received = False


def on_message(client, userdata, msg):
    global message_received
    payload = msg.payload.decode()
    print(f"📩 Received: {payload}")
    message_received = True


def test_mqtt_publish_subscribe():
    client = mqtt.Client()
    client.on_message = on_message

    client.connect(BROKER, PORT, 60)
    client.subscribe(TOPIC)

    client.loop_start()

    time.sleep(1)

    client.publish(TOPIC, "CI/CD MQTT TEST MESSAGE")

    time.sleep(2)
    client.loop_stop()

    assert message_received is True