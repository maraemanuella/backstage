import { useNavigate } from "react-router-dom";
import { FaBars, FaUser } from "react-icons/fa";

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

  const getProfilePhotoUrl = (photo) => {
    if (!photo) return null;
    const baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    return photo.startsWith('http') ? photo : `${baseURL}${photo}`;
  };

  const renderProfilePhoto = () => {
    if (user?.profile_photo) {
      return (
        <img
          src={getProfilePhotoUrl(user.profile_photo)}
          alt="Foto de perfil"
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
          loading="eager"
          onError={(e) => e.target.src = ''}
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-100">
        <FaUser className="text-gray-400 text-lg" />
      </div>
    );
  };

  return (
    <header className="flex justify-between items-center w-full border-b border-gray-200 h-[80px] px-6 md:px-12 lg:px-24">
      <div className="flex items-center gap-4">
        {user && setOpenModal && (
          <button
            className="flex items-center justify-center hover:bg-gray-100 p-2 rounded-lg transition-colors"
            onClick={handleMenuClick}
            aria-label="Menu"
          >
            <FaBars className="text-xl text-gray-600" />
          </button>
        )}
        
        <h1 className="font-script text-3xl md:text-4xl font-bold">
          BACKSTAGE
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <button
            className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            onClick={handleProfileClick}
            aria-label="Ver Perfil"
          >
            {renderProfilePhoto()}
            <span className="font-medium text-sm text-gray-800 hidden sm:inline">
              {user.username}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
