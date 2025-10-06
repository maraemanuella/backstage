import { PartyPopper } from "lucide-react";
import { useState } from "react";
import MeuEventoOpcao from "./MeuEventoOpcao";

function MeuEvento() {
  const [meuOpcao, setMeuOpcao] = useState(false);
  return (
    <div
      className="flex justify-center flex-col ml-2"
      onMouseEnter={() => setMeuOpcao(true)}
      onMouseLeave={() => setMeuOpcao(false)}
    >
      <button className=" text-black p-1 rounded w-[280px] shadow-7xl cursor-pointer mt-4 hover:bg-black  hover:text-white transition-colors duration-300">
        <span className="flex items-center gap-2 ml-[10px]">
          {" "}
          <PartyPopper /> Meus Eventos
        </span>
      </button>
      <MeuEventoOpcao openMeuEvento={meuOpcao} />
    </div>
  );
}

export default MeuEvento;
