from rest_framework import serializers
from .models import RideRequest

class RideRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RideRequest
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class RideRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RideRequest
        fields = ['pickup_location', 'dropoff_location', 'pickup_lat', 'pickup_lon', 
                  'dropoff_lat', 'dropoff_lon', 'distance_km', 'estimated_cost', 
                  'customer_name', 'customer_phone']
