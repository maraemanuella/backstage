import { Link } from "react-router-dom";
import { Ghost } from "lucide-react";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen
                    bg-gradient-to-br from-gray-100 via-white to-gray-200
                    text-gray-900 px-6
                    dark:from-gray-900 dark:via-black dark:to-gray-800 dark:text-white">
      <div className="flex flex-col items-center text-center space-y-6">
        <Ghost className="w-24 h-24 text-black animate-bounce dark:text-white" />

        <h1 className="text-7xl font-extrabold bg-clip-text text-transparent
                       bg-black dark:bg-white  ">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold">
          Página não encontrada
        </h2>

        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Talvez a página que você está buscando não exista, tenha sido movida ou esteja
          se escondendo de você por enquanto.
        </p>

        <Link
          to="/"
          className="mt-4 px-6 py-3 bg-black
                     text-white rounded-2xl shadow-lg transition-all
                     dark:bg-white dark:text-black hover:scale-105"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
