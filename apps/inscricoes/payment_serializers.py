"""
payment_serializers.py
Serializers relacionados ao sistema de pagamento PIX
"""
from rest_framework import serializers


class QRCodePixSerializer(serializers.Serializer):
    """
    Serializer para retornar dados do QR Code PIX para pagamento.
    Usado na PaymentPage do frontend.
    """
    qr_code_pix = serializers.ImageField(read_only=True)
    qr_code_pix_url = serializers.SerializerMethodField()
    
    def get_qr_code_pix_url(self, obj):
        """Retorna URL absoluta do QR Code PIX"""
        request = self.context.get('request')
        if obj.qr_code_pix and request:
            return request.build_absolute_uri(obj.qr_code_pix.url)
        return None
