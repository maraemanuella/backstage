import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function TitleUpdater() {
  const location = useLocation();

  useEffect(() => {
    switch(location.pathname) {
      case "/":
        document.title = "Backstage | Home";
        break;
      case "/login":
        document.title = "Faça Login no Backstage";
        break;
      case "/register":
        document.title = "Registre-se no Backstage";
        break;
      default:
        document.title = "Backstage";
    }
  }, [location]);

  return null;
}

export default TitleUpdater;
