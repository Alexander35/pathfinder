from django.contrib import admin

# Register your models here.
from .models import PointClaster
from .models import Point
from .models import Route

admin.site.register(PointClaster)
admin.site.register(Point)
admin.site.register(Route)
