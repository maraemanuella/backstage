function Filtro({ filtroAtivo, setFiltroAtivo }) {
  const filtros = ["Todos", "Workshop", "Palestra", "Networking", "Curso"];
  
  const buttonClass = (isActive) => `
    px-5 py-2 rounded-full border-2 transition-all duration-200 font-medium text-sm md:text-base
    ${isActive 
      ? "bg-black text-white border-black" 
      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
    }
  `;

  return (
    <div className="w-full px-4 mt-6 md:mt-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {filtros.map((filtro) => (
            <button
              key={filtro}
              className={buttonClass(filtroAtivo === filtro)}
              onClick={() => setFiltroAtivo(filtro)}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Filtro;
