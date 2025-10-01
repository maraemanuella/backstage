
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";


function Eventos({ eventos }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-3 gap-4 w-[100vh] ml-auto mr-auto">
      {eventos.map((evento) => (
        <div
          key={evento.id}
          className="w-[300px] h-[300px] shadow-7xl rounded-2xl flex flex-col gap-1 cursor-pointer hover:duration-200 hover:scale-105"
        >
          {/* image_evento */}
          <div className="w-[300px] h-[200px] flex justify-center items-center bg-gray-400/20 rounded-t-2xl">
            <img src="#" alt="event_img" />
          </div>

          {/* Nome */}
          <h1 className="font-[500] ml-[10px]">{evento.nome}</h1>

          {/* local e data */}
          <div className="ml-[10px] flex gap-2">
            <span className="text-black/60 flex gap-1">
              <MapPin className="w-3" /> {evento.local}
            </span>
            <span className="text-red-500">{evento.data_hora}</span>
          </div>

          {/* preço */}
          <div>
            <span className="ml-[10px] text-black/60">R${evento.preco}</span>
            <span className="bg-green-300/40 p-1 rounded-2xl text-green-900 ml-2">
              80% OFF
            </span>
          </div>

          {/* botão */}
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
