import {
  LayoutDashboard,
  LogOut,
  Settings,
  X,
  PlusCircle,
  AlertCircle,
  CircleHelp,
  Users,
  DollarSign,
  PartyPopper,
  ChevronDown,
  CircleArrowRight,
  CircleArrowLeft,
  Heart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";

function Modal({ isOpen, setOpenModal, user }) {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [meusEventosExpanded, setMeusEventosExpanded] = useState(false);

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
    if (user?.documento_verificado !== 'aprovado') {
      setShowAlert(true);
      return;
    }

    setOpenModal(false);
    navigate("/criar-evento");
  };

  const handleUserManagement = () => {
    setOpenModal(false);
    navigate("/user-management");
  };


  const handleAutorizarPagamento = () => {
    setOpenModal(false);
    // Redireciona para a página de gerenciar eventos onde pode selecionar o evento
    navigate("/gerenciar");
  };

  const isCredenciado = user?.documento_verificado === 'aprovado';
  const isStaff = user?.is_staff || user?.is_superuser;

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
                    Para criar eventos, você precisa fazer o credenciamento com
                    o CNPJ da sua empresa ou CPF.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAlert(false);
                        setOpenModal(false);
                        navigate("/credenciamento");
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

          <ul className="px-2 space-y-2">
            {/* Meus Eventos - Colapsável */}
            <li className="relative">
              <button
                onClick={() => setMeusEventosExpanded(!meusEventosExpanded)}
                className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-black hover:text-white hover:font-bold transition-all duration-300 w-[280px] flex items-center justify-between"
              >
                <span className="flex items-center gap-3">
                  <PartyPopper className="h-5 w-5" />
                  <span>Meus Eventos</span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${
                    meusEventosExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Submenu expandido */}
              {meusEventosExpanded && (
                <div className="bg-gray-100 rounded mx-2 mt-1 py-2 animate-in slide-in-from-top duration-200">
                  <Link
                    to="/proximos"
                    onClick={() => setOpenModal(false)}
                    className="flex items-center gap-3 px-6 py-2 text-black hover:bg-lime-300 hover:font-bold transition-all duration-300"
                  >
                    <CircleArrowRight className="h-4 w-4" />
                    <span>Futuros</span>
                  </Link>
                  <Link
                    to="/passados"
                    onClick={() => setOpenModal(false)}
                    className="flex items-center gap-3 px-6 py-2 text-black hover:bg-sky-300 hover:font-bold transition-all duration-300"
                  >
                    <CircleArrowLeft className="h-4 w-4" />
                    <span>Passados</span>
                  </Link>
                  <Link
                    to="/heart"
                    onClick={() => setOpenModal(false)}
                    className="flex items-center gap-3 px-6 py-2 text-black hover:bg-red-400 hover:text-white hover:font-bold transition-all duration-300"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Favoritos</span>
                  </Link>
                </div>
              )}
            </li>

            {/* Criar Evento */}
            <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-black hover:text-white hover:font-bold transition-all duration-300">
              <button
                onClick={handleCriarEvento}
                className="flex gap-3 items-center w-full text-left"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Criar Evento</span>
              </button>
            </li>

            {/* Dashboard - Apenas para credenciados */}
            {isCredenciado && (
              <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-black hover:text-white hover:font-bold transition-all duration-300">
                <button
                  onClick={handleDashboardClick}
                  className="flex gap-3 items-center w-full text-left"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
              </li>
            )}

            {/* Gerenciar Eventos */}
            <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-black hover:text-white hover:font-bold transition-all duration-300">
              <Link
                to="/gerenciar"
                onClick={() => setOpenModal(false)}
                className="flex gap-3 items-center"
              >
                <Settings className="h-5 w-5" />
                <span>Gerenciar Eventos</span>
              </Link>
            </li>
            
            {/* Gestão de Usuários - Apenas para staff/superuser */}
            {user && (user.is_superuser || user.is_staff) && (
              <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-gray-100 transition-colors duration-300 mb-2">
                <button
                  onClick={handleUserManagement}
                  className="flex gap-3 items-center w-full text-left"
                >
                  <Users className="h-5 w-5" />
                  <span>Gestão de Usuários</span>
                </button>
              </li>
            )}

            <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-gray-100 transition-colors duration-300 mb-2">
              <Link to="/sac" className="flex gap-3 items-center">
                <CircleHelp className="h-5 w-5" />
                <span>SAC</span>
              </Link>
            </li>
            
            {/* Autorizar Pagamento - Apenas para staff */}
            {isStaff && (
              <li className="text-black p-3 rounded mx-2 cursor-pointer hover:bg-black hover:text-white hover:font-bold transition-all duration-300">
                <button
                  onClick={handleAutorizarPagamento}
                  className="flex gap-3 items-center w-full text-left"
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Autorizar Pagamento</span>
                </button>
              </li>
            )}
          </ul>

          {/* Footer com perfil e logout */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-row items-center border-t border-gray-200 bg-white p-4">
            <button
              onClick={handleProfileClick}
              className="flex items-center flex-1 hover:bg-gray-50 rounded-lg p-2 transition-colors duration-200"
            >
              {user?.profile_photo ? (
                <img
                  src={user.profile_photo}
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
