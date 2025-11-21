import { PartyPopper, ChevronDown, CircleArrowRight, CircleArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Link } from "react-router-dom";

function MeuEvento() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="flex justify-center flex-col ml-2">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="text-black p-3 rounded w-[280px] cursor-pointer hover:bg-black hover:text-white hover:font-bold transition-all duration-300 flex items-center justify-between"
      >
        <span className="flex items-center gap-3">
          <PartyPopper className="h-5 w-5" /> 
          Meus Eventos
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Submenu expandido */}
      {expanded && (
        <div className="bg-gray-100 rounded mt-1 py-2 animate-in slide-in-from-top duration-200">
          <Link
            to="/proximos"
            className="flex items-center gap-3 px-6 py-2 text-black hover:bg-lime-300 hover:font-bold transition-all duration-300"
          >
            <CircleArrowRight className="h-4 w-4" />
            <span>Futuros</span>
          </Link>
          <Link
            to="/passados"
            className="flex items-center gap-3 px-6 py-2 text-black hover:bg-sky-300 hover:font-bold transition-all duration-300"
          >
            <CircleArrowLeft className="h-4 w-4" />
            <span>Passados</span>
          </Link>
          <Link
            to="/heart"
            className="flex items-center gap-3 px-6 py-2 text-black hover:bg-red-400 hover:text-white hover:font-bold transition-all duration-300"
          >
            <Heart className="h-4 w-4" />
            <span>Favoritos</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default MeuEvento;
