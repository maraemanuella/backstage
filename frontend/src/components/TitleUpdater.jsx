import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      document.title = "Backstage | Home";
    } else if (location.pathname === "/login") {
      document.title = "Faça Login no Backstage";
    } else if (location.pathname === "/register") {
      document.title = "Registre-se no Backstage";
    } else if (location.pathname.startsWith("/evento/")) {
      const eventName = location.pathname.replace("/evento/", "");
      document.title = `BS | ${eventName}`;
    } else {
      document.title = "Backstage";
    }
  }, [location]);

  return null;
}

export default TitleUpdater;
