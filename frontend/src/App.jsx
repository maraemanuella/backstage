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
import RegistrationSuccess from "./pages/RegistrationSuccess";
import EventInscription from "./pages/EventInscription";
import TitleUpdater from "./components/TitleUpdater";
import PublicRoute from "./components/PublicRoute";
import Checkin from "./components/Checkin.jsx"
import HeartPage from "./pages/HeartPage";
import SolicitarTransferencia from "./pages/SolicitarTransferencia";
import AceitarOferta from "./pages/AceitarOferta";

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
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

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
        <Route path="/evento/:eventId" element={<EventDescription />} />
        <Route path="/inscricao/:eventId" element={<EventInscription />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/evento" element={<EventDescription />} />
        <Route path="/evento/:eventId" element={<EventDescription />} />
        <Route path="/inscricao/:eventId" element={<EventInscription />} />
        <Route path="/transferir-inscricao" element={
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
        <Route
          path="/inscricao-realizada/:registrationId"
          element={
            <ProtectedRoute>
              <RegistrationSuccess />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />

        <Route path="/checkin/:id" element={<Checkin />} />


      </Routes>
    </BrowserRouter>

        <Route
          path="/heart"
          element={
            <ProtectedRoute>
              <HeartPage />
            </ProtectedRoute>
          }
        />

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
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
    </FavoritesProvider>
  );
}

export default App;
