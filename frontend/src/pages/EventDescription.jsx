import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api.js";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import {
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaStar,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaArrowLeft,
  FaUsers,
  FaCheckCircle,
  FaShareAlt,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

function EventButton({ children, className, ...props }) {
  return (
    <button
      className={`rounded-md px-4 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function InfoItem({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-gray-600 text-sm">
      {icon}
      {children}
    </div>
  );
}

function EventDescription() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  // Avaliação
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [comentario, setComentario] = useState("");
  const [nota, setNota] = useState(0);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  useEffect(() => {
    if (!eventId) {
      setError("ID do evento não fornecido");
      setLoading(false);
      return;
    }

    api
      .get(`api/eventos/${eventId}/`)
      .then((res) => {
        setEvent(res.data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setError("Evento não encontrado");
        } else {
          setError("Erro ao carregar dados do evento");
        }
        setLoading(false);
      });

    // Buscar avaliações do evento
    api
      .get(`api/eventos/${eventId}/avaliacoes/`)
      .then((res) => {
        setAvaliacoes(res.data);
      })
      .catch((err) => {
        setAvaliacoes([]);
      });

    // Em vez de uma checagem separada, usamos o resumo de inscrição que fornece
    // informações completas, incluindo se o usuário já está inscrito.
    const fetchResumo = async () => {
      try {
        const token = localStorage.getItem('access')
        if (!token) return
        const res = await api.get(`/api/eventos/${eventId}/resumo-inscricao/`, { headers: { Authorization: `Bearer ${token}` } })
        // O backend agora retorna a flag 'ja_inscrito'
        if (res.data && typeof res.data.ja_inscrito !== 'undefined') {
          setIsRegistered(!!res.data.ja_inscrito)
        }
      } catch (err) {
        // ignore — manterá como não inscrito
      }
    }
    fetchResumo();
  }, [eventId]);
  // Enviar avaliação
  const handleAvaliacaoSubmit = async (e) => {
    e.preventDefault();
    if (!comentario || nota < 0 || nota > 5) {
      toast.error("Preencha o comentário e selecione uma nota de 0 a 5.");
      return;
    }
    setEnviandoAvaliacao(true);
    try {
      // Recupera o token JWT do localStorage
      const token = localStorage.getItem('access');
      if (!token) {
        toast.error("Você precisa estar logado para avaliar.");
        setEnviandoAvaliacao(false);
        return;
      }
      await api.post(
        `api/eventos/${eventId}/avaliacoes/criar/`,
        { comentario, nota },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Avaliação enviada!");
      setComentario("");
      setNota(0);
      // Atualizar lista de avaliações
      const res = await api.get(`api/eventos/${eventId}/avaliacoes/`);
      setAvaliacoes(res.data);
    } catch (err) {
      let errorMessage = "Erro ao enviar avaliação.";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (Array.isArray(err.response.data)) {
          errorMessage = err.response.data.join(' ');
        } else {
          errorMessage = Object.values(err.response.data).join(' ');
        }
      }
      toast.error(errorMessage);
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  // ...existing code continues...

  const handleRegister = async () => {
    // Redirect to the full inscription form instead of calling a non-existing endpoint
    if (isRegistered) {
      toast.info("Você já está inscrito neste evento!");
      return;
    }

    if (event.esta_lotado || event.vagas_disponiveis <= 0) {
      toast.error("Evento lotado! Não há mais vagas disponíveis.");
      return;
    }

    // Verifica se o usuário está autenticado antes de navegar para o formulário
    const token = localStorage.getItem('access');
    if (!token) {
      toast.info("Você precisa estar logado para se inscrever");
      navigate('/login');
      return;
    }

    // Navega para a página de inscrição onde o usuário preencherá o formulário
    navigate(`/inscricao/${eventId}`);
  };

  const handleBack = () => navigate("/");

  if (loading) return <p className="text-center">Carregando evento...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!event) return <p className="text-center">Evento não encontrado</p>;

  const progressPercentage =
    event?.capacidade_maxima > 0
      ? (event.inscritos_count / event.capacidade_maxima) * 100
      : 0;

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-2 md:px-0">
      <ToastContainer />
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 md:p-14">
        {/* Foto/Capa do Evento */}
        <div className="w-full h-48 md:h-56 bg-gray-200 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
          {event.foto_capa ? (
            <img src={event.foto_capa} alt="Capa do Evento" className="object-cover w-full h-full" />
          ) : (
            <span className="text-gray-400 text-3xl">Banner do Evento</span>
          )}
        </div>

        <div className="flex items-center mb-4">
          <EventButton
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2 px-3 py-1 text-sm mr-2"
            onClick={handleBack}
          >
            <FaArrowLeft /> Voltar
          </EventButton>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {event.titulo}
        </h1>

        <div className="flex flex-col gap-2 mt-4 mb-6">
          <InfoItem icon={<FaCalendarAlt />}>
            {event.data_evento ? new Date(event.data_evento).toLocaleDateString("pt-BR") : ""}
          </InfoItem>
          <InfoItem icon={<FaClock />}>
            {event.data_evento ? new Date(event.data_evento).toLocaleTimeString("pt-BR") : ""}
          </InfoItem>
          <InfoItem icon={<FaMapMarkerAlt />}>{event.endereco}</InfoItem>
        </div>

        {/* Informações do organizador */}
        <section className="mt-4 mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaUser className="text-gray-600" />
            <span className="font-semibold text-gray-800">{event.organizador_nome || event.organizador_username || "Organizador"}</span>
            <FaStar className="text-yellow-400 ml-2" />
            <span className="text-gray-700">{event.organizador_score || "5.0"}</span>
          </div>
        </section>

        {/* Capacidade do evento */}
        <div className="mt-2 mb-6">
          <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">
            {event.inscritos_count}/{event.capacidade_maxima} inscritos — {event.vagas_disponiveis} vagas restantes
          </span>
        </div>

        {/* Valores do evento */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Valores</h3>
          <div className="flex gap-4 items-center">
            <span className="text-gray-700">Depósito original: <b>R$ {event.valor_deposito || "0,00"}</b></span>
            <span className="text-green-700">Com desconto: <b>R$ {event.valor_com_desconto || "0,00"}</b></span>
          </div>
        </section>

        {/* Botões de ação */}
        <div className="flex gap-4 mt-4 mb-6">
          <EventButton
            className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 px-8 py-3"
            onClick={handleRegister}
            disabled={registering || isRegistered || event.esta_lotado || event.vagas_disponiveis <= 0}
          >
            <FaCheckCircle />
            {isRegistered
              ? "Já inscrito"
              : event.esta_lotado || event.vagas_disponiveis <= 0
              ? "Lotado"
              : "Se inscrever"}
          </EventButton>
          <EventButton className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 px-8 py-3">
            <FaUsers /> Lista de espera
          </EventButton>
          <EventButton className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 px-8 py-3">
            <FaShareAlt /> Compartilhar
          </EventButton>
          <EventButton className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 px-8 py-3">
            <FaStar /> Favoritar
          </EventButton>
        </div>

        {/* Descrição completa do evento */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Sobre o Evento</h2>
          <p className="text-gray-700">{event.descricao}</p>
        </section>

        {/* Mapa interativo */}
        <section className="mt-6">
          <h3 className="font-semibold mb-2">Localização</h3>
          <div className="w-full h-56 rounded-lg overflow-hidden">
            <LoadScript
              googleMapsApiKey={
                import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "SUA_CHAVE_AQUI"
              }
            >
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{ lat: -23.5962, lng: -46.6823 }}
                zoom={14}
              />
            </LoadScript>
          </div>
        </section>

        {/* Política de cancelamento */}
        <section className="mt-6">
          <h3 className="font-semibold mb-2">Política de Cancelamento</h3>
          <p className="text-gray-700">{event.politica_cancelamento || "Cancelamento permitido até 24h antes do evento."}</p>
        </section>

        {/* Avaliações do Evento */}
        <section className="mt-6">
          <h3 className="font-semibold mb-2">Avaliações do Evento</h3>
          <div className="space-y-2 mb-4">
            {avaliacoes.length > 0 ? (
              avaliacoes.map((review, idx) => (
                <div key={idx} className="bg-gray-100 rounded p-2">
                  <span className="font-semibold">{review.usuario_nome || review.usuario || "Usuário"}</span>: {review.comentario}
                  <span className="ml-2 text-yellow-500"><FaStar /> {review.nota}</span>
                </div>
              ))
            ) : (
              <span className="text-gray-500">Nenhuma avaliação disponível.</span>
            )}
          </div>
          {/* Formulário de avaliação */}
          <form onSubmit={handleAvaliacaoSubmit} className="bg-gray-50 p-4 rounded shadow flex flex-col gap-2">
            <label className="font-semibold">Deixe sua avaliação:</label>
            <textarea
              className="border rounded p-2"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              placeholder="Escreva seu comentário..."
              rows={3}
              required
            />
            <div className="flex items-center gap-2">
              <label htmlFor="nota">Nota:</label>
              <select
                id="nota"
                value={nota}
                onChange={e => setNota(Number(e.target.value))}
                className="border rounded p-1"
                required
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
              <FaStar className="text-yellow-500" />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              disabled={enviandoAvaliacao}
            >
              {enviandoAvaliacao ? "Enviando..." : "Enviar Avaliação"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default EventDescription;
