import { CircleArrowLeft, CircleArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

function MeuEventoOpcao({ openMeuEvento }) {
  if (openMeuEvento) {
    return (
      <div className="bg-gray-200 w-[280px] h-[120px] flex flex-col rounded-b-lg justify-center ">
        <ul className="flex flex-col gap-2 ml-2 text-lg">
          <li className="hover:bg-lime-300 pl-1 rounded w-[260px] cursor-pointer hover:text-black/60 transition-colors duration-300">
            <Link to="#" className="flex gap-1 items-center">
              <CircleArrowRight className="h-5 w-5" /> Proximos
            </Link>
          </li>

          <li className="hover:bg-sky-300 pl-1 rounded w-[260px] cursor-pointer  hover:text-black/60 transition-colors duration-300">
            <Link to="#" className="flex gap-1 items-center">
              <CircleArrowLeft className="h-5 w-5" /> Passados
            </Link>
          </li>

          <li className="hover:bg-red-400 pl-1 rounded w-[260px] cursor-pointer hover:text-white/80 transition-colors duration-300">
            <Link to="/heart" className="flex gap-1 items-center">
              <Heart className="h-5 w-5" />
              Favoritos
            </Link>
          </li>
        </ul>
      </div>
    );
  }

  return null;
}

export default MeuEventoOpcao;
