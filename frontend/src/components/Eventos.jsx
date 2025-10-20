import { Heart, MapPin, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FavoritesContext } from "../contexts/FavoritesContext";
import api from "../api.js";

function Eventos({ eventos }) {
  const navigate = useNavigate();
  const { favorites = [], setFavorites } = useContext(FavoritesContext);

  if (!eventos || !Array.isArray(eventos) || eventos.length === 0) {
    return (
      <div className="w-full px-4 mt-6 md:mt-8 pb-12">
        <div className="max-w-6xl mx-auto text-center py-12">
          <p className="text-gray-500 text-lg">Nenhum evento disponível no momento.</p>
        </div>
      </div>
    );
  }

  const toggleFavorite = async (eventoId) => {
    try {
      const res = await api.post(`/api/favorites/toggle/${eventoId}/`);
      if (res.data.favorito) {
        setFavorites([...favorites, eventoId]);
      } else {
        setFavorites(favorites.filter((id) => id !== eventoId));
      }
    } catch (error) {
      console.error("Erro ao alternar favorito:", error);
    }
  };

  const getImageUrl = (imagem) => {
    if (!imagem) return null;
    return imagem.startsWith('http') ? imagem : `${import.meta.env.VITE_API_URL}${imagem}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    const dateOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };

    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    const formattedDate = date.toLocaleDateString('pt-BR', dateOptions);
    const formattedTime = date.toLocaleTimeString('pt-BR', timeOptions);

    return `${formattedDate} às ${formattedTime}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0,00';
    return Number(price).toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  return (
    <div className="w-full px-4 mt-6 md:mt-8 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((evento) => (
            <div
              key={evento.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="relative w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300">
                {getImageUrl(evento.foto_capa) ? (
                  <img
                    src={getImageUrl(evento.foto_capa)}
                    alt={evento.titulo}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => e.target.style.display = "none"}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Sem imagem</span>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(evento.id);
                  }}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    favorites.includes(evento.id)
                      ? "bg-red-500 text-white"
                      : "bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white"
                  }`}
                >
                  <Heart
                    size={18}
                    fill={favorites.includes(evento.id) ? "currentColor" : "none"}
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Category badge */}
                {evento.categoria && (
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full mb-2">
                    {evento.categoria}
                  </span>
                )}

                {/* Title */}
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                  {evento.titulo}
                </h3>

                {/* Date and location */}
                <div className="flex flex-col gap-1 mb-3">
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <span className="font-medium">{formatDate(evento.data_evento)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{evento.endereco}</span>
                  </div>
                </div>

                {/* Capacity info */}
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                  <Users size={16} />
                  <span>
                    {evento.inscritos_count || 0}/{evento.capacidade_maxima} inscritos
                  </span>
                  {evento.esta_lotado && (
                    <span className="ml-auto text-red-500 font-medium text-xs">LOTADO</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-green-600 font-semibold text-lg">
                    R$ {formatPrice(evento.valor_deposito)}
                  </span>
                  {evento.valor_com_desconto && evento.valor_com_desconto < evento.valor_deposito && (
                    <span className="text-xs text-gray-500 line-through">
                      R$ {formatPrice(evento.valor_deposito)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/evento/${evento.id}`)}
                  className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Eventos;
