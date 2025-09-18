"""
<<<<<<<< HEAD:backstage/backstage/asgi.py
ASGI config for backstage project.
========
ASGI config for app project.
>>>>>>>> de862d62fce3f76702dedd5b59054fab0eb4631d:app/app/asgi.py

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

<<<<<<<< HEAD:backstage/backstage/asgi.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backstage.settings')
========
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
>>>>>>>> de862d62fce3f76702dedd5b59054fab0eb4631d:app/app/asgi.py

application = get_asgi_application()
