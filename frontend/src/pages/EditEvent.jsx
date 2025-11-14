import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api"; // Usando sua instância do Axios
import Header from "../components/Header.jsx";
import { ArrowLeft } from "lucide-react";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evento, setEvento] = useState({
    titulo: "",
    descricao: "",
    categorias: [],
    categorias_customizadas: [],
    itens_incluidos: "",
    data_evento: "",
    endereco: "",
    local_especifico: "",
    capacidade_maxima: 1,
    valor_deposito: 0,
    permite_transferencia: true,
    politica_cancelamento: "",
    status: "rascunho",
    foto_capa: null,
  });

  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [qrCodePixFile, setQrCodePixFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventoResponse, userResponse] = await Promise.all([
          api.get(`/api/manage/eventos/${id}/`),
          api.get("/api/user/me/"),
        ]);

        const data = eventoResponse.data;

        if (data.data_evento) {
          data.data_evento = data.data_evento.slice(0, 16);
        }

        setEvento((prev) => ({ ...prev, ...data }));
        setUser(userResponse.data);
        setError(null);
      } catch (err) {
        setError(
          "Não foi possível carregar os dados. Verifique o console para mais detalhes."
        );
        console.error("Erro Axios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvento((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setCoverPhotoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();

    // CORREÇÃO: Adicionando apenas os campos editáveis ao formData.
    // Isso evita o envio de campos somente leitura que causam o erro 400.
    formData.append("titulo", evento.titulo);
    formData.append("descricao", evento.descricao);
    formData.append("categorias", JSON.stringify(evento.categorias));
    if (evento.categorias.includes('Outro') && evento.categorias_customizadas.length > 0) {
      formData.append("categorias_customizadas", JSON.stringify(evento.categorias_customizadas));
    }
    formData.append("itens_incluidos", evento.itens_incluidos);
    formData.append("endereco", evento.endereco);
    formData.append("local_especifico", evento.local_especifico);
    formData.append("capacidade_maxima", evento.capacidade_maxima);
    formData.append("valor_deposito", evento.valor_deposito);
    formData.append("permite_transferencia", evento.permite_transferencia);
    formData.append("politica_cancelamento", evento.politica_cancelamento);
    formData.append("status", evento.status);

    // Formata a data corretamente para o backend
    let dataEvento = evento.data_evento;
    if (dataEvento && dataEvento.length === 16) {
      dataEvento = `${dataEvento}:00Z`;
    }
    formData.append("data_evento", dataEvento);

    // Adiciona o novo arquivo de imagem, se o usuário selecionou um
    if (coverPhotoFile) {
      formData.append("foto_capa", coverPhotoFile);
    }

    // Adiciona o QR Code PIX, se o usuário selecionou um
    if (qrCodePixFile) {
      formData.append("qr_code_pix", qrCodePixFile);
    }

    try {
      await api.patch(`/api/manage/eventos/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Evento atualizado com sucesso!");
      navigate("/gerenciar");
    } catch (err) {
      let errorMessage = "Falha ao salvar as alterações.";
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (typeof errorData === "object") {
          const errorDetails = Object.keys(errorData)
            .map(
              (key) =>
                `${key}: ${
                  Array.isArray(errorData[key])
                    ? errorData[key].join(", ")
                    : errorData[key]
                }`
            )
            .join("\n");
          errorMessage = `Por favor, corrija os seguintes erros:\n\n${errorDetails}`;
        } else {
          errorMessage = errorData;
        }
      }
      setError(errorMessage);
      console.error("Erro ao salvar:", err.response ? err.response.data : err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !evento.titulo) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando editor...</p>
        </div>
      </main>
    );
  }
  return (
    <div className="bg-gray-50 min-h-screen">
      <Header user={user} />
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="border-2 border-gray-300 font-poppins h-[40px] flex items-center justify-center p-2 rounded-full hover:text-white hover:bg-black hover:scale-108 transition-all cursor-pointer gap-2"
            aria-label="Voltar para a página anterior"
          >
            <ArrowLeft size={20} /> Voltar
          </button>
          <h1 className="text-3xl font-bold text-center font-poppins flex-grow">
            Editando Evento
          </h1>
          <div className="w-24"></div>{" "}
          {/* Espaçador para centralizar o título */}
        </div>

        {/* Bloco de erro recomendado */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 whitespace-pre-line"
            role="alert"
          >
            <strong className="font-bold">Erro!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md space-y-6"
        >
          {/* Título */}
          <div>
            <label
              htmlFor="titulo"
              className=" flex text-sm font-medium text-white  bg-black inset-0 p-1  rounded-t-2xl justify-center items-center"
            >
              Título do Evento
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={evento.titulo}
              onChange={handleChange}
              className="mt-1 block w-full input-style  bg-gray-100 p-1"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label
              htmlFor="descricao"
              className="flex text-sm font-medium text-black  bg-gray-300 inset-0 p-1  rounded-t-2xl justify-center items-center"
            >
              Descrição
            </label>
            <textarea
              id="descricao"
              name="descricao"
              rows="4"
              value={evento.descricao}
              onChange={handleChange}
              className=" block w-full input-style  bg-gray-100 p-1 h-[40px]"
            />
          </div>

          {/* Foto de Capa */}
          <div>
            <label
              htmlFor="foto_capa"
              className="block text-sm font-medium text-gray-700"
            >
              Foto de Capa
            </label>
            <input
              type="file"
              id="foto_capa"
              name="foto_capa"
              onChange={handleFileChange}
              className="mt-1 cursor-pointer   block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {evento.foto_capa && !coverPhotoFile && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Imagem atual:</p>
                <img
                  src={evento.foto_capa}
                  alt="Capa atual"
                  className="h-24 flex w-full p-1 input-style border-2 border-gray-300 items-center justify-center"
                />
              </div>
            )}
          </div>

          {/* QR Code PIX */}
          <div>
            <label
              htmlFor="qr_code_pix"
              className="block text-sm font-medium text-gray-700"
            >
              QR Code PIX para Pagamento
            </label>
            <input
              type="file"
              id="qr_code_pix"
              name="qr_code_pix"
              accept="image/*"
              onChange={(e) => setQrCodePixFile(e.target.files[0])}
              className="mt-1 cursor-pointer block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {evento.qr_code_pix && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">QR Code atual:</p>
                <img
                  src={evento.qr_code_pix}
                  alt="QR Code PIX"
                  className="h-32 w-32 object-contain border-2 border-gray-300 p-2"
                />
              </div>
            )}
            <small className="text-gray-500 mt-1 block">
              Faça upload do QR Code PIX para que os participantes possam realizar o pagamento das inscrições
            </small>
          </div>

          {/* Categorias e Status */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="flex text-sm font-medium text-black bg-gray-300 inset-0 p-1 rounded-t-2xl justify-center items-center">
                Categorias (selecione uma ou mais)
              </label>
              <div className="border-2 border-gray-300 rounded-b-2xl p-4 space-y-2">
                {['Workshop', 'Palestra', 'Networking', 'Curso', 'Outro'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      value={cat}
                      checked={evento.categorias?.includes(cat) || false}
                      onChange={(e) => {
                        const { value, checked } = e.target;
                        setEvento(prev => {
                          const novasCategorias = checked
                            ? [...(prev.categorias || []), value]
                            : (prev.categorias || []).filter(c => c !== value);
                          return { ...prev, categorias: novasCategorias };
                        });
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="status"
                className="flex text-sm font-medium text-black  bg-gray-300 inset-0 p-1  rounded-t-2xl justify-center items-center"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={evento.status}
                onChange={handleChange}
                className="block w-full input-style p-1 border-2 border-gray-300 rounded-b-2xl"
              >
                <option value="rascunho">Rascunho</option>
                <option value="publicado">Publicado</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Data, Valor e Capacidade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <div>
              <label
                htmlFor="data_evento"
                className="flex text-sm font-medium text-black  bg-gray-300 inset-0 p-1  rounded-tl-2xl justify-center items-center"
              >
                Data e Hora
              </label>
              <input
                type="datetime-local"
                id="data_evento"
                name="data_evento"
                value={evento.data_evento}
                onChange={handleChange}
                className="flex w-full input-style p-1 border-2 border-gray-300 rounded-bl-2xl items-center justify-center"
                required
              />
            </div>
            <div>
              <label
                htmlFor="valor_deposito"
                className="flex text-sm font-medium text-black  bg-gray-300 inset-0 p-1 justify-center items-center"
              >
                Valor (R$)
              </label>
              <input
                type="number"
                id="valor_deposito"
                name="valor_deposito"
                step="0.01"
                value={evento.valor_deposito}
                onChange={handleChange}
                className="flex w-full input-style p-1 border-2 border-gray-300 items-center justify-cente"
                required
              />
            </div>
            <div>
              <label
                htmlFor="capacidade_maxima"
                className="flex text-sm font-medium text-black  bg-gray-300 inset-0 rounded-tr-2xl p-1 justify-center items-center"
              >
                Capacidade Máx.
              </label>
              <input
                type="number"
                id="capacidade_maxima"
                name="capacidade_maxima"
                value={evento.capacidade_maxima}
                onChange={handleChange}
                className="flex w-full input-style p-1 border-2 border-gray-300 rounded-br-2xl items-center justify-center"
                required
              />
            </div>
          </div>

          {/* Endereço e Local Específico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            <div>
              <label
                htmlFor="endereco"
                className="flex text-sm font-medium text-black  bg-gray-300 inset-0 rounded-tl-2xl p-1 justify-center items-center"
              >
                Endereço
              </label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={evento.endereco}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="local_especifico"
                className="flex text-sm font-medium text-black  bg-gray-300 inset-0 rounded-tr-2xl p-1 justify-center items-center"
              >
                Local Específico (ex: Auditório B)
              </label>
              <input
                type="text"
                id="local_especifico"
                name="local_especifico"
                value={evento.local_especifico}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Políticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="politica_cancelamento"
                className="block text-sm font-medium text-gray-700"
              >
                Política de Cancelamento
              </label>
              <textarea
                id="politica_cancelamento"
                name="politica_cancelamento"
                rows="3"
                value={evento.politica_cancelamento}
                onChange={handleChange}
                className="flex w-full p-1 input-style border-2 border-gray-300 items-center justify-center"
              />
            </div>
            <div>
              <label
                htmlFor="itens_incluidos"
                className="block text-sm font-medium text-gray-700"
              >
                Itens Incluídos (um por linha)
              </label>
              <textarea
                id="itens_incluidos"
                name="itens_incluidos"
                rows="3"
                value={evento.itens_incluidos}
                onChange={handleChange}
                className="flex w-full p-1 input-style border-2 border-gray-300 items-center justify-center"
              />
            </div>
          </div>

          {/* Opções Booleanas */}
          <div className="flex items-center">
            <input
              id="permite_transferencia"
              name="permite_transferencia"
              type="checkbox"
              checked={evento.permite_transferencia}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label
              htmlFor="permite_transferencia"
              className="ml-2 block text-sm text-gray-900"
            >
              Permitir transferência de inscrição
            </label>
          </div>

          {/* Botão de Salvar */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white font-poppins p-1 rounded-2xl w-[140px] cursor-pointer hover:scale-108 hover:bg-green-400 hover:text-black transition-all duration-300"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;
