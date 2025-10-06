import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars, FaUser } from "react-icons/fa";
import api from "../api";

function Header({ user, setOpenModal }) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    // Sempre navegar para o perfil em vez de abrir modal
    navigate('/perfil');
  };

  const handleMenuClick = () => {
    // Abrir modal/sidebar se a função for fornecida
    if (setOpenModal) {
      setOpenModal(true);
    }
  };

  return (
    <header className="flex flex-row w-auto border-b-2 border-black/10 h-[80px]">
      <h1 className="flex flex-row justify-center items-center ml-[150px] gap-2 font-script text-[25px]">
        BACKSTAGE
      </h1>

      <div
        id="profile"
        className="flex flex-col justify-center items-center gap-2 ml-auto mr-[200px]"
      >
        {user && (
          <div className="flex items-center gap-4">
            {/* Botão do Menu/Sidebar */}
            {setOpenModal && (
              <button
                className="cursor-pointer flex items-center justify-center hover:bg-gray-100 p-2 rounded-lg transition-colors"
                onClick={handleMenuClick}
                title="Menu"
              >
                <FaBars className="text-xl text-gray-600" />
              </button>
            )}

            {/* Botão do Perfil */}
            <button
              className="cursor-pointer flex flex-col items-center hover:bg-gray-100 p-2 rounded-lg transition-colors"
              onClick={handleProfileClick}
              title="Ver Perfil"
            >
              {user.profile_photo ? (
                <img
                  src={user.profile_photo.startsWith('http') 
                    ? user.profile_photo 
                    : `http://localhost:8000${user.profile_photo}`
                  }
                  alt="Foto de perfil"
                  className="w-[50px] h-[50px] rounded-full object-cover"
                  onError={(e) => {
                    // Se der erro, substitui por ícone padrão
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-[50px] h-[50px] rounded-full bg-gray-200 flex items-center justify-center">
                  <FaUser className="text-gray-400 text-xl" />
                </div>
              )}
              <span className="mt-[0.5]">{user.username}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
