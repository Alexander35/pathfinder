from django.contrib.auth.models import User, Group
from rest_framework import serializers

from .models import Point
from .models import Route


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', ]

class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = ['Name', 'Latitude', 'Longitude', 'X', 'Y']

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['Name', 'Points', 'Order', 'Owner']