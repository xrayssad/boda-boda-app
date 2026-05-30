import mqtt from 'mqtt';

class MQTTService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.callbacks = new Set();
    this.subscribedTopics = new Set();
    this._connectingPromise = null;
  }

  connect() {
    if (this.client && this.connected) return;
    if (this._connectingPromise) return;
    if (this.client && !this.connected) {
      this.client.end(true);
      this.client = null;
    }

    console.log('🔄 Connecting MQTT...');
    this._connectingPromise = true;

    this.client = mqtt.connect('ws://localhost:9001', {
      clientId: `twendego_${Math.random().toString(16).slice(2, 8)}`,
      reconnectPeriod: 3000,
      connectTimeout: 10000,
      keepalive: 60,
      clean: true,
    });

    this.client.on('connect', () => {
      this.connected = true;
      this._connectingPromise = null;
      console.log('✅ MQTT Connected to broker');

      // Re-subscribe to all topics after connect/reconnect
      this.subscribedTopics.forEach((topic) => {
        this.client.subscribe(topic, { qos: 1 }, (err) => {
          if (!err) console.log(`📡 Subscribed to ${topic}`);
        });
      });
    });

    this.client.on('message', (topic, message) => {
      try {
        // Ignore empty retained messages (used to clear retained messages)
        if (!message || message.toString() === '') return;

        const payload = JSON.parse(message.toString());
        console.log(`📨 MQTT Message on ${topic}:`, payload);
        this.callbacks.forEach((cb) => cb(topic, payload));
      } catch (error) {
        console.error('MQTT Parse Error:', error);
      }
    });

    this.client.on('close', () => {
      this.connected = false;
      this._connectingPromise = null;
      console.log('🔌 MQTT disconnected');
    });

    this.client.on('error', (err) => {
      this.connected = false;
      this._connectingPromise = null;
      console.error('❌ MQTT Error:', err.message);
    });

    this.client.on('reconnect', () => {
      console.log('🔄 MQTT reconnecting...');
    });
  }

  subscribe(topic, callback) {
    if (!this.client) this.connect();

    if (!this.subscribedTopics.has(topic)) {
      this.subscribedTopics.add(topic);
      if (this.connected) {
        this.client.subscribe(topic, { qos: 1 });
        console.log(`📡 Subscribed to ${topic}`);
      }
    }

    this.callbacks.add(callback);
  }

  unsubscribe(callback) {
    this.callbacks.delete(callback);
    console.log(`🗑️ Unsubscribed callback. Remaining: ${this.callbacks.size}`);
  }

  publish(topic, payload) {
    if (!this.client || !this.connected) {
      console.warn('⚠️ MQTT not connected — cannot publish');
      return;
    }
    this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
    console.log(`📤 Published to ${topic}:`, payload);
  }

  isConnected() {
    return this.connected;
  }

  disconnect() {
    if (this.client) {
      this.client.end(true);
      this.client = null;
      this.connected = false;
      this._connectingPromise = null;
      this.callbacks.clear();
      this.subscribedTopics.clear();
      console.log('🔌 MQTT disconnected manually');
    }
  }
}

export default new MQTTService();