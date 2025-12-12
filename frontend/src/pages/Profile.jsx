import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api.js";
import {
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaPlus,
  FaEdit,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaHome,
  FaQrcode,
  FaQuestionCircle,
} from "react-icons/fa";
import { Award, TrendingUp, Star } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [rankingData, setRankingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserStatistics();
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await api.get("/api/user/ranking/");
      setRankingData(response.data);
    } catch (error) {
      console.error("Erro ao buscar ranking:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("api/user/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
        return;
      }

      setError("Erro ao carregar perfil do usuário");
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatistics = async () => {
    try {
      const token = localStorage.getItem("access");
      if (!token) return;

      const inscricoesResponse = await api.get("api/inscricoes/minhas/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const inscricoes = inscricoesResponse.data;
      const eventosParticipados = inscricoes.length;
      const eventosComCheckin = inscricoes.filter(
        (i) => i.checkin_realizado
      ).length;
      const taxaComparecimento =
        eventosParticipados > 0
          ? ((eventosComCheckin / eventosParticipados) * 100).toFixed(1)
          : 0;

      setStatistics({
        eventosParticipados,
        eventosComCheckin,
        taxaComparecimento,
        inscricoes: inscricoes.slice(0, 5),
      });
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  const getNivelIcon = (nivel) => {
    switch (nivel) {
      case "Diamante":
        return <Star className="w-5 h-5" fill="currentColor" />;
      case "Platina":
      case "Ouro":
        return <Award className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
    toast.success("Logout realizado com sucesso!");
  };

  const handleEditProfile = () => navigate("/perfil/editar");
  const handleSettings = () => navigate("/configuracoes");

  const handleCreateEvents = () => {
    if (user.documento_verificado !== "aprovado") {
      toast.warning(
        "Você precisa ter seus documentos aprovados para criar eventos!"
      );
      navigate("/credenciamento");
      return;
    }
    navigate("/criar-evento");
  };

  const handleCheckinScan = () => navigate("/checkin/scan");
  const handleSAC = () => navigate("/sac");

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Carregando perfil...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500">{error || "Erro ao carregar perfil"}</div>
      </div>
    );
  }

  // Valor padrão caso rankingData ainda não tenha carregado
  const { score, nivel, cor, proximo_nivel, descricao } = rankingData || {
    score: user.score || 5.0,
    nivel: "Bronze",
    cor: "#CD7F32",
    proximo_nivel: {
      no_maximo: false,
      score_faltante: 0,
      proximo_nivel: "Prata",
      score_necessario: 10,
    },
    descricao: { titulo: "Bronze", descricao: "Carregando...", beneficios: [] },
  };

  const porcentagemProximoNivel =
    proximo_nivel && !proximo_nivel.no_maximo
      ? ((score -
          (proximo_nivel.score_necessario -
            proximo_nivel.score_faltante)) /
          proximo_nivel.score_faltante) *
        100
      : 100;

  return (
    <div className="min-h-screen bg-white py-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto px-4">
        {/* Voltar */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-sky-700 hover:text-sky-800 transition-colors"
          >
            <FaHome className="mr-2" />
            Voltar para Home
          </button>
        </div>

        {/* Cabeçalho */}
        <div className="bg-white shadow-7xl rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Foto */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user.profile_photo ? (
                  <img
                    src={
                      user.profile_photo.startsWith("http")
                        ? user.profile_photo
                        : user.profile_photo
                    }
                    alt="Foto do perfil"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <FaUser className="text-gray-400 text-3xl" />
                )}
              </div>
            </div>

            {/* Nome */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-[600] text-black mb-2">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username}
              </h1>
            </div>

            {/* Card Ranking */}
            <div className="w-full md:w-auto md:min-w-[280px]">
              <div
                className="rounded-2xl overflow-hidden shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${cor} 0%, ${cor}dd 100%)`,
                }}
              >
                {/* Header */}
                <div className="px-6 py-4 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      {getNivelIcon(nivel)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{nivel}</h3>
                      <p className="text-xs opacity-90">
                        {descricao.descricao}
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center py-2">
                    <div className="text-5xl font-bold tracking-tight">
                      {score.toFixed(1)}
                    </div>
                    <div className="text-xs opacity-75 uppercase tracking-wider mt-1">
                      Score
                    </div>
                  </div>
                </div>

                {/* Barra de progresso */}
                {!proximo_nivel.no_maximo && (
                  <div className="px-6 py-3 bg-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-xs text-white/90 mb-2">
                      <span>
                        Próximo:{" "}
                        <span className="font-semibold">
                          {proximo_nivel.proximo_nivel}
                        </span>
                      </span>
                      <span className="font-semibold">
                        {Math.round(porcentagemProximoNivel)}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-500"
                        style={{
                          width: `${porcentagemProximoNivel}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        {descricao.beneficios &&
          descricao.beneficios.length > 0 && (
            <div className="bg-white shadow-7xl rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-[600] mb-4 flex items-center gap-2">
                <Award className="text-sky-700" />
                Benefícios do seu Nível
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {descricao.beneficios.map((beneficio, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cor }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {beneficio}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Estatísticas */}
        <div className="bg-white shadow-7xl rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-[600] mb-4 flex items-center gap-2">
            <FaChartLine className="text-sky-700" />
            Estatísticas
          </h2>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <div className="text-3xl font-[600] text-sky-700 mb-1">
                {statistics?.eventosParticipados || 0}
              </div>
              <div className="text-black/60 text-sm">Eventos Participados</div>
            </div>

            {statistics?.eventosParticipados > 0 && (
              <div className="text-center p-4 bg-gray-50 rounded-2xl">
                <div className="text-3xl font-[600] text-green-600 mb-1">
                  {statistics?.taxaComparecimento || 0}%
                </div>
                <div className="text-black/60 text-sm">
                  Taxa de Comparecimento
                </div>
              </div>
            )}

            <div className="text-center p-4 bg-gray-50 rounded-2xl">
              <div className="text-3xl font-[600] text-purple-600 mb-1">
                {statistics?.eventosComCheckin || 0}
              </div>
              <div className="text-black/60 text-sm">Check-ins Realizados</div>
            </div>
          </div>

          {/* Eventos Recentes */}
          {statistics?.inscricoes &&
            statistics.inscricoes.length > 0 && (
              <div>
                <h3 className="text-lg font-[500] mb-3">
                  Eventos Recentes
                </h3>

                <div className="space-y-3">
                  {statistics.inscricoes.map((inscricao, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <div className="font-[500]">
                          {inscricao.evento_titulo}
                        </div>
                        <div className="text-sm text-black/60">
                          {new Date(
                            inscricao.evento_data
                          ).toLocaleDateString("pt-BR")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {inscricao.checkin_realizado ? (
                          <FaCheckCircle
                            className="text-green-500 text-lg"
                            title="Check-in realizado"
                          />
                        ) : (
                          <FaTimesCircle
                            className="text-gray-400 text-lg"
                            title="Sem check-in"
                          />
                        )}

                        <span
                          className={`px-3 py-1 rounded-2xl text-xs font-[500] ${
                            inscricao.status === "confirmada"
                              ? "bg-green-300/40 text-green-900"
                              : "bg-yellow-300/40 text-yellow-900"
                          }`}
                        >
                          {inscricao.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Ações */}
        <div className="bg-white shadow-7xl rounded-2xl p-6">
          <h2 className="text-xl font-[600] mb-4">Ações</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleEditProfile}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-200"
            >
              <FaEdit className="text-sky-700 text-xl" />
              <div>
                <div className="font-[500]">Editar Perfil</div>
                <div className="text-sm text-black/60">
                  Alterar informações pessoais
                </div>
              </div>
            </button>

            <button
              onClick={handleSettings}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-200"
            >
              <FaCog className="text-gray-500 text-xl" />
              <div>
                <div className="font-[500]">Configurações</div>
                <div className="text-sm text-black/60">
                  Preferências e privacidade
                </div>
              </div>
            </button>

            <button
              onClick={handleCreateEvents}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-200"
            >
              <FaPlus className="text-green-500 text-xl" />
              <div>
                <div className="font-[500]">Quero Criar Eventos</div>
                <div className="text-sm text-black/60">
                  Torne-se um organizador
                </div>
              </div>
            </button>

            <button
              onClick={handleCheckinScan}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-200"
            >
              <FaQrcode className="text-blue-500 text-xl" />
              <div>
                <div className="font-[500]">Check-in por QR Code</div>
                <div className="text-sm text-black/60">
                  Escanear para fazer check-in
                </div>
              </div>
            </button>

            <button
              onClick={handleSAC}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-200"
            >
              <FaQuestionCircle className="text-indigo-500 text-xl" />
              <div>
                <div className="font-[500]">SAC - Suporte</div>
                <div className="text-sm text-black/60">
                  Central de ajuda e atendimento
                </div>
              </div>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl hover:bg-red-50 hover:scale-105 transition-all duration-200"
            >
              <FaSignOutAlt className="text-red-500 text-xl" />
              <div>
                <div className="font-[500]">Sair</div>
                <div className="text-sm text-black/60">Encerrar sessão</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
