import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
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
import CriarEvento from "./pages/CriarEvento";

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

          {/* Check-in */}
          <Route
            path="/checkin/:id"
            element={
              <ProtectedRoute>
                <Checkin />
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

          {/* Favoritos */}
          <Route
            path="/heart"
            element={
              <ProtectedRoute>
                <HeartPage />
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

          <Route
            path="/criar-evento"
            element={
             <ProtectedRoute>
                <CriarEvento />
              </ProtectedRoute>
            }
          />

          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
  );
}

export default App;
