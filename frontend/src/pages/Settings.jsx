import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api.js";
import {
  FaArrowLeft,
  FaBell,
  FaLock,
  FaGlobe,
  FaEnvelope,
  FaMoon,
  FaSun,
  FaShieldAlt,
} from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados das configurações
  const [settings, setSettings] = useState({
    notificacoes_email: true,
    notificacoes_push: true,
    notificacoes_eventos: true,
    notificacoes_inscricoes: true,
    privacidade_perfil: "publico",
    idioma: "pt-BR",
    tema: "light",
    newsletter: true,
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.get('api/user/me/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      
      // Carregar configurações salvas (se houver)
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Salvar no localStorage (ou pode enviar para uma API)
      localStorage.setItem('userSettings', JSON.stringify(settings));
      toast.success('Configurações salvas com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <ToastContainer />
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/perfil')}
            className="flex items-center text-sky-700 hover:text-sky-800 transition-colors mb-4"
          >
            <FaArrowLeft className="mr-2" />
            Voltar para Perfil
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-2">Gerencie suas preferências e privacidade</p>
        </div>

        {/* Seção: Notificações */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaBell className="text-sky-700 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
          </div>

          <div className="space-y-4">
            <SettingToggle
              label="Notificações por Email"
              description="Receba atualizações por email"
              checked={settings.notificacoes_email}
              onChange={() => handleToggle('notificacoes_email')}
            />
            
            <SettingToggle
              label="Notificações Push"
              description="Receba notificações no navegador"
              checked={settings.notificacoes_push}
              onChange={() => handleToggle('notificacoes_push')}
            />
            
            <SettingToggle
              label="Notificações de Eventos"
              description="Receba alertas sobre novos eventos e atualizações"
              checked={settings.notificacoes_eventos}
              onChange={() => handleToggle('notificacoes_eventos')}
            />
            
            <SettingToggle
              label="Notificações de Inscrições"
              description="Receba confirmações e lembretes de inscrições"
              checked={settings.notificacoes_inscricoes}
              onChange={() => handleToggle('notificacoes_inscricoes')}
            />
          </div>
        </div>

        {/* Seção: Privacidade */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaShieldAlt className="text-green-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">Privacidade</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibilidade do Perfil
              </label>
              <select
                value={settings.privacidade_perfil}
                onChange={(e) => handleSelect('privacidade_perfil', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="publico">Público - Todos podem ver</option>
                <option value="privado">Privado - Apenas você</option>
                <option value="amigos">Apenas organizadores de eventos inscritos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Seção: Preferências */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaGlobe className="text-purple-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">Preferências</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaGlobe className="inline mr-2" />
                Idioma
              </label>
              <select
                value={settings.idioma}
                onChange={(e) => handleSelect('idioma', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {settings.tema === 'light' ? <FaSun className="inline mr-2" /> : <FaMoon className="inline mr-2" />}
                Tema
              </label>
              <select
                value={settings.tema}
                onChange={(e) => handleSelect('tema', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático (Sistema)</option>
              </select>
            </div>

            <SettingToggle
              label="Newsletter"
              description="Receba novidades e dicas sobre eventos"
              checked={settings.newsletter}
              onChange={() => handleToggle('newsletter')}
              icon={<FaEnvelope />}
            />
          </div>
        </div>

        {/* Seção: Segurança */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FaLock className="text-red-600 text-xl" />
            <h2 className="text-xl font-bold text-gray-900">Segurança</h2>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/alterar-senha')}
              className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Alterar Senha</div>
              <div className="text-sm text-gray-600">Atualize sua senha de acesso</div>
            </button>

            <button
              onClick={() => {
                toast.info('Funcionalidade de autenticação em duas etapas em breve!');
              }}
              className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Autenticação em Duas Etapas</div>
              <div className="text-sm text-gray-600">Adicione uma camada extra de segurança</div>
            </button>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/perfil')}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 bg-sky-700 text-white rounded-lg hover:bg-sky-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para toggles
function SettingToggle({ label, description, checked, onChange, icon }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-600">{icon}</span>}
          <div className="font-medium text-gray-900">{label}</div>
        </div>
        {description && (
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-sky-700' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default Settings;
