from django.urls import path
from . import views

urlpatterns = [
    path('request-ride/', views.request_ride, name='request_ride'),
    path('rides/', views.get_rides, name='get_rides'),
    path('rides/pending/', views.get_pending_rides, name='get_pending_rides'),
    path('rides/<int:ride_id>/', views.get_ride_detail, name='get_ride_detail'),
    path('rides/<int:ride_id>/accept/', views.accept_ride, name='accept_ride'),
    path('rides/<int:ride_id>/complete/', views.complete_ride, name='complete_ride'),
    path('rides/<int:ride_id>/cancel/', views.cancel_ride, name='cancel_ride'),
    path('search-locations/', views.search_locations, name='search_locations'),
]
