from django.db import models

class PotholeData(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    severity = models.PositiveSmallIntegerField(default=3)
    description = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=[
        ("REPORTED", "Reported"),
        ("IN_PROGRESS", "In Progress"),
        ("DONE", "Done"),
        ("REJECTED", "Rejected"),
    ], default="REPORTED")
    image = models.ImageField(upload_to='potholes/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null =True)
