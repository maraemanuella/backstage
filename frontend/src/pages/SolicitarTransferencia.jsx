import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import Header from "../components/Header";
import api from "../api.js";
import "../styles/Form.css";

function SolicitarTransferencia() {
  const [user, setUser] = useState(null);
  const [inscricoes, setInscricoes] = useState([]);
  const [selectedInscricao, setSelectedInscricao] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [expandir, setExpandir] = useState(false);
    const handleEnviar = async () => {
    try {
        const res = await api.post("/api/transfer-requests/create/", {
        inscricao_id: selectedInscricao,
        to_user_id: selectedUsuario,
        mensagem: mensagem,
        });
        alert("Solicitação enviada com sucesso!");
        // Redirecionar ou limpar o formulário
        setSelectedInscricao("");
        setSelectedUsuario("");
        setMensagem("");
        setExpandir(false);
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
          "Erro ao enviar solicitação.";
        alert(msg);
      }
    };

  const location = useLocation();

  useEffect(() => {
    // tenta pré-selecionar inscrição enviada via navigate state
    const stateSelected = location?.state?.selectedInscricao;
    if (stateSelected) {
      setSelectedInscricao(stateSelected);
      setExpandir(true);
    } else {
      // fallback para query param ?inscricao=
      try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('inscricao');
        if (q) {
          const n = Number(q);
          setSelectedInscricao(Number.isNaN(n) ? q : n);
          setExpandir(true);
        }
      } catch (e) {
        // noop
      }
    }

    api.get("api/user/me/")
      .then(res => setUser(res.data))
      .catch(console.error);

    api.get("/api/inscricoes/minhas/")
      .then(res => setInscricoes(res.data))
      .catch(() => setInscricoes([]));

    api.get("/api/user/")
      .then(res => setUsuarios(res.data))
      .catch(() => setUsuarios([]));
  }, [location]);

  return (
    <main>
      <Header user={user} />
      <div
        className="form-container"
        style={{
          maxWidth: 900,
          margin: "40px auto",
          background: "#fff",
          padding: 40,
          borderRadius: 16,
          boxShadow: "0 2px 12px #eee",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start"
        }}
      >
        <h1
          style={{
            fontSize: "2.6rem",
            fontWeight: "bold",
            marginBottom: 32,
            color: "#000",
            textAlign: "left",
            width: "100%"
          }}
        >
          Enviar Transferência de Inscrição
        </h1>

        {/* Caixa expandível de inscrições */}
        <div className="form-group" style={{ width: "100%", marginBottom: 28 }}>
          <label style={{ fontWeight: 500, fontSize: "1.1rem", marginBottom: 8, display: "block" }}>
            Selecione uma inscrição:
          </label>
          <button
            type="button"
            className="form-expand-btn"
            onClick={() => setExpandir(!expandir)}
            style={{
              marginBottom: 12,
              background: "#f5f5f5",
              border: "none",
              padding: "12px 20px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "1rem"
            }}
          >
            {expandir ? "Ocultar inscrições" : "Mostrar inscrições"}
          </button>
          {expandir && (
            <div
              className="form-list"
              style={{
                maxHeight: 260,
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                width: "100%"
              }}
            >
              {inscricoes.length === 0 ? (
                <div style={{ color: "#888" }}>Você não possui inscrições.</div>
              ) : (
                inscricoes.map(inscricao => (
                  <div key={inscricao.id} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: "1rem", display: "flex", alignItems: "center" }}>
                      <input
                        type="radio"
                        name="inscricao"
                        value={inscricao.id}
                        checked={selectedInscricao === inscricao.id}
                        onChange={() => setSelectedInscricao(inscricao.id)}
                        style={{ marginRight: 12, transform: "scale(1.3)" }}
                      />
                      {inscricao.evento_titulo || inscricao.evento?.titulo || "Evento"} - {inscricao.status}
                    </label>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Select de usuário destinatário */}
        <div className="form-group" style={{ width: "100%", marginBottom: 28 }}>
          <label style={{ fontWeight: 500, fontSize: "1.1rem", marginBottom: 8, display: "block" }}>
            Selecione o usuário a receber a inscrição:
          </label>
          <select
            className="form-select"
            value={selectedUsuario}
            onChange={e => setSelectedUsuario(e.target.value)}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: "1rem"
            }}
          >
            <option value="">Selecione...</option>
            {usuarios
              .filter(u => u.id !== user?.id)
              .map(u => (
                <option key={u.id} value={u.id}>
                  {u.username} ({u.email})
                </option>
              ))}
          </select>
        </div>

        {/* Caixa de mensagem */}
        <div className="form-group" style={{ width: "100%", marginBottom: 28 }}>
          <label style={{ fontWeight: 500, fontSize: "1.1rem", marginBottom: 8, display: "block" }}>
            Mensagem (opcional):
          </label>
          <textarea
            className="form-textarea"
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ddd",
              fontSize: "1rem"
            }}
            placeholder="Escreva uma mensagem para o usuário..."
          />
        </div>

        {/* Botão de enviar */}
        <div style={{ width: "100%", textAlign: "left" }}>
          <button
            className="form-btn"
            style={{
              background: "#000",
              color: "#fff",
              padding: "14px 48px",
              borderRadius: 10,
              border: "none",
              fontWeight: 600,
              fontSize: "1.15rem",
              cursor: "pointer"
            }}
            disabled={!selectedInscricao || !selectedUsuario}
            onClick={handleEnviar}
          >
            Enviar
          </button>
        </div>
      </div>
    </main>
  );
}

export default SolicitarTransferencia;