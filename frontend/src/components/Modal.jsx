import {
  ChartNoAxesColumn,
  LayoutDashboard,
  LogOut,
  Settings,
  TicketCheck,
  X,
  PlusCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import MeuEvento from "./MeuEvento";
import { useState } from 'react';
import profile from "../assets/profile.png"; // Adjust the path as necessary

function Modal({ isOpen, setOpenModal, user }) {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  const handleLogout = () => {
    // Limpa todos os dados do localStorage
    localStorage.clear();
    // Redireciona para a página de login
    navigate("/login");
  };

  const handleProfileClick = () => {
    // Fecha o modal
    setOpenModal(false);
    // Redireciona para a página de perfil
    navigate("/perfil");
  };

  const handleDashboardClick = () => {
    // Fecha o modal
    setOpenModal(false);
    // Redireciona para o dashboard
    navigate("/dashboard");
  };

  const handleCriarEvento = () => {
    
    if (!user?.documento_verificado) {
      setShowAlert(true); 
      return;
    }
    
    setOpenModal(false);
    navigate('/criar-evento');
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

          {showAlert && (
            <div className="mx-4 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg animate-in slide-in-from-top duration-300">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 text-sm mb-1">
                    Credenciamento Necessário
                  </h3>
                  <p className="text-xs text-amber-800 leading-relaxed mb-3">
                    Para criar eventos, você precisa fazer o credenciamento com o CNPJ da sua empresa ou CPF.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAlert(false);
                        setOpenModal(false);
                        navigate('/credenciamento');
                      }}
                      className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition-colors"
                    >
                      Fazer Agora
                    </button>
                    <button
                      onClick={() => setShowAlert(false)}
                      className="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 text-xs font-medium rounded hover:bg-amber-50 transition-colors"
                    >
                      Depois
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ul className="px-2">
            <li className="relative mb-4">
              <MeuEvento />
            </li>

            <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-black hover:text-white transition-colors duration-300 mb-2">
              <button 
                onClick={handleCriarEvento}
                className="flex gap-3 items-center w-full text-left"

              >
                <PlusCircle className="h-5 w-5" /> 
                <span>Criar Evento</span>
              </button>
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

            <li className="ml-2 text-black p-1 rounded w-[280px] shadow-7xl cursor-pointer mt-4 hover:bg-black  hover:text-white transition-colors duration-300">
              <Link to="/gerenciar" className="flex gap-1 items-center">
                <Settings className="h-5 w-5 ml-2" /> Gerenciar eventos
              </Link>
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
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}

              <div
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
                style={{ display: user?.profile_photo ? "none" : "flex" }}
              >
                <span className="text-gray-500 text-sm font-semibold">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>

              <span className="ml-3 text-sm font-medium text-gray-700">
                {user?.username || "Usuário"}
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
