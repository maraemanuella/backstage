import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import api from "../api.js";
import { CheckCircle, XCircle, Eye, FileText, User, Calendar, Phone, Mail, X } from "lucide-react";

function VerificarDocumentosAdmin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificacoes, setVerificacoes] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [userToReject, setUserToReject] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [filtro, setFiltro] = useState("todos"); // todos, pendente, verificando, rejeitado

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Verifica se é admin
        const userRes = await api.get("/api/user/me/");
        const userData = userRes.data;
        setUser(userData);
        
        if (!userData.is_staff) {
          alert("Acesso negado. Apenas administradores podem acessar esta página.");
          navigate('/');
          return;
        }

        // Busca verificações pendentes
        const verificacoesRes = await api.get("/api/admin/verificacoes/pendentes/");
        setVerificacoes(verificacoesRes.data);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        if (error.response?.status === 403) {
          alert("Acesso negado. Apenas administradores podem acessar esta página.");
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAprovar = async (userId) => {
    try {
      await api.post(`/api/admin/verificacoes/${userId}/aprovar/`);
      
      // Remove da lista
      setVerificacoes(verificacoes.filter(v => v.id !== userId));
      
      alert("Documento aprovado com sucesso!");
      setSelectedUser(null);
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      alert("Erro ao aprovar documento.");
    }
  };

  const handleRejeitar = async (userId) => {
    if (!motivo.trim()) {
      alert("Por favor, informe o motivo da rejeição.");
      return;
    }

    try {
      await api.post(`/api/admin/verificacoes/${userId}/rejeitar/`, {
        motivo: motivo
      });
      
      // Atualiza o status na lista
      setVerificacoes(verificacoes.map(v => 
        v.id === userId ? { ...v, documento_verificado: 'rejeitado' } : v
      ));
      
      alert("Documento rejeitado.");
      setShowRejectModal(false);
      setUserToReject(null);
      setMotivo("");
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      alert("Erro ao rejeitar documento.");
    }
  };

  const verificacoesFiltradas = verificacoes.filter(v => {
    if (filtro === "todos") return true;
    return v.documento_verificado === filtro;
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando verificações...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header user={user} setOpenModal={setOpenModal} />
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verificação de Documentos</h1>
          <p className="text-lg text-gray-600">Gerencie as solicitações de verificação de documentos dos usuários</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setFiltro("todos")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === "todos" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todos ({verificacoes.length})
            </button>
            <button
              onClick={() => setFiltro("pendente")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === "pendente" 
                  ? "bg-yellow-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pendentes ({verificacoes.filter(v => v.documento_verificado === 'pendente').length})
            </button>
            <button
              onClick={() => setFiltro("verificando")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === "verificando" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Verificando ({verificacoes.filter(v => v.documento_verificado === 'verificando').length})
            </button>
            <button
              onClick={() => setFiltro("rejeitado")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtro === "rejeitado" 
                  ? "bg-red-600 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejeitados ({verificacoes.filter(v => v.documento_verificado === 'rejeitado').length})
            </button>
          </div>
        </div>

        {/* Lista de Verificações */}
        <div className="grid grid-cols-1 gap-4">
          {verificacoesFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhuma verificação encontrada
              </h3>
              <p className="text-gray-500">
                Não há documentos {filtro !== "todos" ? `com status "${filtro}"` : "para verificar"} no momento.
              </p>
            </div>
          ) : (
            verificacoesFiltradas.map((verificacao) => (
              <div key={verificacao.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Informações do Usuário */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {verificacao.profile_photo ? (
                          <img
                            src={verificacao.profile_photo}
                            alt={verificacao.username}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-500" />
                          </div>
                        )}
                        
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{verificacao.nome_completo}</h3>
                          <p className="text-gray-600">@{verificacao.username}</p>
                        </div>

                        {/* Status Badge */}
                        <span className={`ml-auto px-4 py-2 rounded-full text-sm font-semibold ${
                          verificacao.documento_verificado === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                          verificacao.documento_verificado === 'verificando' ? 'bg-blue-100 text-blue-700' :
                          verificacao.documento_verificado === 'rejeitado' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {verificacao.documento_verificado === 'pendente' ? 'Pendente' :
                           verificacao.documento_verificado === 'verificando' ? 'Verificando' :
                           verificacao.documento_verificado === 'rejeitado' ? 'Rejeitado' :
                           verificacao.documento_verificado}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <Mail className="h-4 w-4" /> Email
                          </p>
                          <p className="font-medium">{verificacao.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <Phone className="h-4 w-4" /> Telefone
                          </p>
                          <p className="font-medium">{verificacao.telefone || "Não informado"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <FileText className="h-4 w-4" /> Tipo de Documento
                          </p>
                          <p className="font-medium uppercase">{verificacao.tipo_documento}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Número do Documento</p>
                          <p className="font-medium">{verificacao.numero_documento}</p>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-gray-500">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Solicitado em: {new Date(verificacao.data_solicitacao).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedUser(verificacao);
                        setShowImageModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Eye className="h-5 w-5" />
                      Visualizar Documento
                    </button>
                    
                    {verificacao.documento_verificado !== 'aprovado' && verificacao.documento_verificado !== 'rejeitado' && (
                      <>
                        <button
                          onClick={() => handleAprovar(verificacao.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          <CheckCircle className="h-5 w-5" />
                          Aprovar
                        </button>
                        
                        <button
                          onClick={() => {
                            setUserToReject(verificacao);
                            setShowRejectModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                          <XCircle className="h-5 w-5" />
                          Rejeitar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Visualização de Documento */}
      {showImageModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Documento de {selectedUser.nome_completo}</h2>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {selectedUser.documento_foto ? (
                <img
                  src={selectedUser.documento_foto}
                  alt="Documento"
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="bg-gray-100 rounded-lg p-12 text-center">
                  <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-600">Nenhuma imagem de documento disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rejeição */}
      {showRejectModal && userToReject && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { 
            setShowRejectModal(false); 
            setUserToReject(null); 
            setMotivo(""); 
          }}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Rejeitar Documento</h2>
              <p className="text-gray-600 mb-4">
                Você está prestes a rejeitar o documento de <strong>{userToReject.nome_completo}</strong>.
              </p>
              
              <label className="block mb-2 font-medium">Motivo da rejeição:</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-4"
                rows="4"
                placeholder="Explique o motivo da rejeição..."
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => { 
                    setShowRejectModal(false); 
                    setUserToReject(null); 
                    setMotivo(""); 
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRejeitar(userToReject.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Confirmar Rejeição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default VerificarDocumentosAdmin;
