import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api.js";
import "../styles/EventDescription.css";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import "react-toastify/dist/ReactToastify.css";

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

        // Carregar dados do evento
        api.get(`api/events/${eventId}/`)
            .then(res => {
                console.log("Evento carregado:", res.data);
                setEvent(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erro ao carregar evento:", err);
                if (err.response?.status === 404) {
                    setError("Evento não encontrado");
                } else {
                    setError("Erro ao carregar dados do evento");
                }
                setLoading(false);
            });

        // Verificar se o usuário já está inscrito
        checkRegistrationStatus();
    }, [eventId]);

    const checkRegistrationStatus = async () => {
        try {
            const response = await api.get("api/user/registrations/");
            const userRegistrations = response.data;
            const isAlreadyRegistered = userRegistrations.some(
                reg => reg.event === parseInt(eventId) && reg.is_active
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
            console.log("Inscrição realizada:", response.data);
            
            toast.success("Inscrição realizada com sucesso!");
            setIsRegistered(true);
            
            // Atualizar dados do evento para refletir a nova inscrição
            const updatedEvent = await api.get(`api/events/${eventId}/`);
            setEvent(updatedEvent.data);
            
            // Navegar para página de sucesso após um delay
            setTimeout(() => {
                navigate(`/inscricao-realizada/${response.data.id}`);
            }, 2000);
            
        } catch (err) {
            console.error("Erro ao se inscrever:", err);
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

    const handleBack = () => {
        navigate("/");
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: event.title,
                text: event.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copiado para a área de transferência!");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Data não informada";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return "Horário não informado";
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatEndTime = (dateString) => {
        if (!dateString) return "Horário não informado";
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="event-description-container">
                <div style={{textAlign: 'center', padding: '2rem'}}>
                    <p>Carregando evento...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="event-description-container">
                <div style={{textAlign: 'center', padding: '2rem'}}>
                    <p style={{color: 'red'}}>{error}</p>
                    <button onClick={handleBack} className="back-btn">
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="event-description-container">
                <div style={{textAlign: 'center', padding: '2rem'}}>
                    <p>Evento não encontrado</p>
                    <button onClick={handleBack} className="back-btn">
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    const progressPercentage = event.max_participants > 0 
        ? (event.current_participants / event.max_participants) * 100 
        : 0;

    return (
        <>
            <ToastContainer />
            <div className="event-description-container">
                {/* Banner Placeholder */}
                <div className="event-banner"></div>
                <button className="back-btn" onClick={handleBack}>voltar</button>
                
                <div className="event-content">
                    <h1>{event.title}</h1>
                    
                    <div className="event-actions">
                        <button 
                            className={`subscribe-btn ${isRegistered ? 'registered' : ''}`}
                            onClick={handleRegister}
                            disabled={registering || isRegistered || event.available_spots <= 0}
                        >
                            {registering ? "INSCREVENDO..." : 
                             isRegistered ? "JÁ INSCRITO" : 
                             event.available_spots <= 0 ? "LOTADO" : "SE INSCREVER"}
                        </button>
                        <button className="share-btn" onClick={handleShare}>COMPARTILHAR</button>
                        {event.available_spots <= 0 && (
                            <button className="waitlist-btn">FILA DE ESPERA</button>
                        )}
                    </div>
                    
                    <div className="event-info">
                        <div className="event-date">{formatDate(event.start_date)}</div>
                        <div className="event-time">
                            {formatTime(event.start_date)} - {formatEndTime(event.end_date)}
                        </div>
                        <div className="event-location">{event.location}</div>
                    </div>
                    
                    <div className="event-progress">
                        <div className="progress-bar">
                            <div className="progress" style={{width: `${progressPercentage}%`}}></div>
                        </div>
                        <div className="progress-labels">
                            <span>{event.current_participants}/{event.max_participants} inscritos</span>
                            <span>{event.available_spots} vagas restantes</span>
                        </div>
                    </div>
                    
                    <div className="event-price">
                        <span className="current-price">R$ {event.price}</span>
                    </div>
                    
                    <section className="event-section">
                        <h2>Sobre o Evento</h2>
                        <p>{event.description}</p>
                        
                        {event.organizer_contact && (
                            <div className="organizer-contact">
                                <h3>Contato do Organizador</h3>
                                <p>{event.organizer_contact}</p>
                            </div>
                        )}
                    </section>
                    
                    <section className="event-instructor">
                        <div className="instructor-profile">
                            <div className="avatar"></div>
                            <div>
                                <strong>{event.organizer_name}</strong>
                                <div className="bio">Organizador do evento</div>
                            </div>
                        </div>
                    </section>
                    
                    <section className="event-location">
                        <h3>Localização</h3>
                        <div>{event.location}</div>
                        <div style={{width: "100%", height: "220px", marginTop: 8, borderRadius: 8, overflow: "hidden"}}>
                            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "SUA_CHAVE_AQUI"}>
                                <GoogleMap
                                    mapContainerStyle={{ width: "100%", height: "220px" }}
                                    center={{ lat: -23.5956, lng: -46.6856 }}
                                    zoom={16}
                                    options={{
                                        disableDefaultUI: true,
                                        zoomControl: true,
                                    }}
                                />
                            </LoadScript>
                        </div>
                    </section>
                </div>
                
                <button 
                    className="subscribe-bottom"
                    onClick={handleRegister}
                    disabled={registering || isRegistered || event.available_spots <= 0}
                >
                    {registering ? "Inscrevendo..." : 
                     isRegistered ? "Já inscrito" : 
                     event.available_spots <= 0 ? "Lotado" : `Se inscrever - R$${event.price}`}
                </button>
            </div>
        </>
    );
}

export default EventDescription;
