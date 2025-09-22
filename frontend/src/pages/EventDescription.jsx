

import { GoogleMap, LoadScript } from "@react-google-maps/api";
import {
    FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUser, FaStar, FaInstagram, FaFacebook, FaLinkedin, FaArrowLeft, FaUsers, FaCheckCircle, FaShareAlt
} from "../components/Icons";


// Componentes auxiliares para melhor organização
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
    return (
        <div className="bg-gray-50 min-h-screen py-6 px-2 md:px-0">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow p-6 md:p-14">
                {/* Banner */}
                <div className="w-full h-48 md:h-56 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
                    <span className="text-gray-400 text-3xl">Banner do Evento</span>
                </div>
                <div className="flex items-center mb-4">
                    <EventButton className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2 px-3 py-1 text-sm mr-2">
                        <FaArrowLeft /> Voltar
                    </EventButton>
                </div>
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Workshop de UX Design</h1>
                        <div className="flex gap-4 mt-2 md:mt-0">
                            <EventButton className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 px-8 py-3 text-lg"><FaCheckCircle /> SE INSCREVER</EventButton>
                            <EventButton className="bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2 px-8 py-3 text-lg"><FaShareAlt /> COMPARTILHAR</EventButton>
                            <EventButton className="bg-yellow-400 text-white hover:bg-yellow-500 flex items-center gap-2 px-8 py-3 text-lg"><FaUser /> FILA DE ESPERA</EventButton>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-4 mb-6">
                        <InfoItem icon={<FaCalendarAlt className="text-primary" />}>15 de Setembro, 2025</InfoItem>
                        <InfoItem icon={<FaClock className="text-primary" />}>14:00 - 18:00</InfoItem>
                        <InfoItem icon={<FaMapMarkerAlt className="text-primary" />}>Centro de Convenções - São Paulo</InfoItem>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 border rounded-lg p-4 flex flex-col justify-between">
                            <div className="flex items-center gap-2 mb-2">
                                <FaUsers className="text-primary" />
                                <span className="font-semibold text-gray-700">45/50 inscritos</span>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full mb-1">
                                <div className="h-2 bg-green-500 rounded-full" style={{ width: "90%" }}></div>
                            </div>
                            <span className="text-green-600 text-xs font-medium">5 vagas restantes</span>
                        </div>
                        <div className="flex-1 border rounded-lg p-4 flex flex-col items-center justify-center">
                            <span className="text-gray-400 line-through text-sm">R$ 80,00</span>
                            <span className="text-2xl font-bold text-green-600">R$ 72.00</span>
                        </div>
                    </div>
                </div>
                <section className="mb-8">
                    <h2 className="text-lg font-semibold mb-2">Sobre o Evento</h2>
                    <p className="mb-2 text-gray-700">
                        Aprenda os fundamentos do UX Design neste workshop prático e intensivo. Durante 4 horas, você irá descobrir como criar experiências digitais que realmente importam para os usuários.
                    </p>
                    <h3 className="font-semibold mt-4 mb-1">O que você vai aprender:</h3>
                    <ul className="list-disc list-inside text-gray-700 text-sm mb-2">
                        <li>Princípios fundamentais do UX Design</li>
                        <li>Metodologias de pesquisa com usuários</li>
                        <li>Criação de personas e jornadas do usuário</li>
                        <li>Prototipagem rápida e testes de usabilidade</li>
                        <li>Ferramentas essenciais de mercado (Figma, Miro)</li>
                    </ul>
                    <h3 className="font-semibold mt-4 mb-1">Para quem é este workshop:</h3>
                    <ul className="list-disc list-inside text-gray-700 text-sm mb-2">
                        <li>Iniciantes em UX Design</li>
                        <li>Desenvolvedores que querem entender UX</li>
                        <li>Profissionais de marketing e produto</li>
                        <li>Estudantes de design e tecnologia</li>
                    </ul>
                    <h3 className="font-semibold mt-4 mb-1">O que está incluído:</h3>
                    <ul className="list-disc list-inside text-gray-700 text-sm mb-2">
                        <li>Material didático completo</li>
                        <li>Coffee break</li>
                        <li>Certificado de participação</li>
                        <li>Acesso ao grupo exclusivo no Slack</li>
                    </ul>
                    <div className="mt-2">
                        <a href="#" className="text-primary underline text-xs">Clique para acessar as políticas de cancelamento</a>
                    </div>
                </section>
                <section className="mb-8">
                    <div className="flex items-center gap-4 bg-gray-100 rounded-lg p-4">
                        <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-2xl text-gray-500">
                            <FaUser />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900">João Designer</div>
                            <div className="flex items-center gap-1 text-yellow-500 text-sm">
                                <FaStar /> 5.0 <span className="text-gray-500">(127 avaliações)</span>
                            </div>
                            <div className="text-xs text-gray-600">Designer UX/UI com 6 anos de experiência em produtos digitais</div>
                        </div>
                        <div className="flex gap-2">
                            <a href="#" className="text-pink-500 hover:text-pink-600"><FaInstagram /></a>
                            <a href="#" className="text-blue-600 hover:text-blue-700"><FaFacebook /></a>
                            <a href="#" className="text-blue-800 hover:text-blue-900"><FaLinkedin /></a>
                        </div>
                    </div>
                </section>
                <section className="mb-8">
                    <h3 className="font-semibold mb-2">Localização</h3>
                    <div className="text-gray-700 text-sm mb-1">Centro de Convenções - São Paulo</div>
                    <div className="text-gray-700 text-sm mb-1">Rua dos Convenções, 123 - Vila Olímpia</div>
                    <div className="text-gray-700 text-sm mb-3">São Paulo, SP - CEP: 04567-000</div>
                    <div className="w-full h-56 rounded-lg overflow-hidden">
                        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "SUA_CHAVE_AQUI"}>
                            <GoogleMap
                                mapContainerStyle={{ width: "100%", height: "100%" }}
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
                                                <section className="mb-8">
                                                    <div className="flex flex-col md:flex-row md:items-stretch md:gap-8 w-full">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold mb-4 uppercase text-base tracking-tight">Avaliação de eventos anteriores</h3>
                                                            <div className="flex flex-col gap-0">
                                                                {[1,2,3].map((i) => (
                                                                    <div key={i} className="flex items-center gap-4 py-2">
                                                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg text-gray-500 mr-2"><FaUser /></div>
                                                                        <div className="flex flex-col flex-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-semibold text-gray-900 text-sm">Maria Silva</span>
                                                                                <span className="flex items-center text-yellow-500 text-xs font-semibold">{[...Array(5)].map((_,i)=>(<FaStar key={i}/>))}</span>
                                                                            </div>
                                                                            <span className="text-gray-700 text-sm">Excelente workshop! O João explica de forma muito clara e os exercícios práticos ajudam muito a fixar o conteúdo. Recomendo para quem está começando em UX.</span>
                                                                        </div>
                                                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">Há 2 semanas</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-center justify-center min-w-[180px] md:justify-center md:self-center">
                                                            <div className="flex flex-col items-center justify-center h-full">
                                                                <span className="text-4xl font-bold text-gray-900 leading-none">4.8</span>
                                                                <span className="flex items-center text-yellow-500 text-xl mb-1">{[...Array(5)].map((_,i)=>(<FaStar key={i}/>))}</span>
                                                                <span className="text-gray-600 text-sm">127 avaliações</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>
                <div className="mt-8">
                    <EventButton className="w-full bg-gray-900 text-white hover:bg-gray-800 py-6 text-2xl flex items-center justify-center gap-3 rounded-lg">
                        <FaCheckCircle /> Se inscrever - R$72.00
                    </EventButton>
                </div>
            </div>
        </div>
    );
}

export default EventDescription;
