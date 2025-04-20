// teacherStudentRequestService.js
import api from './api';

// Create the service object
const teacherStudentRequestService = {
  // Get all teacher-student requests
  getRequests: () => api.get('/api/v1/teacher_student_requests'),
  
  // Get a specific request by ID
  getRequest: (id) => api.get(`/api/v1/teacher_student_requests/${id}`),
  
  // Create a new teacher-student request - updated format based on screenshot
  createRequest: (requestData) => api.post('/api/v1/teacher_student_requests', {
    teacher_student_request: requestData
  }),
  
  // Update an existing request
  updateRequest: (id, requestData) => api.put(`/api/v1/teacher_student_requests/${id}`, {
    teacher_student_request: requestData
  }),
  
  // Delete a request
  deleteRequest: (id) => api.delete(`/api/v1/teacher_student_requests/${id}`),
  
  // Get requests for a specific student
  getStudentRequests: (studentId) => api.get(`/api/v1/teacher_student_requests?student_id=${studentId}`),
  
  // Get requests for a specific teacher
  getTeacherRequests: (teacherId) => api.get(`/api/v1/teacher_student_requests?teacher_id=${teacherId}`),
  
  // Update request status (accept/reject/cancel)
  updateRequestStatus: (id, status) => api.patch(`/api/v1/teacher_student_requests/${id}/update_status`, {
    status: status
  })
};

// Export as both named and default export to ensure compatibility
export { teacherStudentRequestService };
export default teacherStudentRequestService;