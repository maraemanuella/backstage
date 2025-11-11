from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, date, time as dtime, timedelta

from apps.eventos.models import Evento
from apps.inscricoes.models import Inscricao
from apps.notificacoes.models import Notificacao


class Command(BaseCommand):
    help = "Send 'evento_proximo' notifications to confirmed attendees X days before the event."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            nargs="+",
            type=int,
            default=[2, 1, 0],
            help="List of days before the event to notify (e.g., --days 2 1 0)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Do not create notifications, only print what would happen",
        )

    def handle(self, *args, **options):
        days_list = sorted(set(options["--days"])) if "--days" in options else options["days"]
        dry_run = options.get("dry_run", False)

        now = timezone.now()
        tz = timezone.get_current_timezone()

        total_created = 0
        for days in days_list:
            target_local_date = timezone.localdate(now) + timedelta(days=days)
            start_dt = timezone.make_aware(datetime.combine(target_local_date, dtime.min), tz)
            end_dt = timezone.make_aware(datetime.combine(target_local_date, dtime.max), tz)

            eventos = Evento.objects.filter(
                data_evento__range=(start_dt, end_dt),
                status__in=["publicado", "em_andamento"],
            )

            self.stdout.write(self.style.MIGRATE_HEADING(f"\n[Reminders] {days} day(s) before: {target_local_date.isoformat()}"))
            self.stdout.write(f"Found {eventos.count()} event(s)")

            for evento in eventos:
                # confirmed attendees
                inscricoes = Inscricao.objects.filter(evento=evento, status="confirmada").select_related("usuario")
                self.stdout.write(f" - {evento.titulo}: {inscricoes.count()} confirmed")

                bulk = []
                for insc in inscricoes:
                    usuario = insc.usuario
                    # Avoid duplicates: one reminder per user/event/day per run-day
                    exists = Notificacao.objects.filter(
                        usuario=usuario,
                        tipo="evento_proximo",
                        link=f"/evento/{evento.id}",
                        created_at__date=timezone.localdate(now),
                    ).exists()
                    if exists:
                        continue

                    msg = self._mensagem(evento, days)
                    notif = Notificacao(
                        usuario=usuario,
                        tipo="evento_proximo",
                        titulo="Evento próximo",
                        mensagem=msg,
                        link=f"/evento/{evento.id}",
                        lida=False,
                    )
                    bulk.append(notif)

                if bulk:
                    if dry_run:
                        self.stdout.write(self.style.WARNING(f"   Would create {len(bulk)} notifications"))
                    else:
                        Notificacao.objects.bulk_create(bulk)
                        total_created += len(bulk)
                        self.stdout.write(self.style.SUCCESS(f"   Created {len(bulk)} notifications"))

        if dry_run:
            self.stdout.write(self.style.WARNING("\nDry-run complete. No notifications were created."))
        else:
            self.stdout.write(self.style.SUCCESS(f"\nDone. Total notifications created: {total_created}"))

    @staticmethod
    def _mensagem(evento: Evento, days: int) -> str:
        if days <= 0:
            return f'O evento "{evento.titulo}" é hoje!'
        if days == 1:
            return f'O evento "{evento.titulo}" é amanhã! Não se esqueça.'
        return f'O evento "{evento.titulo}" acontece em {days} dias.'
