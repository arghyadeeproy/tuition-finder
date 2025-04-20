import api from './api';

/**
 * Service for managing subjects in the application
 */
export const subjectService = {
  /**
   * Get all subjects
   * @returns {Promise} API response with subjects data
   */
  getSubjects: () => api.get('/api/v1/subjects'),
  
  /**
   * Get a specific subject by ID
   * @param {number|string} id - The subject ID
   * @returns {Promise} API response with subject data
   */
  getSubject: (id) => api.get(`/api/v1/subjects/${id}`),
  
  /**
   * Create a new subject
   * @param {Object} subjectData - The subject data to create
   * @returns {Promise} API response with created subject
   */
  createSubject: (subjectData) => api.post('/api/v1/subjects', {
    subject: subjectData
  }),
  
  /**
   * Update an existing subject
   * @param {number|string} id - The subject ID to update
   * @param {Object} subjectData - The updated subject data
   * @returns {Promise} API response with updated subject
   */
  updateSubject: (id, subjectData) => api.put(`/api/v1/subjects/${id}`, {
    subject: subjectData
  }),
  
  /**
   * Delete a subject
   * @param {number|string} id - The subject ID to delete
   * @returns {Promise} API response
   */
  deleteSubject: (id) => api.delete(`/api/v1/subjects/${id}`)
};

export default subjectService;