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

    // recalcula imediatamente quando registration muda
    useEffect(() => {
        if (registration?.event_start_date) calculateTimeLeft();
    }, [registration]);

    const fetchRegistrationData = async () => {
        console.log('RegistrationSuccess: fetching registrationId=', registrationId)
        const token = localStorage.getItem('access')
        const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {}

        try {
            let response
            try {
                response = await api.get(`/api/registrations/${registrationId}/`, headers)
            } catch (err) {
                console.warn('Tentativa /registrations/ falhou:', err?.response?.status)
                if (err.response?.status === 404) {
                    response = await api.get(`/api/inscricoes/${registrationId}/`, headers)
                } else if (err.response?.status === 401) {
                    // token inválido/expirado
                    console.error('Não autenticado ao buscar inscrição:', err.response.data)
                    // limpa token e redireciona para login
                    localStorage.removeItem('access')
                    localStorage.removeItem('refresh')
                    navigate('/login')
                    return
                } else {
                    throw err
                }
            }

            const data = response.data
            console.log('RegistrationSuccess: registration data', data)

            const normalized = {
                id: data.id,
                event: data.evento_id || data.event || data.event,
                event_title: data.evento_titulo || data.event_title || data.event?.title || data.evento?.titulo,
                // prefer the data-uri image when available; fallback to textual qr_code only for copy
                qr_code_image: data.qr_code_image || data.qr_code || null,
                event_start_date: data.evento_data || data.event_start_date || data.event?.data_evento,
                organizer_contact: data.organizador_telefone || data.organizer_contact || data.organizador_telefone || null,
                organizer_name: data.organizador_nome || data.organizer_name || null,
                organizer_contact_raw: data.organizer_contact || data.organizador_telefone || null,
                raw: data
            }

            setRegistration(normalized)
            setLoading(false)
        } catch (err) {
            console.error('Erro ao carregar inscrição:', err)
            // Tenta extrair mensagem detalhada do backend
            let message = 'Erro ao carregar dados da inscrição'
            if (err.response && err.response.data) {
                const d = err.response.data
                if (typeof d === 'string') message = d
                else if (d.error) message = d.error + (d.details ? `: ${d.details}` : '')
                else if (d.detail) message = d.detail
                else message = JSON.stringify(d)
            } else if (err.message) {
                message = err.message
            }
            setError(message)
            setLoading(false)
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
            link.download = `qrcode-${registration.event_title || registration.raw.evento_titulo || registration.raw.event_title}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleCopyCode = async () => {
        try {
            // Tenta copiar o valor textual do qr (se existir no raw) senão copia a data-uri
            const code = registration?.raw?.qr_code || registration?.raw?.qr_code_image || registration?.qr_code_image;
            if (!code) return;
            await navigator.clipboard.writeText(code);
            alert('Código QR copiado para a área de transferência');
        } catch (err) {
            console.error('Erro ao copiar:', err);
            alert('Não foi possível copiar o código');
        }
    };

    const handleEventInstructions = () => {
        const eventId = registration?.event || registration?.raw?.evento || registration?.raw?.event;
        if (eventId) navigate(`/evento/${eventId}`);
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
                    <p className="qr-code-text" style={{cursor: 'pointer'}} onClick={handleCopyCode}>
                        Copiar código do QR
                    </p>
                    <button className="transfer-btn">
                        Transferir ingresso
                    </button>
                </div>

                <div className="countdown-section">
                    <h2 className="countdown-title">CONTAGEM PARA O SEU EVENTO</h2>
                    {/* Badge se o evento já ocorreu */}
                    {(timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) && (
                        <div className="event-passed-badge">EVENTO JÁ OCORREU</div>
                    )}
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
                        <p><strong>Organizador:</strong> {registration?.organizer_name || registration?.raw?.organizer_name || 'Não informado'}</p>
                        <p><strong>Contato:</strong> {registration?.organizer_contact || registration?.organizer_contact_raw || 'Não informado'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegistrationSuccess;
