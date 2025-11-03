import { toast as reactToastify } from "react-toastify";

/**
 * Configuração padrão para todas as mensagens toast
 */
const defaultOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

/**
 * Exibe uma mensagem de sucesso
 * @param {string} message - Mensagem a ser exibida
 * @param {object} options - Opções adicionais para o toast
 */
export const success = (message, options = {}) => {
  reactToastify.success(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Exibe uma mensagem de erro
 * @param {string} message - Mensagem a ser exibida
 * @param {object} options - Opções adicionais para o toast
 */
export const error = (message, options = {}) => {
  reactToastify.error(message, {
    ...defaultOptions,
    autoClose: 6000, // Erros ficam mais tempo visíveis
    ...options,
  });
};

/**
 * Exibe uma mensagem informativa
 * @param {string} message - Mensagem a ser exibida
 * @param {object} options - Opções adicionais para o toast
 */
export const info = (message, options = {}) => {
  reactToastify.info(message, {
    ...defaultOptions,
    ...options,
  });
};

/**
 * Exibe uma mensagem de aviso
 * @param {string} message - Mensagem a ser exibida
 * @param {object} options - Opções adicionais para o toast
 */
export const warning = (message, options = {}) => {
  reactToastify.warning(message, {
    ...defaultOptions,
    autoClose: 5000,
    ...options,
  });
};

/**
 * Exibe uma promise toast (útil para operações assíncronas)
 * @param {Promise} promise - Promise a ser executada
 * @param {object} messages - Mensagens para cada estado (pending, success, error)
 * @param {object} options - Opções adicionais para o toast
 * 
 * @example
 * promise(
 *   api.post('/endpoint', data),
 *   {
 *     pending: 'Salvando...',
 *     success: 'Dados salvos com sucesso!',
 *     error: 'Erro ao salvar dados'
 *   }
 * );
 */
export const promise = (promiseFunc, messages, options = {}) => {
  return reactToastify.promise(
    promiseFunc,
    {
      pending: messages.pending || "Processando...",
      success: messages.success || "Operação concluída!",
      error: messages.error || "Erro ao processar operação",
    },
    {
      ...defaultOptions,
      ...options,
    }
  );
};

/**
 * Fecha todos os toasts ativos
 */
export const dismiss = () => {
  reactToastify.dismiss();
};

/**
 * Exibe um toast personalizado
 * @param {string} message - Mensagem a ser exibida
 * @param {object} options - Opções completas para o toast
 */
export const custom = (message, options = {}) => {
  reactToastify(message, {
    ...defaultOptions,
    ...options,
  });
};

// Export default para facilitar importação
const toast = {
  success,
  error,
  info,
  warning,
  promise,
  dismiss,
  custom,
};

export default toast;
