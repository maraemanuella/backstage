import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import EventDescription from "./pages/EventDescription"
import RegistrationSuccess from "./pages/RegistrationSuccess"
import EventInscription from "./pages/EventInscription"
import TitleUpdater from "./components/TitleUpdater";
import PublicRoute from "./components/PublicRoute";
import Checkin from "./components/Checkin.jsx"

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
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
  );
}

export default App