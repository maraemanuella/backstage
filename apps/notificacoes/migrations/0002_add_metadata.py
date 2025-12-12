# Generated migration for adding metadata field to Notificacao model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notificacoes', '0001_initial'),  # Ajuste conforme necessário
    ]

    operations = [
        migrations.AddField(
            model_name='notificacao',
            name='metadata',
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text='Dados adicionais da notificação (ex: inscricao_id, evento_id)',
                verbose_name='Metadados'
            ),
        ),
    ]

