import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Modal from "../components/Modal";
import api from "../api";

function AdminVerificacoes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificacoes, setVerificacoes] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const userRes = await api.get("/api/user/me/");
        const userData = userRes.data;
        setUser(userData);
        
        if (!userData.is_staff) {
          alert("Acesso negado. Apenas administradores podem acessar esta página.");
          navigate('/');
          return;
        }

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
    if (!window.confirm("Tem certeza que deseja APROVAR este documento?")) {
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/api/admin/verificacoes/${userId}/aprovar/`);
      alert("Documento aprovado com sucesso!");
      
      // Remove from list
      setVerificacoes(verificacoes.filter(v => v.id !== userId));
      setSelectedDoc(null);
      setShowImageModal(false);
    } catch (error) {
      console.error("Erro ao aprovar documento:", error);
      alert("Erro ao aprovar documento. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRejeitar = async (userId) => {
    const motivo = prompt("Digite o motivo da rejeição (opcional):");
    
    if (motivo === null) { // User cancelled
      return;
    }

    setProcessing(true);
    try {
      await api.post(`/api/admin/verificacoes/${userId}/rejeitar/`, {
        motivo: motivo || "Documento não atende aos requisitos."
      });
      alert("Documento rejeitado.");
      
      // Remove from list
      setVerificacoes(verificacoes.filter(v => v.id !== userId));
      setSelectedDoc(null);
      setShowImageModal(false);
    } catch (error) {
      console.error("Erro ao rejeitar documento:", error);
      alert("Erro ao rejeitar documento. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const formatDocumento = (tipo, numero) => {
    if (!numero) return 'N/A';
    
    if (tipo === 'cpf') {
      // Format: XXX.XXX.XXX-XX
      return numero.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (tipo === 'cnpj') {
      // Format: XX.XXX.XXX/XXXX-XX
      return numero.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return numero;
  };

  const openImageModal = (verificacao) => {
    setSelectedDoc(verificacao);
    setShowImageModal(true);
  };

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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Verificação de Documentos</h1>
              <p className="text-lg text-gray-600">Aprove ou rejeite documentos de usuários aguardando verificação</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Voltar ao Dashboard
            </button>
          </div>
        </div>

        {verificacoes.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">Nenhuma verificação pendente</h3>
            <p className="text-gray-500">Todos os documentos foram processados!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {verificacoes.map((verificacao) => (
              <div key={verificacao.id} className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{verificacao.username}</h3>
                      <p className="text-sm text-gray-500">{verificacao.email}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                      Pendente
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <span className="text-sm font-medium text-gray-900 uppercase">
                        {verificacao.tipo_documento || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Número:</span>
                      <span className="text-sm font-mono text-gray-900">
                        {formatDocumento(verificacao.tipo_documento, verificacao.numero_documento)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Submissão:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(verificacao.data_submissao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {verificacao.documento_foto && (
                    <div className="mb-4">
                      <button
                        onClick={() => openImageModal(verificacao)}
                        className="w-full py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                      >
                        🔍 Ver Documento
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAprovar(verificacao.id)}
                      disabled={processing}
                      className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                    >
                      ✓ Aprovar
                    </button>
                    <button
                      onClick={() => handleRejeitar(verificacao.id)}
                      disabled={processing}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium text-sm"
                    >
                      ✗ Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedDoc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedDoc.username}</h3>
                <p className="text-sm text-gray-500">
                  {selectedDoc.tipo_documento?.toUpperCase()}: {formatDocumento(selectedDoc.tipo_documento, selectedDoc.numero_documento)}
                </p>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <img
                src={`http://127.0.0.1:8000${selectedDoc.documento_foto}`}
                alt="Documento"
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Erro+ao+carregar+imagem';
                }}
              />
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={() => handleAprovar(selectedDoc.id)}
                disabled={processing}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                ✓ Aprovar Documento
              </button>
              <button
                onClick={() => handleRejeitar(selectedDoc.id)}
                disabled={processing}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors font-medium"
              >
                ✗ Rejeitar Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminVerificacoes;
