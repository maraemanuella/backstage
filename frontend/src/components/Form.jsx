import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../api.js";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants.js";
import "react-toastify/dist/ReactToastify.css";
import '../styles/Form.css'
import Img from '../assets/logo.png'


function Form({ route, method }) {
  const [loginOrEmail, setLoginOrEmail] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isLogin = method === "login";
  const name = isLogin ? "Login" : "Registrar";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiRoute = route.endsWith("/") ? route : route + "/";

      const payload = isLogin
        ? { login: loginOrEmail, password }
        : { username, email, password };

      const res = await api.post(apiRoute, payload);

      if (isLogin) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        toast.success("Usuário registrado com sucesso!", {
          position: "bottom-right",
          autoClose: 3000,
        });
        navigate("/login");
      }
    } catch (error) {
      let errorMessage = "Erro desconhecido";

      if (error.response) {
        const data = error.response.data;
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors) {
          errorMessage = data.non_field_errors.join(" ");
        } else {
          errorMessage = Object.entries(data)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");
        }
      } else if (error.request) {
        errorMessage = "Sem resposta do servidor: Verifique sua conexão.";
      } else {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { position: "bottom-right", autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <main className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 select-none">
        <div className="container hidden md:flex bg-black text-white items-center justify-center">
            <img src={Img} alt="" className={"w-1/2"}/>
        </div>

        <div className="flex items-center justify-center bg-white px-8 sm:px-16">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">{name}</h2>
              <p className="text-sm text-gray-600 mt-2">
                {isLogin
                  ? "Entre na sua conta para continuar"
                  : "Crie sua conta para começar"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isLogin ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuário ou Email
                  </label>
                  <input
                    type="text"
                    value={loginOrEmail}
                    onChange={(e) => setLoginOrEmail(e.target.value)}
                    placeholder="Usuário ou Email"
                    required
                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuário
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Nome de usuário"
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                      className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-medium bg-black text-white hover:bg-gray-900 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 hover:cursor-pointer"
              >
                {loading ? "Carregando..." : name}
              </button>

              <div className="text-center text-sm text-gray-600">
                {isLogin ? (
                  <p>
                    Não tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="font-medium text-black hover:underline hover:cursor-pointer"
                    >
                      Registre-se aqui
                    </button>
                  </p>
                ) : (
                  <p>
                    Já tem uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="font-medium text-black hover:underline hover:cursor-pointer"
                    >
                      Faça login
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default Form;
