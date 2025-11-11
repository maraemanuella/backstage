import api from "./../api.js";

const base = "/api/waitlist";

export default {
  getStatus: (eventId) => api.get(`${base}/${eventId}/status/`),
  join: (eventId) => api.post(`${base}/${eventId}/join/`),
  leave: (eventId) => api.post(`${base}/${eventId}/leave/`),
  getSuggestions: (eventId) => api.get(`${base}/${eventId}/suggestions/`),
};
