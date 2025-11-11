class CrossOriginOpenerPolicyMiddleware:
    """
    Middleware para adicionar headers de Cross-Origin-Opener-Policy
    necessários para Google OAuth funcionar corretamente
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Adiciona o header COOP com valor que permite popups do Google OAuth
        response['Cross-Origin-Opener-Policy'] = 'same-origin-allow-popups'
        
        return response
