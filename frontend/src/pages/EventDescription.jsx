
import "../styles/EventDescription.css";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

function EventDescription() {
    return (
        <div className="event-description-container">
            {/* Banner Placeholder */}
            <div className="event-banner"></div>
            <button className="back-btn">voltar</button>
            <div className="event-content">
                <h1>Workshop de UX Design</h1>
                <div className="event-actions">
                    <button className="subscribe-btn">SE INSCREVER</button>
                    <button className="share-btn">COMPARTILHAR</button>
                    <button className="waitlist-btn">FILA DE ESPERA</button>
                </div>
                <div className="event-info">
                    <div className="event-date">15 de Setembro, 2025</div>
                    <div className="event-time">14:00 - 18:00</div>
                    <div className="event-location">Centro de Convenções - São Paulo</div>
                </div>
                <div className="event-progress">
                    <div className="progress-bar">
                        <div className="progress" style={{width: "90%"}}></div>
                    </div>
                    <div className="progress-labels">
                        <span>45/50 inscritos</span>
                        <span>5 vagas restantes</span>
                    </div>
                </div>
                <div className="event-price">
                    <span className="old-price">R$ 80,00</span>
                    <span className="current-price">R$ 72.00</span>
                </div>
                <section className="event-section">
                    <h2>Sobre o Evento</h2>
                    <p>
                        Aprenda os fundamentos do UX Design neste workshop prático e intensivo. Durante 4 horas, você irá descobrir como criar experiências digitais que realmente importam para os usuários.
                    </p>
                    <h3>O que você vai aprender:</h3>
                    <ul>
                        <li>Princípios fundamentais do UX Design</li>
                        <li>Metodologias de pesquisa com usuários</li>
                        <li>Criação de personas e jornadas do usuário</li>
                        <li>Prototipagem rápida e testes de usabilidade</li>
                        <li>Ferramentas essenciais de mercado (Figma, Miro)</li>
                    </ul>
                    <h3>Para quem é este workshop:</h3>
                    <ul>
                        <li>Iniciantes em UX Design</li>
                        <li>Desenvolvedores que querem entender UX</li>
                        <li>Profissionais de marketing e produto</li>
                        <li>Estudantes de design e tecnologia</li>
                    </ul>
                    <h3>O que está incluído:</h3>
                    <ul>
                        <li>Material didático completo</li>
                        <li>Coffee break</li>
                        <li>Certificado de participação</li>
                        <li>Acesso ao grupo exclusivo no Slack</li>
                    </ul>
                    <div className="cancel-policy">
                        <a href="#">Clique para acessar as políticas de cancelamento</a>
                    </div>
                </section>
                <section className="event-instructor">
                    <div className="instructor-profile">
                        <div className="avatar"></div>
                        <div>
                            <strong>João Designer</strong>
                            <div className="rating">5.0 (127 avaliações)</div>
                            <div className="bio">Designer UX/UI com 6 anos de experiência em produtos digitais</div>
                        </div>
                        <div className="social-links">
                            <a href="#">Instagram</a>
                            <a href="#">Facebook</a>
                            <a href="#">LinkedIn</a>
                        </div>
                    </div>
                </section>
                <section className="event-location">
                    <h3>Localização</h3>
                    <div>Centro de Convenções - São Paulo</div>
                    <div>Rua dos Convenções, 123 - Vila Olímpia</div>
                    <div>São Paulo, SP - CEP: 04567-000</div>
                    <div style={{width: "100%", height: "220px", marginTop: 8, borderRadius: 8, overflow: "hidden"}}>
                        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "SUA_CHAVE_AQUI"}>
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "220px" }}
                                center={{ lat: -23.5956, lng: -46.6856 }} // Centro de Convenções - São Paulo
                                zoom={16}
                                options={{
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                }}
                            />
                        </LoadScript>
                    </div>
                </section>
                <section className="event-reviews">
                    <h3>Avaliação de eventos anteriores</h3>
                    <div className="review-list">
                        <div className="review-item">
                            <div className="review-author">Maria Silva</div>
                            <div className="review-text">Excelente workshop! O João aplica de forma muito clara e os exercícios práticos ajudam muito a fixar o conteúdo. Recomendo para quem está começando em UX.</div>
                            <div className="review-date">Há 2 semanas</div>
                        </div>
                        <div className="review-item">
                            <div className="review-author">Maria Silva</div>
                            <div className="review-text">Excelente workshop! O João aplica de forma muito clara e os exercícios práticos ajudam muito a fixar o conteúdo. Recomendo para quem está começando em UX.</div>
                            <div className="review-date">Há 2 semanas</div>
                        </div>
                        <div className="review-item">
                            <div className="review-author">Maria Silva</div>
                            <div className="review-text">Excelente workshop! O João aplica de forma muito clara e os exercícios práticos ajudam muito a fixar o conteúdo. Recomendo para quem está começando em UX.</div>
                            <div className="review-date">Há 2 semanas</div>
                        </div>
                    </div>
                    <div className="review-summary">
                        <span className="review-score">4.8</span>
                        <span className="review-count">127 avaliações</span>
                    </div>
                </section>
            </div>
            <button className="subscribe-bottom">Se inscrever - R$72.00</button>
        </div>
    );
}

export default EventDescription;
