import { useNavigate, useLocation } from "react-router-dom";
import { FaBars, FaUser } from "react-icons/fa";
import NotificationBell from "./NotificationBell";
import ScorePill from "./ScorePill";
import { useState, useEffect } from "react";
import api from "../api";


function Header({ user, setOpenModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifiedOrganizer, setIsVerifiedOrganizer] = useState(false);
  const [hasEvents, setHasEvents] = useState(false);

  // Verificar se o usuário é organizador verificado
  useEffect(() => {
    const checkOrganizerStatus = async () => {
      if (!user) return;

      try {
        // Verifica se o documento está aprovado
        const isVerified = user.documento_verificado === 'aprovado';
        setIsVerifiedOrganizer(isVerified);

        // Verifica se tem eventos criados
        if (isVerified) {
          const response = await api.get('/api/eventos/meus-eventos/');
          setHasEvents(response.data && response.data.length > 0);
        }
      } catch (error) {
        console.error('Erro ao verificar status de organizador:', error);
      }
    };

    checkOrganizerStatus();
  }, [user]);

  // Função para prefetch de páginas (otimização)
  const prefetchPage = (page) => {
    // Implementação simples ou vazia por enquanto
    console.log('Prefetching:', page);
  };

  const handleProfileClick = () => {
    navigate('/perfil');
  };

  const handleMenuClick = () => {
    if (setOpenModal) {
      setOpenModal(true);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const getProfilePhotoUrl = (photo) => {
    if (!photo) return null;
    return photo.startsWith('http') ? photo : photo;
  };

  const renderProfilePhoto = () => {
    if (user?.profile_photo) {
      return (
        <img
          src={getProfilePhotoUrl(user.profile_photo)}
          alt="Foto de perfil"
          className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover border-2 border-gray-100"
          loading="eager"
          onError={(e) => e.target.src = ''}
        />
      );
    }
    return (
      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-100">
        <FaUser className="text-gray-400 text-sm sm:text-base md:text-lg" />
      </div>
    );
  };

  return (
    <header className="flex justify-between items-center w-full border-b border-gray-200 h-[60px] sm:h-[70px] md:h-[80px] px-3 sm:px-6 md:px-12 lg:px-24">
      {/* Logo e Menu */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
        {user && setOpenModal && (
          <button
            className="flex items-center justify-center hover:bg-gray-100 p-1.5 sm:p-2 rounded-lg transition-colors flex-shrink-0"
            onClick={handleMenuClick}
            aria-label="Menu"
          >
            <FaBars className="text-lg sm:text-xl text-gray-600" />
          </button>
        )}

        <button
          onClick={handleLogoClick}
          className="font-poppins text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold hover:opacity-80 transition-opacity truncate cursor-pointer"
        >
          BACKSTAGE
        </button>
      </div>

      {/* Links de Navegação Central */}
      {user && (
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-3xl mx-8">
          {/* Página Principal */}
          <button
            onClick={() => navigate('/')}
            onMouseEnter={() => prefetchPage('home')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActiveLink('/') 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Início
          </button>

          {/* Meus Eventos */}
          <button
            onClick={() => navigate('/meus-eventos')}
            onMouseEnter={() => prefetchPage('meus-eventos')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActiveLink('/meus-eventos') 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Meus Eventos
          </button>

          {/* Dashboard (só aparece se for organizador verificado com eventos) */}
          {isVerifiedOrganizer && hasEvents && (
            <button
              onClick={() => navigate('/dashboard')}
              onMouseEnter={() => prefetchPage('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActiveLink('/dashboard') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
          )}

          {/* Criar Evento ou Quero Ser Organizador */}
          {isVerifiedOrganizer ? (
            <button
              onClick={() => navigate('/criar-evento')}
              onMouseEnter={() => prefetchPage('criar-evento')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActiveLink('/criar-evento') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Criar Evento
            </button>
          ) : (
            <button
              onClick={() => navigate('/verificar-documento')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActiveLink('/verificar-documento') 
                  ? 'bg-gray-900 text-white' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Criar Eventos
            </button>
          )}
        </nav>
      )}

      {/* Ações do Usuário */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        {user && <NotificationBell />}
        {user && <ScorePill />}
        {user && (
          <button
            className="flex items-center gap-2 hover:bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors"
            onClick={handleProfileClick}
            aria-label="Ver Perfil"
          >
            {renderProfilePhoto()}
            <span className="font-medium text-xs sm:text-sm text-gray-800 hidden md:inline max-w-[100px] lg:max-w-none truncate">
              {user.username}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
