from django.contrib import admin
from .models import RideRequest

class RideRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'pickup_location', 'dropoff_location', 'estimated_cost', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['customer_name', 'pickup_location', 'dropoff_location']
    readonly_fields = ['created_at', 'updated_at']

admin.site.register(RideRequest, RideRequestAdmin)
