import {
  ChartNoAxesColumn,
  LayoutDashboard,
  LogOut,
  Settings,
  TicketCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MeuEvento from "./MeuEvento";
import profile from "../assets/profile.png"; // Adjust the path as necessary

function Modal({ isOpen, setOpenModal, user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpa todos os dados do localStorage
    localStorage.clear();
    // Redireciona para a página de login
    navigate('/login');
  };

  const handleProfileClick = () => {
    // Fecha o modal
    setOpenModal(false);
    // Redireciona para a página de perfil
    navigate('/perfil');
  };

  const handleDashboardClick = () => {
    // Fecha o modal
    setOpenModal(false);
    // Redireciona para o dashboard
    navigate('/dashboard');
  };

  if (isOpen) {
    return (
      <div
        className="modal fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-300"
        onClick={() => setOpenModal(false)}
      >
        <div
          className="absolute top-0 left-0 w-[300px] h-[100vh] bg-white shadow-2xl animate-in slide-in-from-left duration-300 ease-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botão de fechar */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setOpenModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <ul className="px-2">
            <li className="relative mb-4">
              <MeuEvento />
            </li>

            <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-gray-100 transition-colors duration-300 mb-2">
              <button 
                onClick={handleDashboardClick}
                className="flex gap-3 items-center w-full text-left"
              >
                <LayoutDashboard className="h-5 w-5" /> 
                <span>DashBoard</span>
              </button>
            </li>

            <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-gray-100 transition-colors duration-300 mb-2">
              <a href="#" className="flex gap-3 items-center">
                <TicketCheck className="h-5 w-5" /> 
                <span>Check-in</span>
              </a>
            </li>

            <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-gray-100 transition-colors duration-300 mb-2">
              <a href="#" className="flex gap-3 items-center">
                <ChartNoAxesColumn className="h-5 w-5" /> 
                <span>Painel Financeiro</span>
              </a>
            </li>

            <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-gray-100 transition-colors duration-300 mb-2">
              <a href="#" className="flex gap-3 items-center">
                <Settings className="h-5 w-5" /> 
                <span>Configurações</span>
              </a>
            </li>
          </ul>

          {/* Footer com perfil e logout */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-row items-center border-t border-gray-200 bg-white p-4">
            <button
              onClick={handleProfileClick}
              className="flex items-center flex-1 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
            >
              {user?.profile_photo ? (
                <img
                  src={`http://localhost:8000${user.profile_photo}`}
                  alt="Foto de perfil"
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              <div 
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                style={{ display: user?.profile_photo ? 'none' : 'flex' }}
              >
                <span className="text-gray-500 text-sm font-semibold">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>

              <span className="ml-3 text-sm font-medium text-gray-700">
                {user?.username || 'Usuário'}
              </span>
            </button>

            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors duration-300"
              aria-label="Logout"
              title="Fazer logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default Modal;
