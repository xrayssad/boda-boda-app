from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import RideRequest
from .serializers import RideRequestSerializer, RideRequestCreateSerializer
import urllib.request
import json

# Simple in-memory storage for rides (fallback)
temp_rides = []
temp_id_counter = 1

@api_view(['POST'])
def request_ride(request):
    """Customer requests a ride"""
    try:
        print("Received ride request:", request.data)
        
        # Try to save to database first
        serializer = RideRequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            ride = serializer.save()
            return Response({
                'success': True,
                'ride_id': ride.id,
                'message': 'Ride requested successfully!',
                'ride': RideRequestSerializer(ride).data
            }, status=status.HTTP_201_CREATED)
        else:
            # If serializer fails, store in memory
            global temp_id_counter
            ride_data = {
                'id': temp_id_counter,
                'customer_name': request.data.get('customer_name', 'Anonymous'),
                'customer_phone': request.data.get('customer_phone', ''),
                'pickup_location': request.data.get('pickup_location', ''),
                'dropoff_location': request.data.get('dropoff_location', ''),
                'distance_km': request.data.get('distance_km', 0),
                'estimated_cost': request.data.get('estimated_cost', 0),
                'status': 'pending',
                'created_at': timezone.now().isoformat()
            }
            temp_rides.append(ride_data)
            temp_id_counter += 1
            
            return Response({
                'success': True,
                'ride_id': ride_data['id'],
                'message': 'Ride requested (in-memory storage)!',
                'ride': ride_data
            }, status=status.HTTP_201_CREATED)
            
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
        rides = RideRequest.objects.all()
        serializer = RideRequestSerializer(rides, many=True)
        db_rides = serializer.data
        all_rides = list(db_rides) + temp_rides
        return Response({
            'success': True,
            'count': len(all_rides),
            'rides': all_rides
        })
    except Exception as e:
        return Response({
            'success': True,
            'count': len(temp_rides),
            'rides': temp_rides
        })

@api_view(['GET'])
def get_pending_rides(request):
    """Get pending rides"""
    try:
        rides = RideRequest.objects.filter(status='pending')
        serializer = RideRequestSerializer(rides, many=True)
        db_rides = serializer.data
        memory_rides = [r for r in temp_rides if r.get('status') == 'pending']
        all_pending = list(db_rides) + memory_rides
        return Response({
            'success': True,
            'count': len(all_pending),
            'rides': all_pending
        })
    except Exception as e:
        memory_rides = [r for r in temp_rides if r.get('status') == 'pending']
        return Response({
            'success': True,
            'count': len(memory_rides),
            'rides': memory_rides
        })

@api_view(['GET'])
def get_ride_detail(request, ride_id):
    """Get single ride details"""
    try:
        ride = get_object_or_404(RideRequest, id=ride_id)
        serializer = RideRequestSerializer(ride)
        return Response({'success': True, 'ride': serializer.data})
    except:
        for ride in temp_rides:
            if ride.get('id') == ride_id:
                return Response({'success': True, 'ride': ride})
        return Response({'success': False, 'error': 'Ride not found'}, status=404)

@api_view(['PUT'])
def accept_ride(request, ride_id):
    """Rider accepts a ride"""
    try:
        try:
            ride = RideRequest.objects.get(id=ride_id)
            if ride.status != 'pending':
                return Response({'success': False, 'message': 'Ride not available'})
            ride.status = 'accepted'
            ride.rider_name = request.data.get('rider_name', 'Rider')
            ride.rider_phone = request.data.get('rider_phone', '')
            ride.save()
            return Response({'success': True, 'message': f'Ride {ride_id} accepted!'})
        except:
            for ride in temp_rides:
                if ride.get('id') == ride_id and ride.get('status') == 'pending':
                    ride['status'] = 'accepted'
                    ride['rider_name'] = request.data.get('rider_name', 'Rider')
                    return Response({'success': True, 'message': f'Ride {ride_id} accepted!'})
            return Response({'success': False, 'message': 'Ride not found'})
    except Exception as e:
        return Response({'success': False, 'error': str(e)})

@api_view(['PUT'])
def complete_ride(request, ride_id):
    """Complete a ride"""
    try:
        try:
            ride = RideRequest.objects.get(id=ride_id)
            if ride.status != 'accepted':
                return Response({'success': False, 'message': 'Only accepted rides can be completed'})
            ride.status = 'completed'
            ride.completed_at = timezone.now()
            ride.save()
            return Response({'success': True, 'message': f'Ride {ride_id} completed!'})
        except:
            for ride in temp_rides:
                if ride.get('id') == ride_id and ride.get('status') == 'accepted':
                    ride['status'] = 'completed'
                    return Response({'success': True, 'message': f'Ride {ride_id} completed!'})
            return Response({'success': False, 'message': 'Ride not found'})
    except Exception as e:
        return Response({'success': False, 'error': str(e)})

@api_view(['PUT'])
def cancel_ride(request, ride_id):
    """Cancel a ride"""
    try:
        try:
            ride = RideRequest.objects.get(id=ride_id)
            if ride.status == 'completed':
                return Response({'success': False, 'message': 'Cannot cancel completed ride'})
            ride.status = 'cancelled'
            ride.save()
            return Response({'success': True, 'message': f'Ride {ride_id} cancelled'})
        except:
            for ride in temp_rides:
                if ride.get('id') == ride_id and ride.get('status') != 'completed':
                    ride['status'] = 'cancelled'
                    return Response({'success': True, 'message': f'Ride {ride_id} cancelled'})
            return Response({'success': False, 'message': 'Ride not found'})
    except Exception as e:
        return Response({'success': False, 'error': str(e)})

@api_view(['GET'])
def search_locations(request):
    """Proxy for OpenStreetMap Nominatim API"""
    query = request.GET.get('q', '')
    if not query or len(query) < 2:
        return Response({'success': True, 'locations': []})
    
    try:
        url = f"https://nominatim.openstreetmap.org/search?q={query}, Tanzania&format=json&limit=10&addressdetails=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            locations = []
            for item in data:
                lat = float(item.get('lat', 0))
                lon = float(item.get('lon', 0))
                if -11.5 <= lat <= -0.5 and 29.0 <= lon <= 40.5:
                    locations.append({
                        'name': item.get('display_name', '').split(',')[0],
                        'fullAddress': item.get('display_name', ''),
                        'lat': lat,
                        'lon': lon,
                        'type': item.get('type', 'place'),
                        'city': item.get('address', {}).get('city', 'Tanzania')
                    })
            return Response({'success': True, 'locations': locations})
    except Exception as e:
        print(f"Search error: {e}")
        return Response({'success': True, 'locations': []})
