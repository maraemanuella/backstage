import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api.js";
import {
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaStar,
  FaArrowLeft,
  FaUsers,
  FaCheckCircle,
  FaShareAlt,
  FaCreditCard,
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
  const [isRegistered, setIsRegistered] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [comentario, setComentario] = useState("");
  const [nota, setNota] = useState(0);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [inscricaoId, setInscricaoId] = useState(null);

  useEffect(() => {
    if (!eventId) {
      setError("ID do evento não fornecido");
      setLoading(false);
      return;
    }

    api
      .get(`/api/eventos/${eventId}/`)
      .then((res) => {
        setEvent(res.data);
        console.log(res.data);
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

    api
      .get(`/api/eventos/${eventId}/avaliacoes/`)
      .then((res) => {
        // Ensure we always set an array
        const data = Array.isArray(res.data) ? res.data : [];
        setAvaliacoes(data);
      })
      .catch((err) => {
        console.error("Erro ao carregar avaliações:", err);
        setAvaliacoes([]);
      });

    const fetchResumo = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) return;
        const res = await api.get(`/api/eventos/${eventId}/resumo-inscricao/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && typeof res.data.ja_inscrito !== "undefined") {
          setIsRegistered(!!res.data.ja_inscrito);
          if (res.data.ja_inscrito && res.data.inscricao_id) {
            setInscricaoId(res.data.inscricao_id);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar resumo da inscrição:", err);
        console.error("Detalhes:", err.response?.data);
      }
    };

    const checkPendingPayment = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) return;
        const res = await api.get(`/api/inscricoes/evento/${eventId}/pagamento-pendente/`);
        if (res.data.tem_pagamento_pendente) {
          setPendingPayment(res.data);
        }
      } catch (err) {
        console.error("Erro ao verificar pagamento pendente:", err);
      }
    };

    fetchResumo();
    checkPendingPayment();
  }, [eventId]);

  // ---------- Inscrição ----------
  const handleRegister = async () => {
    if (isRegistered) {
      toast.info("Você já está inscrito neste evento!");
      return;
    }
    if (event.esta_lotado || event.vagas_disponiveis <= 0) {
      toast.error("Evento lotado! Não há mais vagas disponíveis.");
      return;
    }
    const token = localStorage.getItem("access");
    if (!token) {
      toast.info("Você precisa estar logado para se inscrever");
      navigate("/login");
      return;
    }
    navigate(`/inscricao/${eventId}`);
  };

  // ---------- Lista de Espera ----------
  const handleWaitlist = () => {
    const isLotado =
      event && (event.esta_lotado === true || Number(event.vagas_disponiveis) <= 0);
    if (!isLotado) {
      toast.info("Ainda há vagas — você pode se inscrever normalmente.");
      return navigate(`/inscricao/${eventId}`);
    }
    navigate(`/evento/${eventId}/waitlist`);
  };

  // ---------- Check-in ----------
  const handleCheckin = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        toast.error("Você precisa estar logado para fazer check-in.");
        navigate("/login");
        return;
      }

      // Se já temos o inscricaoId, usar diretamente
      if (inscricaoId) {
        toast.success("Abrindo sua página de check-in...");
        navigate(`/checkin/${inscricaoId}`);
        return;
      }

      // Caso contrário, buscar a inscrição
      const res = await api.get("/api/inscricoes/minhas/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data || res.data.length === 0) {
        toast.error("Nenhuma inscrição encontrada.");
        return;
      }

      // Comparar usando String() para garantir o mesmo tipo
      const inscricaoEvento = res.data.find(
        (i) => String(i.evento_id) === String(event.id)
      );

      if (!inscricaoEvento) {
        toast.error("Você não está inscrito neste evento.");
        return;
      }

      // Verificar se o pagamento foi aprovado
      if (inscricaoEvento.status_pagamento !== 'aprovado') {
        toast.error("Seu pagamento ainda não foi aprovado. Aguarde a confirmação.");
        return;
      }

      toast.success("Abrindo sua página de check-in...");
      navigate(`/checkin/${inscricaoEvento.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar o check-in.");
    }
  };

  // ---------- Avaliações ----------
  const handleAvaliacaoSubmit = async (e) => {
    e.preventDefault();
    if (!comentario || nota < 0 || nota > 5) {
      toast.error("Preencha o comentário e selecione uma nota de 0 a 5.");
      return;
    }
    setEnviandoAvaliacao(true);
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        toast.error("Você precisa estar logado para avaliar.");
        setEnviandoAvaliacao(false);
        return;
      }
      await api.post(
        `/api/eventos/${eventId}/avaliacoes/criar/`,
        { comentario, nota },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Avaliação enviada!");
      setComentario("");
      setNota(0);
      const res = await api.get(`/api/eventos/${eventId}/avaliacoes/`);
      setAvaliacoes(res.data);
    } catch (err) {
      let errorMessage = "Erro ao enviar avaliação.";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (Array.isArray(err.response.data)) {
          errorMessage = err.response.data.join(" ");
        } else {
          errorMessage = Object.values(err.response.data).join(" ");
        }
      }
      toast.error(errorMessage);
    } finally {
      setEnviandoAvaliacao(false);
    }
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
        {/* Banner */}
        <div className="w-full h-48 md:h-56 bg-gray-200 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
          {event.foto_capa ? (
            <img src={event.foto_capa} alt="Capa do Evento" className="object-cover w-full h-full" />
          ) : (
            <span className="text-gray-400 text-3xl">Banner do Evento</span>
          )}
        </div>

        {/* Voltar */}
        <div className="flex items-center mb-4">
          <EventButton
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2 px-3 py-1 text-sm mr-2"
            onClick={handleBack}
          >
            <FaArrowLeft /> Voltar
          </EventButton>
        </div>

        {/* Título */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{event.titulo}</h1>

        {/* Infos */}
        <div className="flex flex-col gap-2 mt-4 mb-6">
          <InfoItem icon={<FaCalendarAlt />}>
            {event.data_evento ? new Date(event.data_evento).toLocaleDateString("pt-BR") : ""}
          </InfoItem>
          <InfoItem icon={<FaClock />}>
            {event.data_evento ? new Date(event.data_evento).toLocaleTimeString("pt-BR") : ""}
          </InfoItem>
          <InfoItem icon={<FaMapMarkerAlt />}>{event.endereco}</InfoItem>
        </div>

        {/* Organizador */}
        <section className="mt-4 mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaUser className="text-gray-600" />
            <span className="font-semibold text-gray-800">
              {event.organizador_nome || event.organizador_username || "Organizador"}
            </span>
            <FaStar className="text-yellow-400 ml-2" />
            <span className="text-gray-700">{event.organizador_score || "5.0"}</span>
          </div>
        </section>

        {/* Capacidade */}
        <div className="mt-2 mb-6">
          <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">
            {event.inscritos_count}/{event.capacidade_maxima} inscritos —{" "}
            {event.vagas_disponiveis} vagas restantes
          </span>
        </div>

        {/* Valores */}
        <section className="mb-6">
          <h3 className="font-semibold mb-2">Valores</h3>

          {(() => {
            // Verificar se o evento é gratuito (valor zero ou próximo de zero)
            const valorFinal = parseFloat(event.valor_com_desconto || event.valor_deposito || 0);
            const isGratuito = valorFinal === 0 || valorFinal < 0.50;

            if (isGratuito) {
              // Layout para EVENTOS GRATUITOS
              return (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-blue-900 font-bold text-sm mb-1">
                        🎉 Evento Gratuito
                      </h4>
                      <p className="text-blue-800 text-xs leading-relaxed">
                        Nenhum depósito é necessário, pois se trata de um <strong>evento gratuito</strong>.
                        Basta se inscrever e comparecer!
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else if (event.is_nao_reembolsavel) {
              // Layout para eventos NÃO REEMBOLSÁVEIS
              return (
                <div className="space-y-3">
                  <div className="flex gap-4 items-center">
                    <span className="text-gray-700">
                      Valor do Ingresso: <b>R$ {event.valor_deposito || "0,00"}</b>
                    </span>
                    {event.valor_com_desconto && event.valor_com_desconto !== event.valor_deposito && (
                      <span className="text-green-700">
                        Com desconto: <b>R$ {event.valor_com_desconto || "0,00"}</b>
                      </span>
                    )}
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="flex-1">
                        <h4 className="text-red-900 font-bold text-sm mb-1">
                          🎫 Compra de Ingresso - Não Reembolsável
                        </h4>
                        <p className="text-red-800 text-xs leading-relaxed mb-2">
                          Este é um <strong>ingresso</strong>, não um depósito. O valor pago <strong>NÃO será devolvido</strong> em caso de cancelamento ou ausência.
                        </p>
                        <p className="text-red-700 text-xs italic">
                          Política: {event.politica_cancelamento}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              // Layout para eventos com DEPÓSITO REEMBOLSÁVEL
              return (
                <div className="space-y-3">
                  <div className="flex gap-4 items-center">
                    <span className="text-gray-700">
                      Depósito original: <b>R$ {event.valor_deposito || "0,00"}</b>
                    </span>
                    {event.valor_com_desconto && (
                      <span className="text-green-700">
                        Com desconto: <b>R$ {event.valor_com_desconto || "0,00"}</b>
                      </span>
                    )}
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
                    <p className="text-green-800 text-xs flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span><strong>Depósito 100% reembolsável</strong> ao comparecer no evento</span>
                    </p>
                  </div>
                </div>
              );
            }
          })()}
        </section>

        {/* Ações */}
        <div className="flex flex-wrap gap-4 mt-4 mb-6">
          {/* Botão Continuar Pagamento - aparece se houver pagamento pendente */}
          {pendingPayment ? (
            <EventButton
              onClick={() => navigate(`/pagamento/${pendingPayment.inscricao_id}`)}
              className="bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2 px-8 py-3"
            >
              <FaCreditCard />
              Continuar Pagamento
            </EventButton>
          ) : (
            /* Botão Se Inscrever - só aparece se NÃO houver pagamento pendente */
            <EventButton
              onClick={handleRegister}
              disabled={isRegistered || event.esta_lotado || event.vagas_disponiveis <= 0}
              className={`
                flex items-center gap-2 px-8 py-3
                ${
                  isRegistered || event.esta_lotado || event.vagas_disponiveis <= 0
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                }
              `}
            >
              <FaCheckCircle />
              {isRegistered
                ? "Já inscrito"
                : event.esta_lotado || event.vagas_disponiveis <= 0
                ? "Lotado"
                : "Se inscrever"}
            </EventButton>
          )}

          <EventButton
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 px-8 py-3"
            onClick={handleWaitlist}
          >
            <FaUsers /> Lista de espera
          </EventButton>

          <EventButton className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 px-8 py-3">
            <FaShareAlt /> Compartilhar
          </EventButton>

          {/* Check-in só aparece se inscrito e NÃO tem pagamento pendente */}
          {isRegistered && !pendingPayment && (
            <EventButton
              className="bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 px-8 py-3 hover:cursor-pointer"
              onClick={handleCheckin}
            >
              <FaStar /> Check-in
            </EventButton>
          )}
        </div>

        {/* Descrição */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Sobre o Evento</h2>
          <p className="text-gray-700">{event.descricao}</p>
        </section>

        {/* Mapa */}
        {event.latitude && event.longitude && (
          <section className="mt-6">
            <h3 className="font-semibold mb-2">Localização</h3>
            <div className="w-full h-56 rounded-lg overflow-hidden">
              <iframe
                src={`https://www.google.com/maps/embed/v1/view?zoom=19&center=${event.latitude},${event.longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização do evento"
                className="rounded-b-lg"
              />
            </div>
          </section>
        )}

        {/* Política de Cancelamento */}
        <section className="mt-6">
          <h3 className="font-semibold mb-2">Política de Cancelamento</h3>
          <p className="text-gray-700">
            {event.politica_cancelamento || "Cancelamento permitido até 24h antes do evento."}
          </p>
        </section>

        {/* Avaliações */}
        <section className="mt-6">
          <h3 className="font-semibold mb-2">Avaliações do Evento</h3>
          <div className="space-y-2 mb-4">
            {avaliacoes.length > 0 ? (
              avaliacoes.map((review, idx) => (
                <div key={idx} className="bg-gray-100 rounded p-2">
                  <span className="font-semibold">
                    {review.usuario_nome || review.usuario || "Usuário"}
                  </span>
                  : {review.comentario}
                  <span className="ml-2 text-yellow-500">
                    <FaStar /> {review.nota}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-gray-500">Nenhuma avaliação disponível.</span>
            )}
          </div>

          {/* Formulário */}
          <form
            onSubmit={handleAvaliacaoSubmit}
            className="bg-gray-50 p-4 rounded shadow flex flex-col gap-2"
          >
            <label className="font-semibold">Deixe sua avaliação:</label>
            <textarea
              className="border rounded p-2"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escreva seu comentário..."
              rows={3}
              required
            />
            <div className="flex items-center gap-2">
              <label htmlFor="nota">Nota:</label>
              <select
                id="nota"
                value={nota}
                onChange={(e) => setNota(Number(e.target.value))}
                className="border rounded p-1"
                required
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
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
