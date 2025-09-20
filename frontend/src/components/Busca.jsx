import { Search } from "lucide-react";

function Busca(params) {
  return (
    <div
      id="search-bar"
      className="flex border-2 items-center mt-[20px] ml-[700px] mr-[700px] p-[5px] rounded-2xl "
    >
      <Search />
      <input
        type="text"
        placeholder="Encontre seu evento..."
        className="outline-none"
      />
    </div>
  );
}

export default Busca;
