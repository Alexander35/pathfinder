from amqp_handler import AMQPHandler
import asyncio
import json
import logging
import json
import os
import django
import sys
from random import choice
from asgiref.sync import sync_to_async

sys.path.append("..")

import pathfinder 

os.environ['DJANGO_SETTINGS_MODULE'] = 'pathfinder.settings'
django.setup()

from route_collector.models import Route
from route_collector.models import Point
from route_collector.models import PointClaster

logger = logging.getLogger('route_creator')
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
bf = logging.Formatter('{asctime} {name} {levelname:8s} {message}', style='{')
handler.setFormatter(bf)
logger.addHandler(handler)

config = {}

config['rmq_host'] = os.environ.get('RMQ_HOST', 'amqp://guest:guest@127.0.0.1:5672')
config['rmq_exchange'] = os.environ.get('RMQ_ROUTE_CREATOR_EXCHANGE', 'rmq_route_creator_exchange')
config['rmq_queue_in'] = os.environ.get('RMQ_ROUTE_CREATOR_QUEUE_IN', 'rmq_route_creator_queue_in')

@sync_to_async
def make_route(route_name):

    route = Route.objects.get(Name=route_name)

    point_a_pk = route.Order['point_list'][0]
    point_b_pk = route.Order['point_list'][1]

    point_a = Point.objects.get(pk=point_a_pk)
    point_b = Point.objects.get(pk=point_b_pk)

    lon_a = int(point_a.Longitude)
    lon_b = int(point_b.Longitude)

    lat_a = point_a.Latitude
    lat_b = point_b.Latitude


    if (lon_a < lon_b):
        start_p = lon_a
        end_p = lon_b
    else:
        start_p = lon_b
        end_p = lon_a

    for p in range(start_p, end_p):
        y = ((lat_b - lat_a) / (end_p - start_p )) * (p - start_p) + lat_a

        claster = PointClaster.objects.get(Number_lat=y/10, Number_lon=p/10)

        points = Point.objects.filter(PointC=claster)
        
        if len(points) != 0:

            point = choice(points)
            route.Points.add(point)
            current_order = route.Order
            current_order['point_list'].append(point.Name)
            current_order['point_list_x'].append(point.X)
            current_order['point_list_y'].append(point.Y)

            route.save()

    return route

async def rmq_msg_proc(msg):

    route_msg = json.loads(msg)
    route_name = route_msg['route_name']

    logger.info('Creating {} route'.format(route_name))

    try:
        route = await make_route(route_name)

        logger.info('Route {} created'.format(route))

        return (True, None)
    except Exception as e:
        logger.error('Route did not created {}'.format(e))
        return (False, None)

def main():

    logger.info('=== Activating route_creator service ===')
    
    loop = asyncio.get_event_loop()

    AMQPH = AMQPHandler(loop)

    loop.run_until_complete(AMQPH.connect(amqp_connect_string=config['rmq_host']))

    loop.run_until_complete(
        AMQPH.receive(
            config['rmq_exchange'], 
            config['rmq_queue_in'], 
            awaitable_msg_proc_func=rmq_msg_proc
        )
    )
    loop.close()

if __name__ == '__main__':
    main()
