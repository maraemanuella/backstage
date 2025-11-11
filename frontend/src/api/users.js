import api from '../api';

const listUsers = async ({ role, verified, search } = {}) => {
  const params = {};
  if (role) params.role = role;
  if (verified !== undefined) params.verified = verified;
  if (search) params.search = search;

  const res = await api.get('/api/user-management/users/', { params });
  return res.data;
};

const getUser = async (id) => {
  const res = await api.get(`/api/user/${id}/`);
  return res.data;
};

const banToggle = async (id) => {
  const res = await api.post(`/api/user-management/users/${id}/ban/`);
  return res.data;
};

const revertOrganizer = async (id) => {
  const res = await api.post(`/api/user-management/users/${id}/revert-organizer/`);
  return res.data;
};

export default {
  listUsers,
  getUser,
  banToggle,
  revertOrganizer,
};
