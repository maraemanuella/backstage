from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao
from apps.notificacoes.models import Notificacao


class Command(BaseCommand):
    help = "Envia lembretes de eventos próximos (horas e minutos)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Não cria notificações, apenas simula",
        )

    def handle(self, *args, **options):
        dry_run = options.get("dry_run", False)
        now = timezone.now()
        
        # Definir intervalos de tempo para notificar
        intervals = [
            (timedelta(hours=12), "12 horas", "🕐 Faltam 12 horas!"),
            (timedelta(hours=1), "1 hora", "⏰ Falta 1 hora!"),
            (timedelta(minutes=30), "30 minutos", "⚡ Faltam apenas 30 minutos!"),
        ]
        
        total_created = 0
        
        for delta, label, titulo_base in intervals:
            # Janela de tempo (±5 minutos para capturar o evento)
            start_time = now + delta - timedelta(minutes=5)
            end_time = now + delta + timedelta(minutes=5)
            
            # Buscar eventos que começam nesse intervalo
            eventos = Evento.objects.filter(
                data_evento__range=(start_time, end_time),
                status__in=["publicado", "em_andamento"],
            )
            
            self.stdout.write(
                self.style.MIGRATE_HEADING(
                    f"\n[Lembretes] {label} antes do evento"
                )
            )
            self.stdout.write(f"Encontrados {eventos.count()} evento(s)")
            
            for evento in eventos:
                # Buscar inscritos confirmados
                inscricoes = Inscricao.objects.filter(
                    evento=evento, 
                    status="confirmada"
                ).select_related("usuario")
                
                self.stdout.write(
                    f" - {evento.titulo}: {inscricoes.count()} inscritos confirmados"
                )
                
                bulk = []
                for insc in inscricoes:
                    usuario = insc.usuario
                    
                    # Evitar duplicatas: uma notificação por usuário/evento/intervalo hoje
                    exists = Notificacao.objects.filter(
                        usuario=usuario,
                        tipo="evento_proximo",
                        titulo__contains=titulo_base.split()[0],  # Verificar pelo emoji/texto inicial
                        link=f"/evento/{evento.id}",
                        created_at__date=timezone.localdate(now),
                    ).exists()
                    
                    if exists:
                        continue
                    
                    mensagem = (
                        f'{titulo_base} O evento "{evento.titulo}" começa em breve. '
                        f'Prepare-se e não perca!'
                    )
                    
                    notif = Notificacao(
                        usuario=usuario,
                        tipo="evento_proximo",
                        titulo=titulo_base,
                        mensagem=mensagem,
                        link=f"/evento/{evento.id}",
                        lida=False,
                    )
                    bulk.append(notif)
                
                if bulk:
                    if dry_run:
                        self.stdout.write(
                            self.style.WARNING(
                                f"   Criaria {len(bulk)} notificações"
                            )
                        )
                    else:
                        Notificacao.objects.bulk_create(bulk)
                        total_created += len(bulk)
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"   Criadas {len(bulk)} notificações"
                            )
                        )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    "\nSimulação completa. Nenhuma notificação foi criada."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f"\nConcluído. Total de notificações criadas: {total_created}"
                )
            )
