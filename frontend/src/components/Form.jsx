import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import api from "../api.js";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants.js";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import "react-toastify/dist/ReactToastify.css";
import '../styles/Form.css'
import Img from '../assets/logo.png'
import { useGoogleLogin } from '@react-oauth/google';


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

  // handler para quando o Google retornar o authorization code (fluxo auth-code)
  const handleGoogleCodeSuccess = async (codeResponse) => {
    try {
      setLoading(true);

      if (!codeResponse?.code) {
        throw new Error('Código do Google não recebido');
      }

      const res = await api.post('/api/auth/google/', {
        code: codeResponse.code,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (res.data?.access) localStorage.setItem(ACCESS_TOKEN, res.data.access);
      if (res.data?.refresh) localStorage.setItem(REFRESH_TOKEN, res.data.refresh);

      toast.success('Login com Google realizado!', { position: 'bottom-right', autoClose: 2000 });
      navigate('/');
    } catch (error) {
      let msg = 'Erro ao fazer login com Google';
      if (error.response && error.response.data) {
        msg = (error.response.data.error || JSON.stringify(error.response.data));
      }
      toast.error(msg, { position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  };

  // Hook para iniciar o login via authorization code (PKCE)
  const loginWithGoogle = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: handleGoogleCodeSuccess,
    onError: () => {
      toast.error('Falha no login com Google', { position: 'bottom-right' });
    },
    scope: 'openid profile email'
  });

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
                {!isLogin && <PasswordStrengthIndicator password={password} />}
                {isLogin && (
                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm text-gray-600 hover:text-black hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-medium bg-black text-white hover:bg-gray-900 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 hover:cursor-pointer"
              >
                {loading ? "Carregando..." : name}
              </button>

              {/* Separador */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                </div>
              </div>

              {/* Botão de Login com Google */}
              <button
                type="button"
                onClick={() => loginWithGoogle()}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 hover:cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Conectar com Google
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
