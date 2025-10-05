import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FavoritesProvider } from "./contexts/FavoritesContext.jsx";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import EventDescription from "./pages/EventDescription";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import EventInscription from "./pages/EventInscription";
import TitleUpdater from "./components/TitleUpdater";
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

        <Route
          path="/heart"
          element={
            <ProtectedRoute>
              <HeartPage />
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
