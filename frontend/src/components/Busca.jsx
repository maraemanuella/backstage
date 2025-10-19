import { Search } from "lucide-react";

function Busca({ busca, setBusca }) {
  return (
    <div className="flex justify-center w-full px-4 mt-6 md:mt-8">
      <div className="flex items-center border-2 border-gray-300 rounded-lg px-4 py-3 w-full max-w-md md:max-w-lg focus-within:border-gray-400 transition-colors">
        <Search className="text-gray-400 mr-3" size={20} />
        <input
          type="text"
          placeholder="Buscar eventos..."
          aria-label="Buscar eventos"
          className="outline-none flex-1 text-gray-700 placeholder-gray-400"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Busca;
