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


class DisableCSRFCheckForAPIMiddleware:
    """
    Middleware para isentar rotas /api/ da verificação CSRF
    APIs REST usam JWT para autenticação, então CSRF não é necessário
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Se a rota começar com /api/, marca como isenta de CSRF
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        
        response = self.get_response(request)
        return response
