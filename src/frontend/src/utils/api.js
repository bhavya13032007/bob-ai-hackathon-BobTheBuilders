import axios from 'axios';

const api = axios.create({
  baseURL: '',
});

export const getInternships = async (filters = {}) => {
  const { data } = await api.get('/internships', { params: filters });
  return data;
};

export const getInternshipDetail = async (id) => {
  const { data } = await api.get(`/internships/${id}`);
  return data;
};

export const getRecommendations = async (candidateId) => {
  const { data } = await api.post('/recommend', { candidate_id: candidateId });
  return data;
};

export const getCandidate = async (id) => {
  const { data } = await api.get(`/candidates/${id}`);
  return data;
};

export const updateCandidate = async (payload) => {
  const { data } = await api.post('/candidates', payload);
  return data;
};

export const getCertificates = async (candidateId) => {
  const { data } = await api.get(`/certificates`, { params: { candidate_id: candidateId } });
  return data;
};

export const getNotifications = async (userId) => {
  const { data } = await api.get(`/notifications`, { params: { user_id: userId } });
  return data;
};

export const applyInternship = async (internshipId, candidateId) => {
  const { data } = await api.post(`/internships/${internshipId}/apply`, { candidate_id: candidateId });
  return data;
};

export default api;
