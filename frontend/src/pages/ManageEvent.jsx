// --- INSTRUÇÃO ---
// Para o gráfico funcionar, você precisa instalar a biblioteca Recharts.
// No seu terminal, na pasta do frontend, rode o comando:
// npm install recharts
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import React, { useState, useEffect } from "react";
import {
  Martini,
  MapPin,
  Ruler,
  ArrowLeft,
  LoaderCircle,
  SquarePen,
  HeartCrack,
} from "lucide-react";
import api from "../api.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function ManageEvent() {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [user, setUser] = useState(null);
  const [meusEventos, setMeusEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    events: 0,
    inscriptions: 0,
    checkins: 0,
  });

  const chartData = [
    {
      name: "Totais",
      Inscrições: stats.inscriptions,
      Eventos: stats.events,
      "Check-ins": stats.checkins,
    },
  ];

  useEffect(() => {
    // PRIMEIRO: Buscar dados do usuário
    api.get("/api/user/me/")
      .then((userResponse) => {
        setUser(userResponse.data);
        
        // Buscar eventos do usuário
        return api.get("/api/manage/");
      })
      .then((response) => {
        if (!response) return; // Se não passou na verificação, não continua
        
        const eventos = response.data;
        setMeusEventos(eventos);

        const totalEvents = eventos.length;
        const totalInscriptions = eventos.reduce(
          (sum, evento) => sum + (evento.inscritos_count || 0),
          0
        );
        const totalCheckins = eventos.reduce(
          (sum, evento) => sum + (evento.checkins_count || 0),
          0
        );

        setStats({
          events: totalEvents,
          inscriptions: totalInscriptions,
          checkins: totalCheckins,
        });
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setError("Sua sessão expirou. Por favor, faça login novamente.");
        } else if (err.response && err.response.status === 403) {
          setError("Você não tem permissão para acessar esta área.");
          navigate('/');
        } else {
          setError(
            "Não foi possível carregar seus eventos. Tente novamente mais tarde."
          );
        }
        console.error("Erro ao buscar eventos gerenciados:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [navigate]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div className="h-screen lg:overflow-hidden md:overflow-auto">
      <Header user={user} />
      {/* CABEÇALHO DA PAGINA */}
      <div className="flex border-b-2 border-gray-200 box mr-[10%] ml-[10%] mt-[1%]">
        <div>
          <h1 className="text-[30px] font-[700] font-poppins">
            Gerenciar Eventos:
          </h1>
          <p>Gerencie seus eventos</p>
        </div>

        <Link
          to={`/`}
          className="ml-auto border-2 border-gray-300 font-poppins h-[40px] flex items-center justify-center p-2 rounded-full hover:text-white hover:bg-black hover:scale-108 transition-all cursor-pointer"
        >
          <ArrowLeft size={24} /> Voltar
        </Link>
      </div>

      <div className="parent-container grid h-[clamp(450px,90vh,900px)] ml-[20%] mr-[20%] mt-[10px] md:grid-rows-[auto] lg:grid-cols-[50%_50%] lg:grid-rows-none gap-4">
        {/* ----------- DIV DOS EVENTOS --------- */}
        <div className="child-box bg-white shadow-lg rounded-2xl p-4 overflow-y-auto h-[80vh]">
          <p className="flex items-center mb-4 border-b border-gray-300 pb-2 text-lg font-poppins font-bold">
            <Martini className="mr-2" /> Seus eventos
          </p>
          <div className="flex flex-col gap-4">
            {meusEventos.length > 0 ? (
              meusEventos.map((evento) => (
                <div
                  key={evento.id}
                  className="relative w-full shadow-md rounded-2xl flex flex-col gap-1 hover:duration-200 transition-transform"
                >
                  <div className="w-full h-[200px] flex justify-center items-center bg-gray-200 rounded-t-2xl">
                    <img
                      src={
                        evento.imagem_url ||
                        "https://placehold.co/300x200/e2e8f0/e2e8f0?text=."
                      }
                      alt={evento.titulo}
                      className="object-cover w-full h-full rounded-t-2xl"
                    />
                  </div>
                  <div className="p-4">
                    <h1 className="font-bold text-xl">{evento.titulo}</h1>
                    <div className="text-sm flex flex-col gap-2 mt-2">
                      <span className="text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {evento.endereco}
                      </span>
                      <span className="text-red-500 font-semibold">
                        {new Date(evento.data_evento).toLocaleDateString(
                          "pt-BR",
                          { timeZone: "UTC" }
                        )}
                      </span>
                    </div>
                    <div className="mt-4">
                      <span className="text-green-500 font-bold text-lg">
                        R${evento.valor_deposito}
                      </span>
                    </div>

                    <Link
                      to={`/gerenciar/editar/${evento.id}`}
                      className="flex ml-auto"
                    >
                      <SquarePen className="ml-auto w-auto hover:scale-120 transition-all" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="flex justify-center">
                  <HeartCrack className="mb-4" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhum Evento criado
                </h3>
                <p className="text-gray-500">
                  Quando você criar seus eventos, eles aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* --- DIV DAS METRICAS DO EVENTO --- */}
        <div className="child-box bg-white shadow-lg rounded-2xl p-4 flex flex-col h-[80vh]">
          <h2 className="flex text-lg font-poppins border-b border-gray-300 pb-2 mb-4 text-center font-bold gap-3">
            <Ruler /> Visão Geral
          </h2>
          {/* O ResponsiveContainer faz o gráfico se adaptar ao tamanho da div */}
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Check-ins" fill="#f97316" />
              <Bar dataKey="Eventos" fill="#22c55e" />
              <Bar dataKey="Inscrições" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default ManageEvent;
