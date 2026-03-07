from rest_framework import serializers
from .models import Drone, DroneImage, Rental, Review


class DroneImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DroneImage
        fields = ['id', 'image_url', 'caption', 'order']


class DroneSerializer(serializers.ModelSerializer):
    images = DroneImageSerializer(source='gallery', many=True, read_only=True)

    class Meta:
        model = Drone
        fields = ['id', 'name', 'model', 'image_url', 'price_per_hour', 'description', 'is_available', 'images']


class RentalSerializer(serializers.ModelSerializer):
    drone_name = serializers.CharField(source='drone.name', read_only=True)
    drone_model = serializers.CharField(source='drone.model', read_only=True)
    drone_price_per_hour = serializers.DecimalField(source='drone.price_per_hour', max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = Rental
        fields = [
            'id', 'name', 'email', 'drone', 'drone_name', 'drone_model', 'drone_price_per_hour',
            'start_time', 'end_time', 'total_cost', 'returned', 'created_at'
        ]
        read_only_fields = ['end_time', 'total_cost', 'returned', 'created_at']


class RentalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rental
        fields = ['id', 'name', 'email', 'drone', 'start_time', 'end_time']
        extra_kwargs = {'end_time': {'required': False, 'allow_null': True}}

    def validate_drone(self, drone):
        if not drone.is_available:
            raise serializers.ValidationError("This drone is not available for rental.")
        return drone

    def create(self, validated_data):
        drone = validated_data['drone']
        drone.is_available = False
        drone.save()
        rental = Rental.objects.create(**validated_data)
        return rental


class ReviewSerializer(serializers.ModelSerializer):
    drone_name = serializers.CharField(source='drone.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'drone', 'drone_name', 'name', 'email', 'rating', 'comment', 'created_at']
        read_only_fields = ['created_at']

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
