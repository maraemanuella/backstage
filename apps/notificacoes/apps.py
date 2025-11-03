from django.apps import AppConfig


class NotificacoesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notificacoes'
    verbose_name = 'Notificações'

    def ready(self):
        # Importa sinais para conectar receivers
        # Usa importlib para evitar problemas de import relativo durante o boot
        import importlib
        importlib.import_module('apps.notificacoes.signals')
