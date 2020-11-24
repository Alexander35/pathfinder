from django.db.models import JSONField
from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class PointClaster(models.Model):
    Number_lat = models.IntegerField()
    Number_lon = models.IntegerField()

    def __str__(self):
       return 'Cluster #({} {})'.format(self.Number_lat, self.Number_lon)

class Point(models.Model):
    Name = models.CharField(max_length=100, unique=True)
    Latitude = models.FloatField()
    Longitude = models.FloatField()
    PointC = models.ForeignKey(PointClaster, on_delete=models.CASCADE)

    X = models.FloatField()
    Y = models.FloatField()

    def save(self):
        self.X = self.Longitude + 200
        self.Y = self.Latitude + 200
        super(Point, self).save()

    def __str__(self):
       return '{} ({}, {})'.format(self.Name, self.Latitude, self.Longitude)

def empty_point_list():
    return dict([('point_list', []), ('point_list_x', []), ('point_list_y', [])])

class Route(models.Model):
    Name = models.CharField(max_length=100, unique=True)
    Points = models.ManyToManyField(Point)
    Order = JSONField(default=empty_point_list)
    Owner = models.ForeignKey(User, on_delete=models.CASCADE) 

    def __str__(self):
       return '{}'.format(self.Name)
