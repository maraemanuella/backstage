import Header from "../components/Header";
import Busca from "../components/Busca";
import Filtro from "../components/Filtro";
import Eventos from "../components/Eventos";
import Score from "../components/Score";
import Modal from "../components/Modal";
import { useContext, useEffect, useState } from "react";
import api from "../api.js";
import { FavoritesContext } from "../contexts/FavoritesContext";

function Home() {
  const [user, setUser] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");
  const [openModal, setOpenModal] = useState(false);
  const { favorites, setFavorites } = useContext(FavoritesContext);

  useEffect(() => {
    // Busca dados do usuário
    api.get("api/user/me/")
      .then(res => setUser(res.data))
      .catch(console.error);

    // Busca eventos
    api.get("/api/eventos/")
      .then(res => setEventos(res.data))
      .catch(() => setEventos([]));

    // Busca favoritos do usuário
    api.get("/api/favorites/")
      .then(res => {
        // Ajuste: salvar apenas os IDs no contexto
        const ids = res.data.map(f => String(f.evento.id));
        setFavorites(ids);
      })
      .catch(() => setFavorites([]));
  }, []);

  // Filtra os eventos de acordo com busca e filtro
  const eventosFiltrados = eventos.filter(evento => {
    const filtroTipo =
      filtroAtivo.toLowerCase() === "todos" ||
      evento.categoria?.toLowerCase() === filtroAtivo.toLowerCase();

    const filtroBusca =
      !busca ||
      evento.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      evento.endereco?.toLowerCase().includes(busca.toLowerCase());

    return filtroTipo && filtroBusca;
  });

  return (
    <main>
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
      <Header user={user} setOpenModal={setOpenModal} />
      <Busca busca={busca} setBusca={setBusca} />
      <Score user={user} />
      <Filtro filtroAtivo={filtroAtivo} setFiltroAtivo={setFiltroAtivo} />
      <Eventos
        eventos={eventosFiltrados}
        favorites={favorites}
        setFavorites={setFavorites}
      />
    </main>
  );
}

export default Home;
