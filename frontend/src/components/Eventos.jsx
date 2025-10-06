import { Heart, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FavoritesContext } from "../contexts/FavoritesContext";
import api from "../api.js";

function Eventos({ eventos }) {
  const navigate = useNavigate();
  const { favorites = [], setFavorites } = useContext(FavoritesContext);

  if (!eventos || !Array.isArray(eventos)) return null;

  const toggleFavorite = async (eventoId) => {
  console.log("Evento ID:", eventoId);
  try {
    const res = await api.post(`/api/favorites/toggle/${eventoId}/`);
    console.log(res.data);
    if (res.data.favorito) {
      setFavorites([...favorites, eventoId]);
    } else {
      setFavorites(favorites.filter((id) => id !== eventoId));
    }
  } catch (error) {
    console.error("Erro ao alternar favorito:", error);
  }
};

  return (
    <div className="grid grid-cols-3 gap-4 w-[100vh] ml-auto mr-auto">
      {eventos.map((evento) => (
        <div key={evento.id} className="relative w-[300px] h-[300px] shadow-7xl rounded-2xl flex flex-col gap-1 cursor-pointer hover:duration-200 hover:scale-105">
          <div
            onClick={() => toggleFavorite(evento.id)}
            className={`absolute h-8 w-8 top-1 right-1 m-3 hover:bg-red-500/90 rounded-2xl p-1 hover:text-white/90 cursor-pointer transition-colors duration-100
              ${favorites.includes(evento.id) ? "bg-red-500/90 text-white/90" : "bg-white/90 text-black/60"}`}
          >
            <Heart />
          </div>
          <div className="w-[300px] h-[200px] flex justify-center items-center bg-gray-400/20 rounded-t-2xl">
            <img src="#" alt="event_img" />
          </div>
          <h1 className="font-[500] ml-[10px]">{evento.titulo}</h1>
          <div className="ml-[10px] flex gap-2">
            <span className="text-black/60 flex gap-1"><MapPin className="w-3" /> {evento.endereco}</span>
            <span className="text-red-500">{evento.data_evento}</span>
          </div>
          <div>
            <span className="ml-[10px] text-black/60">R${evento.valor_deposito}</span>
            <span className="bg-green-300/40 p-1 rounded-2xl text-green-900 ml-2">{evento.valor_deposito}% OFF</span>
          </div>
          <button
            className="bg-black rounded-b-2xl text-white mt-[10px] hover:bg-sky-700 hover:duration-200 hover:scale-105"
            onClick={() => navigate(`/evento/${evento.id}`)}
          >
            Ver detalhes
          </button>
        </div>
      ))}
    </div>
  );
}

export default Eventos;
