from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import RideRequest
from .serializers import RideRequestSerializer, RideRequestCreateSerializer
from .mqtt_service import mqtt_service
import urllib.request
import json


@api_view(['POST'])
def request_ride(request):
    """Customer requests a ride - Backend publishes to MQTT"""
    try:
        print("📝 Received ride request:", request.data)
        
        serializer = RideRequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            ride = serializer.save()
            
            success = mqtt_service.publish_ride_request(
                ride_id=ride.id,
                customer_name=ride.customer_name,
                customer_phone=ride.customer_phone,
                pickup_location=ride.pickup_location,
                dropoff_location=ride.dropoff_location,
                pickup_lat=ride.pickup_lat,
                pickup_lon=ride.pickup_lon,
                dropoff_lat=ride.dropoff_lat,
                dropoff_lon=ride.dropoff_lon,
                distance_km=ride.distance_km,
                estimated_cost=ride.estimated_cost
            )
            
            if success:
                print(f"📤 MQTT: Ride request published (retained) - ID: {ride.id}")
            else:
                print("⚠️ MQTT not connected - Ride saved in database only")
            
            return Response({
                'success': True,
                'ride_id': ride.id,
                'message': 'Ride requested successfully!',
                'ride': RideRequestSerializer(ride).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"Error in request_ride: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_rides(request):
    """Get all rides"""
    try:
        rides = RideRequest.objects.all().order_by('-created_at')
        serializer = RideRequestSerializer(rides, many=True)
        return Response({
            'success': True,
            'count': rides.count(),
            'rides': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_pending_rides(request):
    """Get pending rides for riders"""
    try:
        rides = RideRequest.objects.filter(status='pending').order_by('-created_at')
        serializer = RideRequestSerializer(rides, many=True)
        return Response({
            'success': True,
            'count': rides.count(),
            'rides': serializer.data
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_ride_detail(request, ride_id):
    """Get single ride details"""
    try:
        ride = get_object_or_404(RideRequest, id=ride_id)
        serializer = RideRequestSerializer(ride)
        return Response({'success': True, 'ride': serializer.data})
    except:
        return Response({'success': False, 'error': 'Ride not found'}, status=404)


@api_view(['PUT'])
def accept_ride(request, ride_id):
    """Rider accepts a ride"""
    try:
        ride = get_object_or_404(RideRequest, id=ride_id)
        
        if ride.status != 'pending':
            return Response({'success': False, 'message': 'Ride not available'}, status=400)
        
        rider_name = request.data.get('rider_name', 'Juma R.')
        rider_phone = request.data.get('rider_phone', '')
        eta = request.data.get('eta', 7)
        
        ride.status = 'accepted'
        ride.rider_name = rider_name
        ride.rider_phone = rider_phone
        ride.save()
        
        # ✅ Futa retained message — ride imechukuliwa, riders wengine wasione
        mqtt_service.clear_ride_request(ride_id)
        
        # ✅ Notify customer
        success = mqtt_service.publish_ride_status(
            ride_id=ride.id,
            status="accepted",
            rider=rider_name,
            rider_name=rider_name,
            rider_phone=rider_phone,
            eta=eta,
            pickup=ride.pickup_location,
            dropoff=ride.dropoff_location,
            customer_name=ride.customer_name,
            customer_phone=ride.customer_phone
        )
        
        if success:
            print(f"✅ Published acceptance for ride {ride_id} with rider {rider_name}")
        
        return Response({
            'success': True,
            'message': f'Ride {ride_id} accepted!',
            'rider_name': rider_name,
            'eta': eta
        })
        
    except Exception as e:
        print(f"Error in accept_ride: {str(e)}")
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['PUT'])
def complete_ride(request, ride_id):
    """Complete a ride"""
    try:
        ride = get_object_or_404(RideRequest, id=ride_id)
        
        if ride.status != 'accepted':
            return Response({'success': False, 'message': 'Only accepted rides can be completed'}, status=400)
        
        ride.status = 'completed'
        ride.completed_at = timezone.now()
        ride.save()
        
        mqtt_service.publish_ride_status(
            ride_id=ride.id,
            status="completed",
            rider_name=ride.rider_name,
            pickup=ride.pickup_location,
            dropoff=ride.dropoff_location,
            customer_name=ride.customer_name
        )
        
        return Response({'success': True, 'message': f'Ride {ride_id} completed!'})
        
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['PUT'])
def cancel_ride(request, ride_id):
    """Cancel a ride"""
    try:
        ride = get_object_or_404(RideRequest, id=ride_id)
        
        if ride.status == 'completed':
            return Response({'success': False, 'message': 'Cannot cancel completed ride'}, status=400)
        
        ride.status = 'cancelled'
        ride.save()
        
        # ✅ Futa retained message pia ukifuta ride
        mqtt_service.clear_ride_request(ride_id)
        
        return Response({'success': True, 'message': f'Ride {ride_id} cancelled'})
        
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)


@api_view(['GET'])
def search_locations(request):
    """Proxy for OpenStreetMap Nominatim API"""
    query = request.GET.get('q', '')
    if not query or len(query) < 2:
        return Response({'success': True, 'locations': []})
    
    try:
        url = f"https://nominatim.openstreetmap.org/search?q={query}, Tanzania&format=json&limit=10&addressdetails=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'BodaBodaApp'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            locations = [{
                'name': item.get('display_name', '').split(',')[0],
                'fullAddress': item.get('display_name', ''),
                'lat': float(item.get('lat', 0)),
                'lon': float(item.get('lon', 0))
            } for item in data]
            return Response({'success': True, 'locations': locations})
    except Exception as e:
        print(f"Search error: {e}")
        return Response({'success': True, 'locations': []})