import Header from "../components/Header";
import Busca from "../components/Busca";
import Filtro from "../components/Filtro";
import Eventos from "../components/Eventos";
import Score from "../components/Score";
import { useEffect, useState } from "react";
import api from "../api.js";

function Home() {
  const [user, setUser] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");

  useEffect(() => {
    api
      .get("api/user/me/")
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    api
      .get("/api/eventos/")
      .then((res) => setEventos(res.data))
      .catch(() => setEventos([]));
  }, []);

  const eventosFiltrados = eventos.filter((evento) => {
    const filtroTipo = filtroAtivo === "Todos" || evento.tipo === filtroAtivo;
    const filtroBusca =
      evento.nome.toLowerCase().includes(busca.toLowerCase()) ||
      evento.local.toLowerCase().includes(busca.toLowerCase());
    return filtroTipo && filtroBusca;
  });

  return (
    <main>
      <Header user={user} />
      <Busca busca={busca} setBusca={setBusca} />
      <Score user={user} />
      <Filtro filtroAtivo={filtroAtivo} setFiltroAtivo={setFiltroAtivo} />
      <Eventos eventos={eventosFiltrados} />
    </main>
  );
}

export default Home;
