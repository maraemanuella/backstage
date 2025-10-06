import React, { useState, useEffect } from "react";
import { useParams , useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";

const api_key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ===== Componentes base =====
const Button = ({ children, onClick, className = "", variant = "default" }) => {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);
const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);
const Alert = ({ children, className = "" }) => (
  <div className={`relative w-full rounded-lg border p-4 ${className}`}>{children}</div>
);
const AlertDescription = ({ children, className = "" }) => (
  <div className={`text-sm ${className}`}>{children}</div>
);
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);


import {
    FaArrowLeft
} from "react-icons/fa";

import { FiClock,
        FiMapPin,
        FiUsers,
        FiPhone,
        FiAlertTriangle

} from "react-icons/fi";

import { RiCloseLargeFill } from "react-icons/ri";

// ===== Modal genérico =====
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div>{children}</div>
      <div className="mt-6 flex justify-end">
        <Button variant="default" onClick={onClose} className={"hover:cursor-pointer"}>
          Fechar
        </Button>
      </div>
    </div>
  </div>
);

const Checkin = () => {
  const { id } = useParams();
  const [inscricao, setInscricao] = useState(null);
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [modalData, setModalData] = useState({ show: false, title: "", content: null });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access");
        if (!token) {
          setError("Usuário não autenticado.");
          return;
        }

        const res = await axios.get(`http://localhost:8000/api/inscricoes/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInscricao(res.data);

        const eventoId = res.data.evento_id;
        const eventoRes = await axios.get(`http://localhost:8000/api/eventos/${eventoId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvento(eventoRes.data);
      } catch (err) {
        console.error("Erro ao buscar inscrição ou evento:", err);
        setError("Não foi possível carregar inscrição ou evento.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape" && modalData.show) {
          handleCloseModal();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
}, [modalData.show]);

  const handleContactOrganizer = () => {
    if (inscricao?.evento_organizador_email) {
      window.location.href = `mailto:${inscricao.evento_organizador_email}?subject=Contato sobre ${inscricao.evento_titulo}`;
    }
  };

  const handleOpenModal = (title, content) => {
    setModalData({ show: true, title, content });
  };

  const handleCloseModal = () => {
    setModalData({ ...modalData, show: false });
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Skeleton className="h-10 w-64" /></div>;
  if (error) return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <Alert className="max-w-md border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">{error}</AlertDescription>
      </Alert>
    </div>
  );
  if (!inscricao || !evento) return null;

  const usuarioDisplay = inscricao.usuario_nome || inscricao.usuario_username || "Participante";

  return (
    <div className="min-h-screen bg-gray-50 p-10">
        <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:cursor-pointer"
        >
              <FaArrowLeft /> Voltar
        </Button>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Check-in do Evento</h1>
          <p className="text-gray-600">Olá, {usuarioDisplay}. Apresente seu QR Code na entrada do evento.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Coluna esquerda */}
          <div className="space-y-6">
            {/* Status */}
            <Alert className="border-yellow-200 bg-yellow-50">
              <div className="flex">
                <AlertDescription className="ml-2 text-yellow-800 flex items-center gap-2">
                  <FiAlertTriangle /> Aguardando check-in - Apresente este QR Code na entrada
                </AlertDescription>
              </div>
            </Alert>

            {/* Info do evento */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      evento.status === "Em Andamento"
                        ? "bg-yellow-500"
                        : evento.status === "Finalizado"
                        ? "bg-gray-500"
                        : evento.status === "Cancelado" ? "bg-red-500" : "bg-green-500"
                    }`}
                  ></div>
                  {evento.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <FiClock />
                  <span>
                      {new Date(evento.data_evento).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      - {new Date(evento.data_evento).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FiMapPin />
                  <span>{evento.endereco} | {evento.local_especifico}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <FiUsers />
                  <span>{evento.inscritos_count} participantes</span>
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Seu QR Code de Check-in</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center p-8">
                <div className="bg-white p-4 rounded-lg shadow-sm border-2 border-gray-200">
                  <QRCodeSVG value={`https://backstage.com/checkin/${inscricao.id}`} size={200} level="M" includeMargin={true} />
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center max-w-xs">
                  Apresente este código na entrada do evento
                </p>
              </CardContent>
            </Card>

            {/* Botões */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2 w-full"
                onClick={() => handleOpenModal("Política de Cancelamento", <div> <p>{evento.politica_cancelamento}</p> <p className={""}>Clique <span className={"text-blue-600 hover:cursor-pointer"}>aqui</span> para solicitar o cancelamento.</p></div> )}
              >
                <RiCloseLargeFill /> Solicitar Cancelamento
              </Button>
              <Button variant="outline" onClick={handleContactOrganizer} className="flex items-center gap-2">
                  <FiPhone />
                  Contatar Suporte
              </Button>
            </div>
          </div>

          {/* Coluna direita - Mapa e dicas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Localização do Evento</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-64 lg:h-96">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/view?zoom=19&center=${evento.latitude},${evento.longitude}&key=${api_key}`}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Importantes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>• Chegue com 30 minutos de antecedência.</p>
                <p>• Tenha um documento de identificação em mãos.</p>
                <p>• Em caso de dúvidas, procure a equipe de credenciamento.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal dinâmico */}
      {modalData.show && <Modal title={modalData.title} onClose={handleCloseModal}>{modalData.content}</Modal>}
    </div>
  );
};

export default Checkin;
