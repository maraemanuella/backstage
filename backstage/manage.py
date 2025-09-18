#!/usr/bin/env python3
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
<<<<<<<< HEAD:backstage/manage.py
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backstage.settings')
========
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')
>>>>>>>> de862d62fce3f76702dedd5b59054fab0eb4631d:app/manage.py
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
