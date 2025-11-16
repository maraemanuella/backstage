import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';
import TitleUpdater from '../components/TitleUpdater';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaBuilding, FaCalendar, FaVenusMars, FaCamera, FaArrowLeft, FaSave, FaTimes, FaHome } from 'react-icons/fa';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telefone: '',
    cpf: '',
    cnpj: '',
    data_nascimento: '',
    sexo: '',
    profile_photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [originalData, setOriginalData] = useState({});
  const [formErrors, setFormErrors] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/api/user/me/');
      const userData = response.data;
      
      // Formatar data para o input date
      const formattedDate = userData.data_nascimento 
        ? new Date(userData.data_nascimento).toISOString().split('T')[0] 
        : '';
      
      const profileData = {
        username: userData.username || '',
        email: userData.email || '',
        telefone: userData.telefone || '',
        cpf: userData.cpf || '',
        cnpj: userData.cnpj || '',
        data_nascimento: formattedDate,
        sexo: userData.sexo || '',
        profile_photo: null
      };
      
      setFormData(profileData);
      setOriginalData(profileData);
      setPhotoPreview(userData.profile_photo || null);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast.error('Erro ao carregar dados do perfil');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value: rawValue } = e.target;
    let value = rawValue;

    // Formata CPF e Telefone enquanto digita
    if (name === 'cpf') {
      // remover não dígitos
      const digits = rawValue.replace(/\D/g, '').slice(0, 11);
      // aplicar máscara XXX.XXX.XXX-XX
      value = digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    }

    if (name === 'telefone') {
      const digits = rawValue.replace(/\D/g, '').slice(0, 11);
      // Formatar (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      if (digits.length <= 2) value = digits;
      else if (digits.length <= 6) value = `(${digits.slice(0,2)}) ${digits.slice(2)}`;
      else if (digits.length <= 10) value = `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
      else value = `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profile_photo: file
      }));
      
      // Preview da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.username.trim()) {
      errors.push('Nome de usuário é obrigatório');
    }
    
    if (!formData.email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.push('Email inválido');
    }
    
    if (formData.cpf && !/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      errors.push('CPF deve ter 11 dígitos');
    }
    
    if (formData.cnpj && !/^\d{14}$/.test(formData.cnpj.replace(/\D/g, ''))) {
      errors.push('CNPJ deve ter 14 dígitos');
    }
    
    if (formData.telefone && !/^\d{10,11}$/.test(formData.telefone.replace(/\D/g, ''))) {
      errors.push('Telefone deve ter 10 ou 11 dígitos');
    }
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      setFormErrors(errors);
      return false;
    }
    setFormErrors([]);
    
    return true;
  };

  const hasChanges = () => {
    const changed = Object.keys(formData).some(key => {
      if (key === 'profile_photo') return formData[key] !== null;
      const a = formData[key];
      const b = originalData[key];
      if (key === 'cpf' || key === 'cnpj' || key === 'telefone') {
        const normA = (a || '').toString().replace(/\D/g, '')
        const normB = (b || '').toString().replace(/\D/g, '')
        return normA !== normB;
      }
      return a !== b;
    });
    return changed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!hasChanges()) {
      toast.info('Nenhuma alteração foi feita');
      return;
    }
    
    setSaving(true);
    
    try {
      const submitData = new FormData();
      
      // Adicionar apenas campos que mudaram (comparação normalizada para CPF/CNPJ/telefone)
      Object.keys(formData).forEach(key => {
        const newVal = formData[key];
        const oldVal = originalData[key];
        const changed = (key === 'profile_photo') ? !!newVal : (
          (key === 'cpf' || key === 'cnpj' || key === 'telefone') ?
            ( (newVal||'').toString().replace(/\D/g, '') !== (oldVal||'').toString().replace(/\D/g, '') ) :
            newVal !== oldVal
        );

        if (!changed) return;

        if (key === 'profile_photo') {
          submitData.append('profile_photo', newVal);
        } else if (key === 'cpf' || key === 'cnpj' || key === 'telefone') {
          submitData.append(key, (newVal||'').toString().replace(/\D/g, ''));
        } else {
          submitData.append(key, newVal);
        }
      });
      
      const response = await api.patch('/api/user/profile/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast.success('Perfil atualizado com sucesso!');
      navigate('/perfil');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      if (error.response?.data) {
        Object.values(error.response.data).forEach(errorMsg => {
          if (Array.isArray(errorMsg)) {
            errorMsg.forEach(msg => toast.error(msg));
          } else {
            toast.error(errorMsg);
          }
        });
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } finally {
      setSaving(false);
    }
  };

  // cancel handler removed per UI spec (no cancel button)
  const handleCancel = () => {};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-7xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Carregando dados do perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title="Editar Perfil - Backstage" />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            {/* Botões de navegação */}
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => navigate('/perfil')}
                className="flex items-center text-sky-700 hover:text-sky-800 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Voltar para o Perfil
              </button>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => navigate('/')}
                className="flex items-center text-sky-700 hover:text-sky-800 transition-colors"
              >
                <FaHome className="mr-2" />
                Ir para Home
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
            <p className="text-gray-600 mt-2">Atualize suas informações pessoais</p>
          </div>

          {/* Mostrar erros do formulário em bloco visível */}
          {formErrors && formErrors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 whitespace-pre-line">
              <strong className="font-bold">Erros:</strong>
              <ul className="mt-2 list-disc list-inside">
                {formErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Foto de Perfil */}
            <div className="bg-white p-6 rounded-2xl shadow-7xl">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Foto de Perfil</h2>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={photoPreview || 'https://via.placeholder.com/120x120?text=Foto'}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <label 
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-sky-700 text-white p-2 rounded-full cursor-pointer hover:bg-sky-800 transition-colors"
                  >
                    <FaCamera className="w-4 h-4" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Alterar foto de perfil</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Formatos aceitos: JPG, PNG, GIF<br />
                    Tamanho máximo: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Informações Pessoais */}
            <div className="bg-white p-6 rounded-2xl shadow-7xl">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Informações Pessoais</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome de usuário */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    Nome de usuário *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2" />
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                {/* Data de Nascimento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendar className="inline mr-2" />
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    name="data_nascimento"
                    value={formData.data_nascimento}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                {/* CPF */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaIdCard className="inline mr-2" />
                    CPF
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                {/* CNPJ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaBuilding className="inline mr-2" />
                    CNPJ
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleInputChange}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                {/* Sexo */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaVenusMars className="inline mr-2" />
                    Sexo
                  </label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || !hasChanges()}
                className="px-6 py-3 bg-sky-700 text-white rounded-lg hover:bg-sky-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProfile;