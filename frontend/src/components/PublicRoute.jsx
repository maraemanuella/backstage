import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api.js";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants.js";
import { useEffect, useState } from "react";

function PublicRoute({ children }) {
  const [checked, setChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshToken = async () => {
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    if (!refresh) return false;

    try {
      const res = await api.post("/api/token/refresh/", { refresh });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        return true;
      }
    } catch (error) {
      console.error("Erro ao tentar refresh token:", error);
    }

    return false;
  };

  const checkAuth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setChecked(true);
      setIsLoggedIn(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;

      if (decoded.exp > now) {
        setIsLoggedIn(true);
      } else {
        const refreshed = await refreshToken();
        setIsLoggedIn(refreshed);
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setChecked(true);
    }
  };

  if (!checked) return <div>Loading...</div>;

  return isLoggedIn ? <Navigate to="/" replace /> : children;
}

export default PublicRoute;
