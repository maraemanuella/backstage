function Filtro({ filtroAtivo, setFiltroAtivo }) {
  const filtros = ["Todos", "Workshop", "Palestras", "Networking", "Cursos"];

  return (
    <div className="mb-[10px]">
      <ul className="flex flex-row gap-5 mt-[20px] w-auto ml-[52vh]">
        {filtros.map((id_filtro) => (
          <li
            key={id_filtro}
            className={`border p-1.5 rounded-2xl cursor-pointer hover:transition-transform duration-200 hover:scale-105
              ${
                filtroAtivo === id_filtro
                  ? "bg-sky-500 text-white"
                  : "hover:bg-black/10"
              }`}
            onClick={() => setFiltroAtivo(id_filtro)}
          >
            <button className="w-25 cursor-pointer">{id_filtro}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Filtro;
