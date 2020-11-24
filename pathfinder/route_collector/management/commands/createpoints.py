
from django.core.management.base import BaseCommand
from route_collector.models import Point
from route_collector.models import PointClaster
import random
import uuid

class Command(BaseCommand):

    def handle(self, *args, **options):

        for pc_lon in range(-18, 19):
            for pc_lat in range(-9, 10):
                point_c = PointClaster(
                    Number_lat=pc_lat,
                    Number_lon=pc_lon
                )
                point_c.save()

        for u in range(0, 1000):

            lat = random.uniform(-90, 90)
            lon = random.uniform(-180, 180)

            point_cl_lat = int(lat) / 10
            point_cl_lon = int(lon) / 10

            point_c = PointClaster.objects.get(
                Number_lat=point_cl_lat,
                Number_lon=point_cl_lon
            )

            point = Point(
                Name=uuid.uuid4(),
                Latitude=lat,
                Longitude=lon,
                PointC=point_c
            )
            point.save()
