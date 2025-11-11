# Generated manually on 2025-11-03 06:40

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('inscricoes', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='TransferRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('sent', 'Enviada'), ('accepted', 'Aceita'), ('denied', 'Negada'), ('cancelled', 'Cancelada')], default='sent', max_length=10)),
                ('mensagem', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('from_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transfer_requests_sent', to=settings.AUTH_USER_MODEL)),
                ('inscricao', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transfer_requests', to='inscricoes.inscricao')),
                ('to_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='transfer_requests_received', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Transferir Inscrição',
                'verbose_name_plural': 'Transfer. de Inscrição',
                'db_table': 'api_transferrequest',
            },
        ),
    ]

