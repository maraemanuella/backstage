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


class MediaCacheMiddleware:
    """
    Middleware para adicionar cache de longa duração em arquivos de media
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Adiciona cache apenas para arquivos de media
        if request.path.startswith('/media/'):
            # Cache de 1 ano para imagens e arquivos estáticos
            response['Cache-Control'] = 'public, max-age=31536000, immutable'
            # Permite que o navegador valide se mudou
            response['Vary'] = 'Accept-Encoding'

        return response


