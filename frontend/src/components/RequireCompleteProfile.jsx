import { Navigate, useLocation } from "react-router-dom";
import { useProfile } from "../contexts/ProfileContext";

function RequireCompleteProfile({ children }) {
  const { isProfileComplete, loading } = useProfile();
  const location = useLocation();

  // Permitir acesso à página Home sempre, onde o modal será exibido
  const isHomePage = location.pathname === '/';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver na Home e o perfil não estiver completo, redirecionar para Home
  if (!isHomePage && !isProfileComplete) {
    return <Navigate to="/" replace />;
  }

  // Se estiver na Home, renderizar o children (que mostrará o modal se necessário)
  return children;
}

export default RequireCompleteProfile;

