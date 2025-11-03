import { useState, useEffect } from "react";
import Header from "../components/Header";
import Modal from "../components/Modal";
import api from "../api.js";

function VerificarDocumento() {
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState("cpf");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [documentoFoto, setDocumentoFoto] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [statusAtual, setStatusAtual] = useState("pendente");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [userRes, statusRes] = await Promise.allSettled([
          api.get("/api/user/me/"),
          api.get("/api/status-documento/")
        ]);

        if (userRes.status === 'fulfilled') {
          setUser(userRes.value.data);
        }

        if (statusRes.status === 'fulfilled') {
          setStatusAtual(statusRes.value.data.documento_verificado);
          setTipoDocumento(statusRes.value.data.tipo_documento || "cpf");
          setNumeroDocumento(statusRes.value.data.numero_documento || "");
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVerificar = async (e) => {
    e.preventDefault();
    
    if (!documentoFoto) {
      alert("Por favor, faça upload do documento.");
      return;
    }

    setVerificando(true);
    setResultado(null);

    const formData = new FormData();
    formData.append("tipo_documento", tipoDocumento);
    formData.append("numero_documento", numeroDocumento);
    formData.append("documento_foto", documentoFoto);

    try {
      const res = await api.post("/api/verificar-documento/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResultado(res.data);
      setStatusAtual(res.data.status);
    } catch (err) {
      const data = err.response?.data;
      let msg =
        Array.isArray(data) ? data[0] :
        data?.detail ||
        data?.error ||
        (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
        (data && typeof data === "object"
          ? Object.values(data).find(v => Array.isArray(v) && v.length > 0)?.[0]
          : null) ||
        "Erro ao verificar documento.";
      alert(msg);
    } finally {
      setVerificando(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header user={user} setOpenModal={setOpenModal}/>
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} /> 
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Título - MUDOU PARA PRETO */}
        <div className="bg-white rounded-2xl shadow-7xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verificação de Documento
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Para criar eventos, é necessário verificar sua identidade através de um documento oficial (CPF ou CNPJ).
            Após o envio, um administrador irá analisar e aprovar seu documento.
          </p>
        </div>

        {/* Status atual */}
        {statusAtual === "aprovado" && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3">✓</span>
              <div>
                <strong className="text-green-700 text-xl block mb-1">
                  Documento verificado com sucesso!
                </strong>
                <p className="text-gray-600">Você já pode criar eventos.</p>
              </div>
            </div>
          </div>
        )}

        {statusAtual === "pendente" && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3">📋</span>
              <div>
                <strong className="text-blue-700 text-xl block mb-1">
                  Aguardando análise
                </strong>
                <p className="text-gray-600">Seu documento foi enviado e está aguardando aprovação de um administrador.</p>
              </div>
            </div>
          </div>
        )}

        {statusAtual === "verificando" && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3 animate-pulse">⏳</span>
              <div>
                <strong className="text-yellow-700 text-xl block mb-1">
                  Verificação em andamento...
                </strong>
                <p className="text-gray-600">Aguarde enquanto validamos seu documento.</p>
              </div>
            </div>
          </div>
        )}

        {statusAtual === "rejeitado" && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-6">
            <div className="flex items-center">
              <span className="text-3xl mr-3">✗</span>
              <div>
                <strong className="text-red-700 text-xl block mb-1">
                  Documento rejeitado
                </strong>
                <p className="text-gray-600">Por favor, verifique os dados e tente novamente.</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        {statusAtual !== "aprovado" && (
          <div className="bg-white rounded-2xl shadow-7xl p-8">
            <form onSubmit={handleVerificar} className="space-y-6">
              {/* Tipo de documento */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Tipo de Documento:
                </label>
                <select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value)}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  disabled={verificando}
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </select>
              </div>

              {/* Número do documento */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Número do {tipoDocumento.toUpperCase()}:
                </label>
                <input
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  placeholder={tipoDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  required
                  disabled={verificando}
                />
              </div>

              {/* Upload do documento */}
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                  Foto/Scan do Documento:
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setDocumentoFoto(e.target.files[0])}
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                  required
                  disabled={verificando}
                />
              </div>

              {/* Botão de verificar - MUDOU PARA PRETO */}
              <button
                type="submit"
                className={`w-full py-4 text-lg font-bold rounded-lg transition-all ${
                  verificando
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800 active:scale-95"
                }`}
                disabled={verificando}
              >
                {verificando ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Verificando...
                  </span>
                ) : (
                  "Verificar Documento"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Resultado da verificação */}
        {resultado && (
          <div
            className={`mt-6 rounded-2xl shadow-7xl p-8 ${
              resultado.status === "aprovado" ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <h3
              className={`text-2xl font-bold mb-3 ${
                resultado.status === "aprovado" ? "text-green-700" : "text-red-700"
              }`}
            >
              {resultado.status === "aprovado" ? "✓ Verificação Concluída" : "✗ Verificação Falhou"}
            </h3>
            <p className="text-lg text-gray-700">{resultado.mensagem}</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default VerificarDocumento;