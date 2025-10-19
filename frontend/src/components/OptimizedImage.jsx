import { useState, useEffect } from 'react';
import { getImageUrl, preloadImage } from '../utils/imageLoader';

/**
 * Componente de imagem otimizado com lazy loading e cache
 */
function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  fallback = null,
  eager = false 
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const imageUrl = getImageUrl(src);
    
    if (eager) {
      // Pré-carrega imagem importante (ex: foto de perfil)
      preloadImage(imageUrl)
        .then(() => {
          setImageSrc(imageUrl);
          setIsLoading(false);
        })
        .catch(() => {
          setHasError(true);
          setIsLoading(false);
        });
    } else {
      // Carregamento lazy normal
      setImageSrc(imageUrl);
      setIsLoading(false);
    }
  }, [src, eager]);

  if (hasError || !imageSrc) {
    return fallback || (
      <div className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Sem imagem</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`} />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setHasError(true)}
    />
  );
}

export default OptimizedImage;
