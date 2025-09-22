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

  useEffect(() => {
    if (!eventId) {
      setError("ID do evento não fornecido");
      setLoading(false);
      return;
    }

    api
      .get(`api/events/${eventId}/`)
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

    checkRegistrationStatus();
  }, [eventId]);

  const checkRegistrationStatus = async () => {
    try {
      const response = await api.get("api/user/registrations/");
      const userRegistrations = response.data;
      const isAlreadyRegistered = userRegistrations.some(
        (reg) => reg.event === parseInt(eventId) && reg.is_active
      );
      setIsRegistered(isAlreadyRegistered);
    } catch (err) {
      console.error("Erro ao verificar inscrições:", err);
    }
  };

  const handleRegister = async () => {
    if (isRegistered) {
      toast.info("Você já está inscrito neste evento!");
      return;
    }

    if (!event.available_spots || event.available_spots <= 0) {
      toast.error("Evento lotado! Não há mais vagas disponíveis.");
      return;
    }

    setRegistering(true);
    try {
      const response = await api.post(`api/events/${eventId}/register/`);
      toast.success("Inscrição realizada com sucesso!");
      setIsRegistered(true);

      const updatedEvent = await api.get(`api/events/${eventId}/`);
      setEvent(updatedEvent.data);

      setTimeout(() => {
        navigate(`/inscricao-realizada/${response.data.id}`);
      }, 2000);
    } catch (err) {
      let errorMessage = "Erro ao realizar inscrição";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = "Você precisa estar logado para se inscrever";
        navigate("/login");
        return;
      }
      toast.error(errorMessage);
    } finally {
      setRegistering(false);
    }
  };

  const handleBack = () => navigate("/");

  if (loading) return <p className="text-center">Carregando evento...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!event) return <p className="text-center">Evento não encontrado</p>;

  const progressPercentage =
    event.max_participants > 0
      ? (event.current_participants / event.max_participants) * 100
      : 0;

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-2 md:px-0">
      <ToastContainer />
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 md:p-14">
        {/* Banner */}
        <div className="w-full h-48 md:h-56 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
          <span className="text-gray-400 text-3xl">Banner do Evento</span>
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
          {event.title}
        </h1>

        <div className="flex flex-col gap-2 mt-4 mb-6">
          <InfoItem icon={<FaCalendarAlt />}>
            {new Date(event.start_date).toLocaleDateString("pt-BR")}
          </InfoItem>
          <InfoItem icon={<FaClock />}>
            {new Date(event.start_date).toLocaleTimeString("pt-BR")} -{" "}
            {new Date(event.end_date).toLocaleTimeString("pt-BR")}
          </InfoItem>
          <InfoItem icon={<FaMapMarkerAlt />}>{event.location}</InfoItem>
        </div>

        <div className="flex gap-4 mt-4">
          <EventButton
            className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 px-8 py-3"
            onClick={handleRegister}
            disabled={registering || isRegistered || event.available_spots <= 0}
          >
            <FaCheckCircle />
            {isRegistered
              ? "Já inscrito"
              : event.available_spots <= 0
              ? "Lotado"
              : "Se inscrever"}
          </EventButton>
          <EventButton className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 px-8 py-3">
            <FaShareAlt /> Compartilhar
          </EventButton>
        </div>

        <div className="mt-6">
          <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
            <div
              className="h-2 bg-green-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">
            {event.current_participants}/{event.max_participants} inscritos —{" "}
            {event.available_spots} vagas restantes
          </span>
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Sobre o Evento</h2>
          <p className="text-gray-700">{event.description}</p>
        </section>

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
      </div>
    </div>
  );
}

export default EventDescription;
