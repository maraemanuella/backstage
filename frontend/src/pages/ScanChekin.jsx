import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FaArrowLeft, FaCheckCircle, FaTimesCircle, FaHistory, FaKeyboard } from 'react-icons/fa';
import { FiMonitor, FiSmartphone } from 'react-icons/fi';
import axios from 'axios';

// ===== Componentes base =====
const Button = ({ children, onClick, className = "", variant = "default" }) => {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 hover:cursor-pointer";
  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const Alert = ({ children, className = "", variant = "default" }) => {
  const variants = {
    default: "border-gray-200 bg-gray-50",
    success: "border-green-200 bg-green-50",
    error: "border-red-200 bg-red-50",
    warning: "border-yellow-200 bg-yellow-50",
  };
  return (
    <div className={`relative w-full rounded-lg border p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children, className = "" }) => (
  <div className={`text-sm ${className}`}>{children}</div>
);

const ScanCheckin = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileCheck = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
      setIsMobile(mobileCheck);
    };

    checkIfMobile();
  }, []);

  // Inicializar scanner
  useEffect(() => {
    if (isMobile && scanning && !html5QrcodeScannerRef.current) {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
      );

      html5QrcodeScannerRef.current.render(onScanSuccess, onScanError);
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(error => {
          console.error("Erro ao limpar scanner:", error);
        });
        html5QrcodeScannerRef.current = null;
      }
    };
  }, [scanning, isMobile]);

  const onScanSuccess = async (decodedText) => {
    console.log("QR Code detectado:", decodedText);

    // Parar o scanner
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
      html5QrcodeScannerRef.current = null;
    }

    setScanning(false);

    try {
      // Extrair ID da inscrição do QR code
      const inscricaoId = decodedText.split('/').pop();

      // Fazer requisição para realizar o checkin
      const token = localStorage.getItem("access");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/inscricoes/checkin/${inscricaoId}/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setScanResult({
        success: true,
        message: "Check-in realizado com sucesso!",
        participante: response.data.participante || "Participante",
        evento: response.data.evento || "Evento",
        data_checkin: response.data.data_checkin,
        email: response.data.email,
      });
    } catch (err) {
      console.error("Erro ao realizar checkin:", err);

      // Verificar se o erro é de check-in já realizado
      if (err.response?.status === 400 && err.response?.data?.error?.includes('já realizado')) {
        setScanResult({
          success: false,
          jaRealizado: true,
          message: err.response.data.error,
          participante: err.response.data.participante || "Participante",
          data_checkin: err.response.data.data_checkin,
        });
      } else {
        setScanResult({
          success: false,
          message: err.response?.data?.error || "Erro ao realizar check-in. Tente novamente.",
        });
      }
    }
  };

  const onScanError = (error) => {
    // Ignorar erros de scan comuns
    if (error.includes("NotFoundException")) {
      return;
    }
    console.warn("Erro no scanner:", error);
  };

  const handleStartScan = () => {
    setScanResult(null);
    setScanning(true);
  };

  const handleStopScan = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
      html5QrcodeScannerRef.current = null;
    }
    setScanning(false);
  };

  const handleNewScan = () => {
    setScanResult(null);
    setScanning(true);
  };

  const handleManualInput = async () => {
    setShowManualInput(false);
    setScanning(false);
    setScanResult(null);

    try {
      // Fazer requisição para realizar o checkin
      const token = localStorage.getItem("access");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/inscricoes/checkin/${manualInput}/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setScanResult({
        success: true,
        message: "Check-in realizado com sucesso!",
        participante: response.data.participante || "Participante",
        evento: response.data.evento || "Evento",
        data_checkin: response.data.data_checkin,
        email: response.data.email,
      });
    } catch (err) {
      console.error("Erro ao realizar checkin:", err);
      setScanResult({
        success: false,
        message: err.response?.data?.error || "Erro ao realizar check-in. Tente novamente.",
      });
    }
  };

  const fetchCheckinHistory = async () => {
    setLoadingHistory(true);
    setCheckinHistory([]);

    try {
      const token = localStorage.getItem("access");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/inscricoes/historico-checkin/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCheckinHistory(response.data);
    } catch (err) {
      console.error("Erro ao buscar histórico de check-ins:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleShowHistory = () => {
    setShowHistoryModal(true);
    fetchCheckinHistory();
  };

  const handleCloseHistory = () => {
    setShowHistoryModal(false);
  };

  // Se não for dispositivo móvel, mostrar aviso
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-6"
          >
            <FaArrowLeft /> Voltar
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-center justify-center">
                <FiMonitor size={32} className="text-gray-600" />
                <span>Scanner de Check-in</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FiSmartphone size={48} className="text-yellow-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Acesso Restrito a Dispositivos Móveis
              </h3>
              <p className="text-gray-600 mb-6">
                Esta funcionalidade está disponível apenas para dispositivos móveis (smartphones e tablets).
              </p>
              <Alert variant="warning">
                <AlertDescription className="text-yellow-800 text-center">
                  Por favor, acesse esta página através do seu celular para realizar o check-in dos participantes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-6"
        >
          <FaArrowLeft /> Voltar
        </Button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scanner de Check-in</h1>
          <p className="text-gray-600">Escaneie o QR Code do participante para realizar o check-in</p>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setShowManualInput(true)}
            className="flex items-center justify-center gap-2"
          >
            <FaKeyboard />
            Entrada Manual
          </Button>
          <Button
            variant="outline"
            onClick={handleShowHistory}
            className="flex items-center justify-center gap-2"
          >
            <FaHistory />
            Histórico
          </Button>
        </div>

        {/* Resultado do Scan */}
        {scanResult && !scanResult.jaRealizado && (
          <Alert variant={scanResult.success ? "success" : "error"} className="mb-6">
            <div className="flex items-start gap-3">
              {scanResult.success ? (
                <FaCheckCircle className="text-green-600 text-2xl mt-1" />
              ) : (
                <FaTimesCircle className="text-red-600 text-2xl mt-1" />
              )}
              <div className="flex-1">
                <h4 className={`font-semibold mb-1 ${scanResult.success ? "text-green-800" : "text-red-800"}`}>
                  {scanResult.success ? "Sucesso!" : "Erro"}
                </h4>
                <AlertDescription className={scanResult.success ? "text-green-700" : "text-red-700"}>
                  {scanResult.message}
                  {scanResult.participante && (
                    <div className="mt-2">
                      <strong>Participante:</strong> {scanResult.participante}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {/* Tela especial para Check-in já realizado */}
        {scanResult && scanResult.jaRealizado && (
          <Card className="mb-6 border-2 border-yellow-400">
            <CardHeader className="bg-yellow-50">
              <CardTitle className="flex items-center gap-3 text-yellow-800">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <FaCheckCircle className="text-white text-2xl" />
                </div>
                <span>Check-in Já Realizado</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Alert variant="warning" className="mb-4">
                <AlertDescription className="text-yellow-800 text-center font-medium">
                  Este participante já realizou o check-in anteriormente
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-3">Informações do Check-in</h4>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-gray-200 pb-2">
                      <span className="text-sm text-gray-600">Participante:</span>
                      <span className="text-sm font-semibold text-gray-900 text-right">
                        {scanResult.participante}
                      </span>
                    </div>

                    {scanResult.data_checkin && (
                      <div className="flex items-start justify-between border-b border-gray-200 pb-2">
                        <span className="text-sm text-gray-600">Data do Check-in:</span>
                        <span className="text-sm font-semibold text-gray-900 text-right">
                          {new Date(scanResult.data_checkin).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    {scanResult.data_checkin && (
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-gray-600">Horário:</span>
                        <span className="text-sm font-semibold text-gray-900 text-right">
                          {new Date(scanResult.data_checkin).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-600 text-lg" />
                    <span className="text-sm font-medium text-green-800">
                      Entrada já autorizada
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scanner */}
        <Card>
          <CardContent className="p-6">
            {!scanning && !scanResult && (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Pronto para Escanear
                </h3>
                <p className="text-gray-600 mb-6">
                  Clique no botão abaixo para ativar a câmera e escanear o QR Code do participante
                </p>
                <Button variant="default" onClick={handleStartScan} className="w-full">
                  Iniciar Scanner
                </Button>
              </div>
            )}

            {scanning && (
              <div>
                <div className="mb-4">
                  <div id="qr-reader" ref={scannerRef} className="w-full rounded-lg overflow-hidden"></div>
                </div>
                <Alert variant="default" className="mb-4">
                  <AlertDescription className="text-gray-700 text-center">
                    Posicione o QR Code dentro do quadrado para escanear
                  </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={handleStopScan} className="w-full">
                  Cancelar
                </Button>
              </div>
            )}

            {scanResult && (
              <div className="text-center">
                <Button variant="default" onClick={handleNewScan} className="w-full">
                  Escanear Novo QR Code
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Clique em "Iniciar Scanner" para ativar a câmera</li>
              <li>Aponte a câmera para o QR Code do participante</li>
              <li>Aguarde o reconhecimento automático</li>
              <li>O check-in será realizado automaticamente</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Entrada Manual */}
      {showManualInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Entrada Manual de Check-in
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Insira o código de check-in manualmente abaixo:
            </p>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="w-full p-3 mb-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              placeholder="Código de Check-in"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setShowManualInput(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleManualInput}
                variant="default"
                className="flex-1"
                disabled={!manualInput.trim()}
              >
                Confirmar Check-in
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Check-ins */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-white/30">
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Histórico de Check-ins
              </h3>
              <button
                onClick={handleCloseHistory}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 animate-spin text-gray-600 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <p className="text-gray-600">Carregando histórico...</p>
              </div>
            ) : (
              <div>
                {checkinHistory.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <FaHistory className="mx-auto text-4xl mb-3 text-gray-400" />
                    <p>Nenhum check-in encontrado no histórico.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {checkinHistory.map((item, index) => (
                      <div
                        key={item.id || index}
                        className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-1">
                              {item.participante}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.email}
                            </p>
                          </div>
                          <FaCheckCircle className="text-green-500 text-lg ml-2" />
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {item.evento}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.data_checkin).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanCheckin;
