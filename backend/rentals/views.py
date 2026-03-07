from django.utils import timezone
from decimal import Decimal
from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Drone, Rental, Review
from .serializers import DroneSerializer, RentalSerializer, RentalCreateSerializer, ReviewSerializer


@api_view(['GET'])
def drone_availability(request, pk):
    rentals = Rental.objects.filter(drone_id=pk).values('start_time', 'end_time', 'returned', 'name')
    slots = []
    for r in rentals:
        renter = r['name']
        slots.append({
            'start': r['start_time'].isoformat() if r['start_time'] else None,
            'end': r['end_time'].isoformat() if r['end_time'] else None,
            'status': 'completed' if r['returned'] else 'active',
            'renter': (renter[:8] + '…') if len(renter) > 8 else renter,
        })
    return Response(slots)


@api_view(['GET'])
def admin_stats(request):
    password = request.query_params.get('password', '')
    if password != 'droneadmin2024':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

    from django.db.models import Sum, Count
    from datetime import timedelta

    now = timezone.now()
    days = []
    for i in range(29, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_rentals = Rental.objects.filter(created_at__gte=day_start, created_at__lt=day_end)
        count = day_rentals.count()
        revenue = float(day_rentals.filter(returned=True).aggregate(s=Sum('total_cost'))['s'] or 0)
        days.append({
            'date': day_start.strftime('%b %d'),
            'bookings': count,
            'revenue': round(revenue, 2),
        })

    top_drones = list(
        Drone.objects.annotate(rental_count=Count('rentals'))
        .order_by('-rental_count')[:5]
        .values('name', 'rental_count')
    )
    total_revenue = float(Rental.objects.filter(returned=True).aggregate(s=Sum('total_cost'))['s'] or 0)

    return Response({
        'days': days,
        'top_drones': top_drones,
        'total_revenue': round(total_revenue, 2),
    })


class DroneListView(generics.ListAPIView):
    queryset = Drone.objects.all()
    serializer_class = DroneSerializer


class RentalCreateView(generics.CreateAPIView):
    queryset = Rental.objects.all()
    serializer_class = RentalCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rental = serializer.save()
        return Response(RentalSerializer(rental).data, status=status.HTTP_201_CREATED)


class RentalListByEmailView(generics.ListAPIView):
    serializer_class = RentalSerializer

    def get_queryset(self):
        email = self.request.query_params.get('email', '')
        return Rental.objects.filter(email=email).select_related('drone').order_by('-created_at')


@api_view(['PATCH'])
def return_drone(request, pk):
    try:
        rental = Rental.objects.select_related('drone').get(pk=pk)
    except Rental.DoesNotExist:
        return Response({'error': 'Rental not found.'}, status=status.HTTP_404_NOT_FOUND)

    if rental.returned:
        return Response({'error': 'Drone already returned.'}, status=status.HTTP_400_BAD_REQUEST)

    now = timezone.now()
    rental.end_time = now
    rental.returned = True

    duration_hours = (now - rental.start_time).total_seconds() / 3600
    rental.total_cost = Decimal(str(round(duration_hours, 4))) * rental.drone.price_per_hour

    rental.save()

    drone = rental.drone
    drone.is_available = True
    drone.save()

    return Response(RentalSerializer(rental).data)


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_queryset(self):
        drone_id = self.request.query_params.get('drone')
        qs = Review.objects.select_related('drone').order_by('-created_at')
        if drone_id:
            qs = qs.filter(drone_id=drone_id)
        return qs


@api_view(['GET'])
def site_stats(request):
    from django.db.models import Avg, Count
    total_drones = Drone.objects.count()
    available_drones = Drone.objects.filter(is_available=True).count()
    total_rentals = Rental.objects.count()
    total_reviews = Review.objects.count()
    avg_rating = Review.objects.aggregate(avg=Avg('rating'))['avg'] or 0
    total_hours = sum(
        (r.end_time - r.start_time).total_seconds() / 3600
        for r in Rental.objects.filter(returned=True, end_time__isnull=False)
    )
    return Response({
        'total_drones': total_drones,
        'available_drones': available_drones,
        'total_rentals': total_rentals,
        'total_reviews': total_reviews,
        'avg_rating': round(float(avg_rating), 1),
        'total_hours_flown': round(total_hours, 1),
    })
