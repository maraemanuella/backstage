import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [loading, setLoading] = useState(true);

  const checkProfileComplete = (userData) => {
    if (!userData) return false;

    // Verificar se os campos obrigatórios estão preenchidos
    const requiredFields = ['telefone', 'data_nascimento', 'sexo'];

    return requiredFields.every(field => {
      const value = userData[field];
      return value !== null && value !== undefined && value !== '';
    });
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/user/me/');
      const userData = response.data;
      console.log('ProfileContext - Dados do usuário carregados:', userData);
      setUser(userData);
      const isComplete = checkProfileComplete(userData);
      console.log('ProfileContext - Perfil completo?', isComplete);
      console.log('ProfileContext - Campos:', {
        telefone: userData.telefone,
        data_nascimento: userData.data_nascimento,
        sexo: userData.sexo
      });
      setIsProfileComplete(isComplete);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUser(null);
      setIsProfileComplete(true); // Para não bloquear se não conseguir carregar
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = () => {
    fetchUser();
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        user,
        isProfileComplete,
        loading,
        refreshUser,
        setIsProfileComplete
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

