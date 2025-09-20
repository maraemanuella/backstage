import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../api.js";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants.js";
import "react-toastify/dist/ReactToastify.css";

function Form({ route, method }) {
  const [loginOrEmail, setLoginOrEmail] = useState(""); // usado apenas no login
  const [username, setUsername] = useState(""); // novo campo para registro
  const [email, setEmail] = useState("");       // novo campo para registro
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

        const payload = {
          login: loginOrEmail,
          password
        };

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
              errorMessage = data.detail; // JWT padrão
            } else if (data.non_field_errors) {
              // Traduz para algo mais amigável
              errorMessage = data.non_field_errors.join(" "); // "Usuário ou senha inválidos"
            } else {
              // Outros erros de campo
              errorMessage = Object.entries(data)
                .map(([key, value]) => `${key}: ${value}`)
                .join("\n");
            }
          } else if (error.request) {
            errorMessage = "Sem resposta do servidor. Verifique sua conexão.";
          } else {
            errorMessage = error.message;
          }

          toast.error(errorMessage, { position: "bottom-right", autoClose: 5000 });
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{name}</h2>
            <p className="text-sm text-gray-600">
              {isLogin
                ? "Entre na sua conta para continuar"
                : "Crie sua conta para começar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {isLogin ? (
                // Login: apenas login/email
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
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                  />
                </div>
              ) : (
                // Registro: username + email
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
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
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
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                    />
                  </div>
                </>
              )}

              {/* Password */}
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
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-blue-600 bg-white ring-1 ring-blue-600 hover:ring-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] hover:cursor-pointer"
              >
                {loading ? "Carregando..." : name}
              </button>
            </div>

            <div className="text-center">
              {isLogin ? (
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="font-medium text-blue-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                  >
                    Registre-se aqui
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="font-medium text-blue-600 hover:text-blue-600 transition-colors duration-200 cursor-pointer"
                  >
                    Faça login
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Form;
