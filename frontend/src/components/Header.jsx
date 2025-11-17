import { useNavigate } from "react-router-dom";
import { FaBars, FaUser } from "react-icons/fa";
import NotificationBell from "./NotificationBell";
import ScorePill from "./ScorePill";

function Header({ user, setOpenModal }) {
  const navigate = useNavigate();

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
          className="font-script text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold hover:opacity-80 transition-opacity truncate"
        >
          BACKSTAGE
        </button>
      </div>

        {user && <ScorePill />}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        {user && <NotificationBell />}
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
