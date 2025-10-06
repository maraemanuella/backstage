import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api.js";
import waitlistApi from "../api/waitlist.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUsers, FaClock, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

function StatusBadge({ state }) {
  const map = {
    fila: { label: "Na fila", className: "badge-gray" },
    vaga: { label: "Vaga disponível", className: "badge-green" },
    expirado: { label: "Prazo expirado", className: "badge-red" },
  };
  const obj = map[state] || { label: state, className: "badge-gray" };
  return <span className={`waitlist-badge ${obj.className}`}>{obj.label}</span>;
}

function estimateText(status) {
  if (!status) return "Indisponível";
  if (status.available_slots && status.available_slots > 0) return "Vagas disponíveis agora";
  if (typeof status.position !== "number" || !status.average_release_per_day) return "Sem estimativa";
  const days = status.position / status.average_release_per_day;
  if (days < 1) {
    const hours = Math.ceil(days * 24);
    return `${hours} hora(s)`;
  }
  if (days < 7) return `${Math.ceil(days)} dia(s)`;
  return `${Math.ceil(days / 7)} semana(s)`;
}

export default function Waitlist() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [data, setData] = useState({ resumo: null, status: null, suggestions: [] });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [resumoRes] = await Promise.all([
          api.get(`/api/eventos/${eventId}/resumo-inscricao/`).then(r => r.data).catch(() => null),
        ]);

        let status = null;
        try {
          status = (await waitlistApi.getStatus(eventId)).data;
        } catch (e) {
          status = null;
        }

        let suggestions = [];
        try {
          suggestions = (await waitlistApi.getSuggestions(eventId)).data || [];
        } catch (e) {
          suggestions = [];
        }

        if (!mounted) return;
        setData({ resumo: resumoRes, status, suggestions });
      } catch (e) {
        console.error(e);
        navigate("/");
      } finally {
        mounted && setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [eventId]);

  const handleJoin = async () => {
    if (!localStorage.getItem("access")) return navigate("/login");
    setProcessing(true);
    try {
      await waitlistApi.join(eventId);
      const status = (await waitlistApi.getStatus(eventId)).data;
      setData(d => ({ ...d, status }));
      toast.success("Você foi adicionado à lista de espera");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Erro ao entrar na fila";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Deseja sair da lista de espera?")) return;
    if (!localStorage.getItem("access")) return navigate("/login");
    setProcessing(true);
    try {
      await waitlistApi.leave(eventId);
      const status = (await waitlistApi.getStatus(eventId)).data;
      setData(d => ({ ...d, status }));
      toast.success("Você saiu da lista de espera");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Erro ao sair da fila";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p className="text-center py-8">Carregando...</p>;
  if (!data.resumo) return <p className="text-center py-8 text-red-500">Evento não encontrado</p>;

  const { resumo, status, suggestions } = data;

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-2 md:px-0">
      <ToastContainer />
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 md:p-14">
        <div className="w-full md:flex md:gap-8">
          {/* Left: resumo e ações */}
          <div className="md:flex-1">
            <div className="w-full h-48 md:h-56 bg-gray-200 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
              {resumo.evento?.foto_capa ? (
                <img src={resumo.evento.foto_capa} alt="Capa do Evento" className="object-cover w-full h-full" />
              ) : (
                <span className="text-gray-400 text-2xl">Banner do Evento</span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{resumo.evento?.titulo}</h1>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2"><FaCalendarAlt /> {resumo.evento?.data_evento ? new Date(resumo.evento.data_evento).toLocaleDateString('pt-BR') : ''}</div>
              <div className="flex items-center gap-2"><FaClock /> {resumo.evento?.data_evento ? new Date(resumo.evento.data_evento).toLocaleTimeString('pt-BR') : ''}</div>
              <div className="flex items-center gap-2"><FaMapMarkerAlt /> {resumo.evento?.endereco}</div>
            </div>

            <div className="mt-6 bg-white border rounded p-4">
              <h3 className="text-lg font-semibold mb-2">Minha posição e status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div><strong>Status:</strong> <StatusBadge state={status?.state || (resumo.evento?.esta_lotado ? 'fila' : 'vaga')} /></div>
                <div><strong>Posição:</strong> <span className="ml-2">{status?.position ?? '—'}</span></div>
                <div><strong>Estimativa:</strong> <span className="ml-2">{estimateText(status)}</span></div>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={handleJoin} disabled={processing || (status && status.state === 'vaga')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60">{processing ? 'Aguarde...' : 'Entrar na lista de espera'}</button>
                <button onClick={handleLeave} disabled={processing || !(status && status.state === 'fila')} className="bg-gray-100 text-gray-700 px-4 py-2 rounded border disabled:opacity-60">Sair da lista de espera</button>
              </div>
            </div>
          </div>

          {/* Right: sugestões */}
          <aside className="md:w-80 mt-6 md:mt-0">
            <div className="bg-white rounded shadow p-4">
              <h4 className="font-semibold mb-3">Eventos similares</h4>
              <div className="space-y-3">
                {suggestions && suggestions.length > 0 ? (
                  suggestions.map(ev => (
                    <div key={ev.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/evento/${ev.id}`)}>
                      {ev.foto_capa ? <img src={ev.foto_capa} alt={ev.titulo} className="w-16 h-12 object-cover rounded" /> : <div className="w-16 h-12 bg-gray-100 rounded" />}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{ev.titulo}</div>
                        <div className="text-xs text-gray-500">Vagas: {ev.vagas_disponiveis ?? '—'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma sugestão no momento.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
