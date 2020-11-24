from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.authtoken.models import Token
from .models import Point
from .models import Route
from .serializers import UserSerializer
from .serializers import PointSerializer
from .serializers import RouteSerializer
from amqp_handler import AMQPHandler
import asyncio
import json
import uuid

@api_view(["GET"])
@permission_classes((AllowAny,))
def report(request):
    report_data = {}
    try:
        routs = Route.objects.all()

        for r in routs:
            owner_str = str(r.Owner)

            report_data[owner_str] = report_data.get(owner_str, {}) 
            report_data[owner_str]['total_points'] = report_data[owner_str].get('total_points', 0)
            report_data[owner_str]['total_routs'] = report_data[owner_str].get('total_routs', 0)

            route_len = len(r.Order['point_list'])

            report_data[owner_str][r.Name] = route_len
            report_data[owner_str]['total_points'] = report_data[owner_str]['total_points'] + route_len
            report_data[owner_str]['total_routs'] = report_data[owner_str]['total_routs'] + 1

        return Response(report_data)

    except Exception as e:
        return Response({"An error occured when retrieving the report" : '{}'.format(e)},
                status=status.HTTP_412_PRECONDITION_FAILED)

# Create your views here.
@api_view(["POST"])
@permission_classes((AllowAny,))
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    if username is None or password is None:
        return Response({'error': 'Please provide both username and password'},
                        status=status.HTTP_400_BAD_REQUEST)
    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid Credentials'},
                        status=status.HTTP_404_NOT_FOUND)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key },
                    status=status.HTTP_200_OK)

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-date_joined')
    lookup_field = 'username'

    def list(self, request):
        serializer = self.get_serializer(self.queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, username=None):
        self.queryset = User.objects.get(username=username)
        serializer = self.get_serializer([self.queryset], many=True)
        return Response(serializer.data)

class PointViewSet(viewsets.ModelViewSet):
    queryset = Point.objects.all().order_by('Name')
    serializer_class = PointSerializer
    lookup_field = 'Name'

    def list(self, request):
        self.queryset = Point.objects.all().order_by('Name')
        serializer = self.get_serializer(self.queryset, many=True)
        return Response(serializer.data)

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all().order_by('Name')
    serializer_class = RouteSerializer
    lookup_field = 'Name'

    def list(self, request):
        self.queryset = Route.objects.all().order_by('Name')
        serializer = self.get_serializer(self.queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        try:
            route_name = request.data.get('Name', str(uuid.uuid4()))
            owner_name = request.data.get('Owner')
            start_point_name = request.data['Start_Point_Name']
            end_point_name = request.data['End_Point_Name']

            create_route_msg = {
                'route_name': route_name,
            }

            owner = User.objects.get(username=owner_name)

            start_point = Point.objects.get(Name=start_point_name)
            end_point = Point.objects.get(Name=end_point_name)

            route = Route(Name=route_name, Owner=owner)
            route.save()

            route.Points.add(start_point)
            route.Points.add(end_point)

            current_order = route.Order
            current_order['point_list'].append(start_point.pk)
            current_order['point_list'].append(end_point.pk)
            current_order['point_list_x'].append(start_point.X)
            current_order['point_list_y'].append(start_point.Y)
            current_order['point_list_x'].append(end_point.X)
            current_order['point_list_y'].append(end_point.Y)

            route.save()


            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            AMQPH = AMQPHandler(loop)

            loop.run_until_complete(AMQPH.connect(amqp_connect_string=settings.RMQ_HOST))
            loop.run_until_complete(
                AMQPH.send(
                    settings.RMQ_ROUTE_CREATOR_EXCHANGE,
                    settings.RMQ_ROUTE_CREATOR_QUEUE_IN,
                    json.dumps(create_route_msg)
                )
            )

            loop.close()

            return Response({True: "Request for creating new route sent"})
        except Exception as e:
            return Response({False: "Route didn't created, {}".format(e)},
                    status=status.HTTP_412_PRECONDITION_FAILED)
