import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    validateToken();
  }, [uid, token]);

  const validateToken = async () => {
    setValidating(true);
    try {
      const response = await api.post('/api/password-reset-validate/', {
        uid: uid,
        token: token
      });
      
      if (response.data.valid) {
        setIsValidToken(true);
      } else {
        setError('Link inválido ou expirado.');
        setIsValidToken(false);
      }
    } catch (err) {
      setError('Link inválido ou expirado.');
      setIsValidToken(false);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/password-reset-confirm/', {
        uid: uid,
        token: token,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      setMessage(response.data.message);
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.new_password) {
        setError(err.response.data.new_password[0]);
      } else if (err.response?.data?.confirm_password) {
        setError(err.response.data.confirm_password[0]);
      } else {
        setError('Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Validando link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Link inválido ou expirado</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Este link não é mais válido. Por favor, solicite uma nova recuperação de senha.</p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm font-medium text-red-800 hover:text-red-600"
                    >
                      Solicitar novo link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Redefinir senha
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Digite sua nova senha
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-200">
              <p className="text-sm text-green-800">{message}</p>
              <p className="text-xs text-green-600 mt-1">Redirecionando para o login...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                Nova senha
              </label>
              <div className="mt-1">
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Digite sua nova senha"
                  minLength={8}
                />
              </div>
              <PasswordStrengthIndicator password={newPassword} />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirmar senha
              </label>
              <div className="mt-1">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Digite a senha novamente"
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || message}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-500"
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

