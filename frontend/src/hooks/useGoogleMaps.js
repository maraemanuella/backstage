import { useLoadScript } from "@react-google-maps/api";

const libraries = ["places", "marker"];

export function useGoogleMaps() {
  const loadResult = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  if (typeof window !== 'undefined' && window.google) {
    return { isLoaded: true, loadError: null };
  }

  return loadResult;
}
