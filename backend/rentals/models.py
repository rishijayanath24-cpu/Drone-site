from django.db import models


class Drone(models.Model):
    name = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    image_url = models.URLField(max_length=500, blank=True, default='')
    price_per_hour = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField(blank=True, default='')
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.model})"


class Rental(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    drone = models.ForeignKey(Drone, on_delete=models.PROTECT, related_name='rentals')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    returned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.drone.name}"


class DroneImage(models.Model):
    drone = models.ForeignKey(Drone, on_delete=models.CASCADE, related_name='gallery')
    image_url = models.URLField(max_length=500)
    caption = models.CharField(max_length=200, blank=True, default='')
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.drone.name} — image {self.order}"


class Review(models.Model):
    drone = models.ForeignKey(Drone, on_delete=models.CASCADE, related_name='reviews')
    name = models.CharField(max_length=150)
    email = models.EmailField()
    rating = models.PositiveSmallIntegerField()  # 1-5
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.drone.name} ({self.rating}★)"
