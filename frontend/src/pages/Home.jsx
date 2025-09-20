import Header from "./components/header";
import Busca from "./components/Busca";
import Filtro from "./components/Filtro";
import Select from "./components/Select";

function Home(params) {
  return (
    <main>
      <Header />
      <Busca />
      <Filtro />
      <Select />
    </main>
  );
}

export default Home;
