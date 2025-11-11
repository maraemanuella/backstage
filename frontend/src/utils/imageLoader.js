/**
 * Utilitários para otimização de carregamento de imagens
 */

// Cache de imagens carregadas
const imageCache = new Map();

/**
 * Pré-carrega uma imagem e armazena em cache
 * @param {string} src - URL da imagem
 * @returns {Promise<string>} - URL da imagem carregada
 */
export const preloadImage = (src) => {
  if (imageCache.has(src)) {
    return Promise.resolve(src);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, true);
      resolve(src);
    };
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Constrói URL completa da imagem
 * @param {string} path - Caminho da imagem
 * @param {string} baseUrl - URL base (padrão: variável de ambiente)
 * @returns {string} - URL completa
 */
export const getImageUrl = (path, baseUrl = import.meta.env.VITE_API_URL) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${baseUrl}${path}`;
};

/**
 * Debounce para otimizar chamadas de API
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} - Função com debounce
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Verifica se a imagem está em cache
 * @param {string} src - URL da imagem
 * @returns {boolean}
 */
export const isImageCached = (src) => {
  return imageCache.has(src);
};
