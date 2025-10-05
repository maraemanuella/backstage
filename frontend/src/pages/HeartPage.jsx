import { useState, useEffect, useContext } from "react";
import { FavoritesContext } from "../contexts/FavoritesContext";
import api from "../api.js";
import Eventos from "../components/Eventos";
import Header from "../components/Header.jsx";
import { Link } from "react-router-dom";
import { ArrowBigLeftDash, HeartCrack, LoaderCircle } from "lucide-react";

function HeartPage() {
  const { favorites, setFavorites } = useContext(FavoritesContext);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca apenas os favoritos do usuário
    api
      .get("/api/favorites/")
      .then((res) => {
        // Extrai apenas os eventos
        const eventosFavoritos = res.data.map((fav) => fav.evento);
        setEventos(eventosFavoritos);

        // Atualiza o contexto de favorites com os IDs
        setFavorites(eventosFavoritos.map((e) => String(e.id)));
      })
      .catch(() => setEventos([]))
      .finally(() => setLoading(false));
  }, [setFavorites]);

  if (loading) {
    return (
      <span className="absolute inset-0 flex justify-center items-center">
        <LoaderCircle className="animate-spin w-40 h-40" />
      </span>
    );
  }

  if (eventos.length === 0) {
    return (
      <div>
        <Header />
        <p className="text-center mt-6">Nenhum favorito ainda <HeartCrack/></p>
      </div>
    );
  }

  return (
    <div>
      <div className="absolute right-0 top-0 m-5">
        <Link to="/">
          <ArrowBigLeftDash className="animate-pulse w-10 h-10 hover:bg-black/10 hover:scale-110 transition-transform duration-200 rounded-3xl" />
        </Link>
      </div>
      <Header />
      <h1 className="text-4xl font-bold ml-[25vw] mt-5">FAVORITOS</h1>
      <p className="ml-[25vw] mr-[25vw] mb-5 border-b-2 border-black/10">Veja seus eventos favoritos.</p>
      <Eventos
        eventos={eventos}
        favorites={favorites}
        setFavorites={setFavorites}
      />
    </div>
  );
}

export default HeartPage;
