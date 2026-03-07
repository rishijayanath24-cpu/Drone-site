from django.urls import path
from .views import (
    DroneListView, RentalCreateView, RentalListByEmailView,
    return_drone, ReviewListCreateView, site_stats,
    drone_availability, admin_stats,
)

urlpatterns = [
    path('drones/', DroneListView.as_view(), name='drone-list'),
    path('drones/<int:pk>/availability/', drone_availability, name='drone-availability'),
    path('rentals/', RentalCreateView.as_view(), name='rental-create'),
    path('rentals/history/', RentalListByEmailView.as_view(), name='rental-history'),
    path('rentals/<int:pk>/return/', return_drone, name='rental-return'),
    path('reviews/', ReviewListCreateView.as_view(), name='review-list-create'),
    path('stats/', site_stats, name='site-stats'),
    path('admin/stats/', admin_stats, name='admin-stats'),
]
