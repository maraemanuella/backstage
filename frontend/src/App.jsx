import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";
import EventDescription from "./pages/EventDescription";
import Waitlist from "./pages/Waitlist";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import EventInscription from "./pages/EventInscription";
import TitleUpdater from "./components/TitleUpdater";
import PublicRoute from "./components/PublicRoute";
import Checkin from "./components/Checkin.jsx";
import HeartPage from "./pages/HeartPage";
import SolicitarTransferencia from "./pages/SolicitarTransferencia";
import AceitarOferta from "./pages/AceitarOferta";
import ProximosEventos from "./pages/ProximosEventos";
import EventosPassados from "./pages/EventosPassados";
import DashboardOrganizador from "./pages/DashboardOrganizador";
import ScanCheckin from "./pages/ScanChekin.jsx";
import VerificarDocumento from "./pages/VerificarDocumento";
import ManageEvent from "./pages/ManageEvent";
import EditEvent from "./pages/EditEvent.jsx";
import CriarEvento from "./pages/CriarEvento";
import EventoAnalytics from "./pages/EventoAnalytics";
import Sac from "./pages/Sac.jsx";
import UserManagement from "./pages/UserManagement";
import PaymentPage from "./pages/PaymentPage";
import InscriptionSuccess from "./pages/InscriptionSuccess";
import GerenciarPagamentos from "./pages/GerenciarPagamentos";
import MeusEventos from "./pages/MeusEventos";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <FavoritesProvider>
        <BrowserRouter>
          <TitleUpdater />
          <Routes>
          {/* Página inicial */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Rotas públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterAndLogout />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:uid/:token"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
          />
          <Route path="/logout" element={<Logout />} />

          {/* Eventos */}
          <Route path="/evento/:eventId" element={<EventDescription />} />
          <Route path="/evento/:eventId/waitlist" element={<Waitlist />} />
          <Route
            path="/inscricao/:eventId"
            element={
              <ProtectedRoute>
                <EventInscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inscricao-realizada/:registrationId"
            element={
              <ProtectedRoute>
                <RegistrationSuccess />
              </ProtectedRoute>
            }
          />
          
          {/* Pagamento */}
          <Route
            path="/pagamento/:inscricaoId"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          
          {/* Sucesso da inscrição */}
          <Route
            path="/inscricoes/sucesso"
            element={
              <ProtectedRoute>
                <InscriptionSuccess />
              </ProtectedRoute>
            }
          />

          {/* Gerenciar pagamentos (organizador) */}
          <Route
            path="/eventos/:eventoId/gerenciar-pagamentos"
            element={
              <ProtectedRoute>
                <GerenciarPagamentos />
              </ProtectedRoute>
            }
          />

          {/* Check-in */}
          <Route
            path="/checkin/:id"
            element={
              <ProtectedRoute>
                <Checkin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkin/scan/:eventoId?"
            element={
              <ProtectedRoute>
                <ScanCheckin />
              </ProtectedRoute>
            }
          />

          {/* Transferências */}
          <Route
            path="/transferir-inscricao"
            element={
              <ProtectedRoute>
                <SolicitarTransferencia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ofertas-transferencia"
            element={
              <ProtectedRoute>
                <AceitarOferta />
              </ProtectedRoute>
            }
          />

          {/* Perfil */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil/editar"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Notificações */}
          <Route
            path="/notificacoes"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* Verificação de Documento */}
          <Route
            path="/verificar-documento"
            element={
              <ProtectedRoute>
                <VerificarDocumento />
              </ProtectedRoute>
            }
          />

          {/* Favoritos */}
          <Route
            path="/heart"
            element={
              <ProtectedRoute>
                <HeartPage />
              </ProtectedRoute>
            }
          />

          {/* Meus Eventos - Página Unificada */}
          <Route
            path="/meus-eventos"
            element={
              <ProtectedRoute>
                <MeusEventos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/proximos"
            element={
              <ProtectedRoute>
                <ProximosEventos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/passados"
            element={
              <ProtectedRoute>
                <EventosPassados />
              </ProtectedRoute>
            }
          />

          {/* Dashboard do Organizador */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardOrganizador />
              </ProtectedRoute>
            }
          />
          
          {/* Criar Evento */}
          <Route
            path="/criar-evento"
            element={
              <ProtectedRoute>
                <CriarEvento />
              </ProtectedRoute>
            }
          />

          {/* Analytics do Evento */}
          <Route
            path="/evento/:eventoId/analytics"
            element={
              <ProtectedRoute>
                <EventoAnalytics />
              </ProtectedRoute>
            }
          />
          
          {/* Gerenciamento */}
          <Route
            path="/gerenciar"
            element={
              <ProtectedRoute>
                <ManageEvent />
              </ProtectedRoute>
            }
          />

          {/* SAC */}
          <Route
            path="/sac"
            element={
              <ProtectedRoute>
                <Sac />
              </ProtectedRoute>
            }
          />

          {/* Gestão de Usuários (apenas para administradores) */}
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          {/* Editar Eventos */}
          <Route
            path="/gerenciar/editar/:id"
            element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>
            }
          />

          {/* Criar Evento */}
          <Route
            path="/criar-evento"
            element={
              <ProtectedRoute>
                <CriarEvento />
              </ProtectedRoute>
            }
          />

          {/* Analytics do Evento */}
          <Route
            path="/evento/:eventoId/analytics"
            element={
              <ProtectedRoute>
                <EventoAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
    </GoogleOAuthProvider>
  );
}

export default App;