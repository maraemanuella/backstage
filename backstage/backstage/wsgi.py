"""
<<<<<<<< HEAD:backstage/backstage/wsgi.py
WSGI config for backstage project.
========
WSGI config for app project.
>>>>>>>> de862d62fce3f76702dedd5b59054fab0eb4631d:app/app/wsgi.py

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

<<<<<<<< HEAD:backstage/backstage/wsgi.py
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backstage.settings')
========
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
>>>>>>>> de862d62fce3f76702dedd5b59054fab0eb4631d:app/app/wsgi.py

application = get_wsgi_application()
