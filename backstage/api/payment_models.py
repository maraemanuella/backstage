"""
payment_models.py
Modelos relacionados ao sistema de pagamento PIX
Separado para evitar conflitos de merge

⚠️ NOTA IMPORTANTE:
Estes mixins foram criados para futura refatoração e modularização.
Atualmente, os campos de pagamento ainda estão definidos diretamente em:
- models.py → Evento.qr_code_pix
- models.py → Inscricao.metodo_pagamento, status_pagamento

PARA USAR ESTES MIXINS NO FUTURO:
1. Remover campos de pagamento de models.py (Evento e Inscricao)
2. Adicionar herança dos mixins:
   - class Evento(QRCodePixMixin, models.Model): ...
   - class Inscricao(PaymentMixin, models.Model): ...
3. Criar e rodar migrations: python manage.py makemigrations && python manage.py migrate
4. Testar todas as funcionalidades de pagamento

Por enquanto, mantidos para evitar migrations durante merge.
Data de criação: 03/11/2025
"""
from django.db import models


class PaymentMixin(models.Model):
    """
    Mixin para adicionar campos de pagamento a modelos.
    Uso: class MinhaModel(PaymentMixin, models.Model)
    """
    
    # Choices para método de pagamento (atualmente apenas PIX)
    METODO_PAGAMENTO_CHOICES = [
        ('pix', 'PIX'),
    ]

    # Choices para status de pagamento
    STATUS_PAGAMENTO_CHOICES = [
        ('pendente', 'Pendente'),     # Aguardando pagamento
        ('aprovado', 'Aprovado'),     # Pagamento confirmado
        ('rejeitado', 'Rejeitado'),   # Pagamento não aprovado
        ('reembolsado', 'Reembolsado'), # Valor reembolsado
    ]
    
    # Dados de pagamento
    metodo_pagamento = models.CharField(
        max_length=20, 
        choices=METODO_PAGAMENTO_CHOICES, 
        default='pix',
        help_text="Método de pagamento utilizado (padrão: PIX)"
    )
    status_pagamento = models.CharField(
        max_length=20, 
        choices=STATUS_PAGAMENTO_CHOICES, 
        default='pendente',
        help_text="Status atual do pagamento da inscrição"
    )
    
    class Meta:
        abstract = True


class QRCodePixMixin(models.Model):
    """
    Mixin para adicionar campo de QR Code PIX a eventos.
    Permite upload de imagem do QR Code para pagamento.
    """
    
    qr_code_pix = models.ImageField(
        upload_to='eventos/qrcodes_pix/', 
        blank=True, 
        null=True,
        help_text="QR Code PIX para pagamento das inscrições do evento"
    )
    
    class Meta:
        abstract = True
