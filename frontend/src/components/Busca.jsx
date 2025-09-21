import { Search } from "lucide-react";

function Busca({ busca, setBusca }) {
  return (
    <div
      id="search-bar"
      className="flex border-2 items-center mt-[20px] mx-auto p-[5px] rounded-[10px] w-[30%] min-w-[250px]"
    >
      <Search className="text-gray-500 mr-2" />
      <input
        type="text"
        placeholder="Encontre seu evento..."
        aria-label="Buscar eventos"
        className="outline-none flex-1"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
    </div>
  );
}

export default Busca;
