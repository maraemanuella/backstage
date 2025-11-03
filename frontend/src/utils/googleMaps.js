// Configuração do Google Maps API
export const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'marker'],
  language: 'pt-BR',
  version: 'weekly'
}

// Função para carregar a biblioteca Places usando APILoader (método recomendado)
export const loadPlacesLibrary = async () => {
  try {
    // Verificar se a API Key está configurada
    if (!GOOGLE_MAPS_CONFIG.apiKey) {
      throw new Error('Google Maps API Key não configurada')
    }

    // Importar o APILoader do Extended Component Library
    const { APILoader } = await import(
      'https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js'
    )

    // Configurar e carregar a API
    APILoader.apiKey = GOOGLE_MAPS_CONFIG.apiKey
    APILoader.language = GOOGLE_MAPS_CONFIG.language

    // Importar a biblioteca Places
    const { Autocomplete } = await APILoader.importLibrary('places')

    return { Autocomplete, APILoader }
  } catch (error) {
    console.error('Erro ao carregar Google Maps Places Library:', error)
    throw error
  }
}





