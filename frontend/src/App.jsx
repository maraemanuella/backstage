import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";
import { ProfileProvider } from "./contexts/ProfileContext.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireCompleteProfile from "./components/RequireCompleteProfile";
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
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
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
      <ProfileProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <TitleUpdater />
            <Routes>
            {/* Página inicial */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RequireCompleteProfile>
                    <Home />
                  </RequireCompleteProfile>
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
                <RequireCompleteProfile>
                  <EventInscription />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inscricao-realizada/:registrationId"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <RegistrationSuccess />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />
          
          {/* Pagamento */}
          <Route
            path="/pagamento/:inscricaoId"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <PaymentPage />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Stripe payment success */}
          <Route
            path="/payment/success"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <PaymentSuccessPage />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Stripe payment cancel */}
          <Route
            path="/payment/cancel"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <PaymentCancelPage />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Sucesso da inscrição */}
          <Route
            path="/inscricoes/sucesso"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <InscriptionSuccess />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Gerenciar pagamentos (organizador) */}
          <Route
            path="/eventos/:eventoId/gerenciar-pagamentos"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <GerenciarPagamentos />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Check-in */}
          <Route
            path="/checkin/:id"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <Checkin />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkin/scan/:eventoId?"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <ScanCheckin />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Transferências */}
          <Route
            path="/transferir-inscricao"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <SolicitarTransferencia />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ofertas-transferencia"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <AceitarOferta />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Perfil */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <Profile />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil/editar"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <EditProfile />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Notificações */}
          <Route
            path="/notificacoes"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <Notifications />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Verificação de Documento */}
          <Route
            path="/verificar-documento"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <VerificarDocumento />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Favoritos */}
          <Route
            path="/heart"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <HeartPage />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Meus Eventos - Página Unificada */}
          <Route
            path="/meus-eventos"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <MeusEventos />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          <Route
            path="/proximos"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <ProximosEventos />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          <Route
            path="/passados"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <EventosPassados />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Dashboard do Organizador */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <DashboardOrganizador />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />
          
          {/* Criar Evento */}
          <Route
            path="/criar-evento"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <CriarEvento />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Analytics do Evento */}
          <Route
            path="/evento/:eventoId/analytics"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <EventoAnalytics />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />
          
          {/* Gerenciamento */}
          <Route
            path="/gerenciar"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <ManageEvent />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* SAC */}
          <Route
            path="/sac"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <Sac />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Gestão de Usuários (apenas para administradores) */}
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <UserManagement />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Editar Eventos */}
          <Route
            path="/gerenciar/editar/:id"
            element={
              <ProtectedRoute>
                <RequireCompleteProfile>
                  <EditEvent />
                </RequireCompleteProfile>
              </ProtectedRoute>
            }
          />

          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
      </ProfileProvider>
    </GoogleOAuthProvider>
  );
}

export default App;