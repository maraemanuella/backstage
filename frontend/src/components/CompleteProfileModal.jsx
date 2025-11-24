import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Users as UsersIcon, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api';

const CompleteProfileModal = ({ user, isOpen, onComplete }) => {
  const [formData, setFormData] = useState({
    telefone: '',
    data_nascimento: '',
    sexo: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        telefone: user.telefone || '',
        data_nascimento: user.data_nascimento || '',
        sexo: user.sexo || ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.telefone || formData.telefone.trim() === '') {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone inválido';
    }

    if (!formData.data_nascimento) {
      newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    } else {
      const birthDate = new Date(formData.data_nascimento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.data_nascimento = 'Você deve ter pelo menos 18 anos';
      }
    }

    if (!formData.sexo) {
      newErrors.sexo = 'Gênero é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      // Formatar telefone (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      if (value.length <= 2) {
        // Mantém como está
      } else if (value.length <= 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length <= 10) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
      } else {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
      }
    }

    setFormData(prev => ({
      ...prev,
      telefone: value
    }));

    if (errors.telefone) {
      setErrors(prev => ({
        ...prev,
        telefone: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, preencha todos os campos corretamente');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        telefone: formData.telefone.replace(/\D/g, ''),
        data_nascimento: formData.data_nascimento,
        sexo: formData.sexo
      };

      await api.patch('/api/user/me/', dataToSend);

      toast.success('Perfil completado com sucesso!');

      // Chamar callback para atualizar o estado do usuário
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      if (error.response?.data) {
        const serverErrors = error.response.data;
        setErrors(serverErrors);
        toast.error('Erro ao completar perfil. Verifique os campos.');
      } else {
        toast.error('Erro ao completar perfil. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  console.log('CompleteProfileModal - Renderizando modal', { isOpen, user });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-black p-6 rounded-t-2xl">
          <div className="flex items-center gap-3 text-white">
            <div className="p-3 bg-white/20 rounded-full">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Complete seu Cadastro</h2>
              <p className="text-blue-100 text-sm mt-1">
                Precisamos de algumas informações adicionais
              </p>
            </div>
          </div>
        </div>

        {/* Alerta */}
        <div className="mx-6 mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                Complete seu perfil para continuar navegando
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Estes dados são necessários para utilizar o sistema
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Telefone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone className="h-4 w-4 text-blue-600" />
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handlePhoneChange}
              placeholder="(00) 00000-0000"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.telefone
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              }`}
              maxLength={15}
            />
            {errors.telefone && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.telefone}
              </p>
            )}
          </div>

          {/* Data de Nascimento */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Data de Nascimento
            </label>
            <input
              type="date"
              name="data_nascimento"
              value={formData.data_nascimento}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                errors.data_nascimento
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
            {errors.data_nascimento && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.data_nascimento}
              </p>
            )}
          </div>

          {/* Gênero */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <UsersIcon className="h-4 w-4 text-blue-600" />
              Gênero
            </label>
            <select
              name="sexo"
              value={formData.sexo}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all bg-white ${
                errors.sexo
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              }`}
            >
              <option value="">Selecione...</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="O">Outro</option>
            </select>
            {errors.sexo && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.sexo}
              </p>
            )}
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </div>
            ) : (
              'Completar Cadastro'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Após completar, você poderá navegar livremente pelo sistema
          </p>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;

