import { useState } from "react";
import { toast } from "react-toastify";
import api from "../api.js";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Registrar";
    const isLogin = method === "login";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            const res = await api.post(route, { username, password });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            // alert(error);
            toast.error(`Erro: ${error.response?.status} - ${error.response?.data?.message || "Falha na requisição!"}`, {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <ToastContainer />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-white px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {name}
                        </h2>
                        <p className="text-sm text-gray-600">
                            {isLogin
                                ? "Entre na sua conta para continuar"
                                : "Crie sua conta para começar"
                            }
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            {/* Username Input */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Usuário
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder={isLogin
                                        ? "Nome de Usuário"
                                        : "Crie um Usuário"
                                        }
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    {}
                                    Senha
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={isLogin
                                        ? "Digite sua Senha"
                                        : "Crie uma Senha"
                                        }
                                        required
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-blue-600 bg-white ring-1 ring-blue-600 hover:ring-blue-600 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Entrando...
                                    </div>
                                ) : (
                                    name
                                )}
                            </button>
                        </div>

                        {/* Footer Links */}
                        <div className="text-center">
                            {isLogin ? (
                                <p className="text-sm text-gray-600">
                                    Não tem uma conta?{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/register")}
                                        className="font-medium text-blue-600 hover:text-blue-600 transition-colors duration-200 hover:cursor-pointer"
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
                                        className="font-medium text-blue-600 hover:text-blue-600 transition-colors duration-200 hover:cursor-pointer"
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
