import os
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):

    def handle(self, *args, **options):
        if User.objects.count() == 0:

            IP_VLAN_KEEPER_ADMIN_NAME = os.environ.get('IP_VLAN_KEEPER_ADMIN_NAME', 'admin')
            IP_VLAN_KEEPER_ADMIN_EMAIL = os.environ.get('IP_VLAN_KEEPER_ADMIN_EMAIL', 'ad@m.in')
            IP_VLAN_KEEPER_ADMIN_PASSWORD = os.environ.get('IP_VLAN_KEEPER_ADMIN_PASSWORD', 'admin')
            
            superuser = User.objects.create_superuser(
                username=IP_VLAN_KEEPER_ADMIN_NAME,
                email=IP_VLAN_KEEPER_ADMIN_EMAIL,
                password=IP_VLAN_KEEPER_ADMIN_PASSWORD)

            superuser.save()

            for u in range(1,5):
                
                user = User(
                    first_name='First' + str(u),
                    is_staff=1,
                    is_superuser=0,
                    last_name='Last' + str(u),
                    username='user' + str(u),
                )
                user.set_password('user12345')
                user.save()


        else:
            print('Users accounts can only be initialized if no Accounts exist')