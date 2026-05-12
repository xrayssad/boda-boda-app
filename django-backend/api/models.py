from django.db import models
from django.utils import timezone

class RideRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Customer details
    customer_name = models.CharField(max_length=100, default='Customer', blank=True)
    customer_phone = models.CharField(max_length=20, blank=True, default='')
    
    # Ride details
    pickup_location = models.CharField(max_length=255)
    dropoff_location = models.CharField(max_length=255)
    pickup_lat = models.FloatField(null=True, blank=True)
    pickup_lon = models.FloatField(null=True, blank=True)
    dropoff_lat = models.FloatField(null=True, blank=True)
    dropoff_lon = models.FloatField(null=True, blank=True)
    
    # Ride metrics
    distance_km = models.FloatField(default=0)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Rider details
    rider_name = models.CharField(max_length=100, blank=True, null=True)
    rider_phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Status and timestamps
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer_name} - {self.pickup_location} to {self.dropoff_location}"
