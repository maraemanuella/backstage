import { ChevronDown } from "lucide-react";

function Select(params) {
  const selects = [
    "Todas as datas",
    "Todas as localizações",
    "Todos os preços",
  ];

  return (
    <div>
      <ul className="flex flex-row gap-10 mt-5 ml-[400px]">
        {selects.map((id_selects) => (
          <li key={id_selects}>
            <button className="flex flex-row gap-30 border rounded-[5px] p-1 cursor-pointer hover:bg-sky-500 hover:text-white hover:duration-200">
              {id_selects} <ChevronDown />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Select;
