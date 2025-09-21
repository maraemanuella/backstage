import Header from "../components/Header";
import Busca from "../components/Busca";
import Filtro from "../components/Filtro";
import Eventos from "../components/Eventos";
import Score from "../components/Score";
import { useState } from "react";

function Home() {
  const eventos = [
    {
      id: 1,
      nome: "WorkShop React",
      local: "Palmas",
      data_hora: "15 set, 14:00",
      preco: 100,
      tipo: "Workshop",
    },
    {
      id: 2,
      nome: "Cinema Nacional",
      local: "Comeia",
      data_hora: "15 set, 14:00",
      preco: 200,
      tipo: "Palestras",
    },
    {
      id: 3,
      nome: "Festival culinário",
      local: "São Paulo",
      data_hora: "15 set, 14:00",
      preco: 300,
      tipo: "Networking",
    },
    {
      id: 4,
      nome: "Evento desportivo",
      local: "Cuiaba",
      data_hora: "15 set, 14:00",
      preco: 400,
      tipo: "Cursos",
    },
  ];

  // estados para filtro e busca
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("Todos");

  // filtra os eventos
  const eventosFiltrados = eventos.filter((evento) => {
    const filtroTipo = filtroAtivo === "Todos" || evento.tipo === filtroAtivo;
    const filtroBusca =
      evento.nome.toLowerCase().includes(busca.toLowerCase()) ||
      evento.local.toLowerCase().includes(busca.toLowerCase());
    return filtroTipo && filtroBusca;
  });

  return (
    <main>
      <Header />
      <Busca busca={busca} setBusca={setBusca} />
      <Score />
      <Filtro filtroAtivo={filtroAtivo} setFiltroAtivo={setFiltroAtivo} />
      <Eventos eventos={eventosFiltrados} />
    </main>
  );
}

export default Home;
