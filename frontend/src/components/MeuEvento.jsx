import { PartyPopper } from "lucide-react";
import { useNavigate } from "react-router-dom";

function MeuEvento() {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-center flex-col ml-2">
      <button 
        onClick={() => navigate('/meus-eventos')}
        className="text-black p-1 rounded w-[280px] shadow-7xl cursor-pointer mt-4 hover:bg-black hover:text-white transition-colors duration-300"
      >
        <span className="flex items-center gap-2 ml-[10px]">
          <PartyPopper /> Meus Eventos
        </span>
      </button>
    </div>
  );
}

export default MeuEvento;
