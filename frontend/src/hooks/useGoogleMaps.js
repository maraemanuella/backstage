import { useLoadScript } from "@react-google-maps/api";

const libraries = ["places", "marker"];

export function useGoogleMaps() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries,
  });

  return { isLoaded, loadError };
}

