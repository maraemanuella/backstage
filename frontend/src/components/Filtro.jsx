import { useState, useRef, useEffect } from 'react';

function Filtro({ filtroAtivo, setFiltroAtivo }) {
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 4 categorias principais + Todos (desktop)
  const categoriaPrincipaisDesktop = ["Todos", "Workshop", "Hackathon", "Meetup", "Networking"];

  // Todas as categorias para dropdown mobile (exceto Todos)
  const todasCategoriasMobile = [
    "Workshop", "Hackathon", "Meetup", "Networking",
    "Palestra", "Curso", "Conferência", "Seminário",
    "Webinar", "Treinamento", "Festa", "Show",
    "Esporte", "Cultural", "Voluntariado", "Outro"
  ];

  // Categorias no dropdown desktop (apenas as restantes)
  const categoriasDropdownDesktop = [
    "Palestra", "Curso", "Conferência", "Seminário",
    "Webinar", "Treinamento", "Festa", "Show",
    "Esporte", "Cultural", "Voluntariado", "Outro"
  ];

  // Escolher quais categorias usar baseado no dispositivo
  const categoriasVisveis = isMobile ? ["Todos"] : categoriaPrincipaisDesktop;
  const categoriasDropdown = isMobile ? todasCategoriasMobile : categoriasDropdownDesktop;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickFora = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const buttonClass = (isActive) => `
    px-6 py-2.5 rounded-full transition-all duration-300 font-medium text-sm hover:cursor-pointer whitespace-nowrap
    ${isActive 
      ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/30 scale-105" 
      : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200"
    }
  `;

  const handleSelecionarCategoria = (categoria) => {
    setFiltroAtivo(categoria);
    setDropdownAberto(false);
  };

  const categoriaNoDropdown = categoriasDropdown.includes(filtroAtivo);

  return (
    <div className="w-full px-4 mt-6 md:mt-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-3 items-center flex-wrap">
          {/* Categorias principais (Todos + outras no desktop) */}
          {categoriasVisveis.map((filtro) => (
            <button
              key={filtro}
              className={buttonClass(filtroAtivo === filtro)}
              onClick={() => setFiltroAtivo(filtro)}
            >
              {filtro}
            </button>
          ))}

          {/* Dropdown "Mais categorias" ou "Categorias" (mobile) */}
          <div className="relative" ref={dropdownRef}>
            <button
              className={`
                px-6 py-2.5 rounded-full transition-all duration-300 font-medium text-sm hover:cursor-pointer whitespace-nowrap flex items-center gap-2
                ${categoriaNoDropdown
                  ? "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg shadow-gray-900/30 scale-105" 
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200"
                }
              `}
              onClick={() => setDropdownAberto(!dropdownAberto)}
            >
              {isMobile
                ? (categoriaNoDropdown ? filtroAtivo : "Categorias")
                : (categoriaNoDropdown ? filtroAtivo : "Mais categorias")
              }
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${dropdownAberto ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Menu dropdown */}
            {dropdownAberto && (
              <div className="absolute top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 min-w-[200px] max-w-[90vw] z-50 animate-slideDown left-0 md:left-auto">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isMobile ? "Todas as Categorias" : "Outras Categorias"}
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {categoriasDropdown.map((categoria) => (
                    <button
                      key={categoria}
                      className={`
                        w-full text-left px-4 py-2.5 transition-all duration-200 text-sm font-medium
                        ${filtroAtivo === categoria
                          ? "bg-gray-100 text-gray-900" 
                          : "text-gray-700 hover:bg-gray-50"
                        }
                      `}
                      onClick={() => handleSelecionarCategoria(categoria)}
                    >
                      {categoria}
                      {filtroAtivo === categoria && (
                        <svg className="inline-block w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filtro;
