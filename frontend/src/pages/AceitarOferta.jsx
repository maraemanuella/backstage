import { useState, useEffect } from "react";
import Header from "../components/Header";
import Modal from "../components/Modal";
import api from "../api.js";
import "../styles/Form.css";

function AceitarOferta() {
  const [user, setUser] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    api.get("/api/user/me/")
      .then(res => setUser(res.data))
      .catch(console.error);

    api.get("/api/transfer-requests/")
      .then(res => setOfertas(res.data))
      .catch(() => setOfertas([]));
  }, []);

  const handleResposta = async (id, status) => {
    setLoading(true);
    try {
      await api.patch(`/api/transfer-requests/${id}/`, { status });
      setOfertas(ofertas =>
        ofertas.map(oferta =>
          oferta.id === id ? { ...oferta, status } : oferta
        )
      );
    } catch (err) {
      alert("Erro ao responder oferta.");
    }
    setLoading(false);
  };

  // Filtra só as ofertas recebidas pelo usuário
  const ofertasRecebidas = ofertas.filter(o => o.to_user_id_read === user?.id);

  return (
    <main>
      <Header user={user} setOpenModal={setOpenModal} />
      <Modal isOpen={openModal} setOpenModal={setOpenModal} user={user} />
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
          Ofertas de Transferência Recebidas
        </h1>

        {ofertasRecebidas.length === 0 ? (
          <div style={{ color: "#888", fontSize: "1.2rem" }}>
            Nenhuma oferta recebida.
          </div>
        ) : (
          ofertasRecebidas.map(oferta => (
            <div
              key={oferta.id}
              style={{
                width: "100%",
                marginBottom: 32,
                padding: 28,
                border: "1px solid #eee",
                borderRadius: 12,
                background: "#fafafa",
                fontSize: "1.15rem"
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "1.25rem", marginBottom: 12 }}>
                Inscrição: {oferta.inscricao_evento_titulo || oferta.inscricao?.evento_titulo || "Evento"}
              </div>
              <div style={{ marginBottom: 12 }}>
                De: <b>{oferta.from_user}</b>
              </div>
              <div style={{ marginBottom: 12 }}>
                Mensagem: {oferta.mensagem ? oferta.mensagem : <span style={{ color: "#888" }}>Nenhuma mensagem enviada.</span>}
              </div>
              <div style={{ marginBottom: 12 }}>
                Status: <b>{oferta.status === "sent" ? "Pendente" : oferta.status === "accepted" ? "Aceita" : "Recusada"}</b>
              </div>
              {oferta.status === "sent" && (
                <div style={{ display: "flex", gap: 24 }}>
                  <button
                    className="form-btn"
                    style={{
                      background: "#1976d2",
                      color: "#fff",
                      padding: "14px 48px",
                      borderRadius: 10,
                      border: "none",
                      fontWeight: 600,
                      fontSize: "1.15rem",
                      cursor: "pointer"
                    }}
                    disabled={loading}
                    onClick={() => handleResposta(oferta.id, "accepted")}
                  >
                    Aceitar
                  </button>
                  <button
                    className="form-btn"
                    style={{
                      background: "#d32f2f",
                      color: "#fff",
                      padding: "14px 48px",
                      borderRadius: 10,
                      border: "none",
                      fontWeight: 600,
                      fontSize: "1.15rem",
                      cursor: "pointer"
                    }}
                    disabled={loading}
                    onClick={() => handleResposta(oferta.id, "denied")}
                  >
                    Recusar
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}

export default AceitarOferta;