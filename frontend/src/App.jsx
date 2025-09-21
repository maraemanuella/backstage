import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import EventDescription from "./pages/EventDescription"
import TitleUpdater from "./components/TitleUpdater";

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
  <Route path="/login" element={<Login />} />
  <Route path="/logout" element={<Logout />} />
  <Route path="/register" element={<RegisterAndLogout />} />
  <Route path="/evento" element={<EventDescription />} />
  <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App