import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Download, FileText, Phone } from 'lucide-react';
import api from '../api';
import '../styles/RegistrationSuccess.css';

function RegistrationSuccess() {
    const { registrationId } = useParams();
    const navigate = useNavigate();
    const [registration, setRegistration] = useState(null);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [showOrganizerContact, setShowOrganizerContact] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRegistrationData();
    }, [registrationId]);

    useEffect(() => {
        if (registration?.event_start_date) {
            const timer = setInterval(() => {
                calculateTimeLeft();
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [registration]);

    const fetchRegistrationData = async () => {
        try {
            const response = await api.get(`/api/registrations/${registrationId}/`);
            setRegistration(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao carregar dados da inscrição');
            setLoading(false);
        }
    };

    const calculateTimeLeft = () => {
        if (!registration?.event_start_date) return;

        const eventDate = new Date(registration.event_start_date);
        const now = new Date();
        const difference = eventDate - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft({ days, hours, minutes, seconds });
        } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
    };

    const handleSaveQRCode = () => {
        if (registration?.qr_code_image) {
            const link = document.createElement('a');
            link.href = registration.qr_code_image;
            link.download = `qrcode-${registration.event_title}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleEventInstructions = () => {
        navigate(`/evento/${registration.event}`);
    };

    const handleOrganizerContact = () => {
        setShowOrganizerContact(!showOrganizerContact);
    };

    if (loading) {
        return (
            <div className="registration-success-container">
                <div className="loading">Carregando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="registration-success-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="registration-success-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
                Voltar
            </button>

            <div className="success-content">
                <div className="success-icon">
                    <Check size={60} />
                </div>
                
                <h1 className="success-title">Inscrição realizada com sucesso!</h1>

                <div className="qr-code-section">
                    {registration?.qr_code_image && (
                        <img 
                            src={registration.qr_code_image} 
                            alt="QR Code do evento" 
                            className="qr-code-image"
                        />
                    )}
                    <p className="qr-code-text" onClick={handleSaveQRCode} style={{cursor: 'pointer'}}>
                        Salvar QR Code na galeria
                    </p>
                    <button className="transfer-btn">
                        Transferir ingresso
                    </button>
                </div>

                <div className="countdown-section">
                    <h2 className="countdown-title">CONTAGEM PARA O SEU EVENTO</h2>
                    <div className="countdown-timer">
                        <div className="time-unit">
                            <span className="time-value">{String(timeLeft.days).padStart(2, '0')}</span>
                            <span className="time-label">DIAS</span>
                        </div>
                        <span className="time-separator">:</span>
                        <div className="time-unit">
                            <span className="time-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="time-label">HORAS</span>
                        </div>
                        <span className="time-separator">:</span>
                        <div className="time-unit">
                            <span className="time-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="time-label">MINUTOS</span>
                        </div>
                        <span className="time-separator">:</span>
                        <div className="time-unit">
                            <span className="time-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                            <span className="time-label">SEGUNDOS</span>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
                    <button className="action-btn instructions-btn" onClick={handleEventInstructions}>
                        Instruções do evento
                    </button>
                    <button className="action-btn contact-btn" onClick={handleOrganizerContact}>
                        Contato do organizador
                    </button>
                </div>

                {showOrganizerContact && (
                    <div className="organizer-contact">
                        <h3>Contato do Organizador</h3>
                        <p><strong>Organizador:</strong> {registration?.event?.organizer_name || 'Não informado'}</p>
                        <p><strong>Contato:</strong> {registration?.organizer_contact || 'Não informado'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegistrationSuccess;
