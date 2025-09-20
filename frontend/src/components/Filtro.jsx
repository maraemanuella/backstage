import { useState } from "react";

function Filtro() {
  const filtros = ["Todos", "WorkShop", "Palestras", "Networking", "Cursos"];
  const [ativo, setAtivo] = useState("Todos");

  return (
    <div>
      <ul className="flex flex-row gap-5 mt-[20px] w-auto ml-[400px] ">
        {filtros.map((id_filtro) => (
          <li
            key={id_filtro}
            className={`border p-1.5 rounded-2xl cursor-pointer  hover:transition-transform duration-200 hover:scale-105
              
              ${
                ativo === id_filtro
                  ? "bg-sky-500 text-white"
                  : "hover:bg-black/10"
              }`}
            onClick={() => setAtivo(id_filtro)}
          >
            <button className="cursor-pointer">{id_filtro}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Filtro;
