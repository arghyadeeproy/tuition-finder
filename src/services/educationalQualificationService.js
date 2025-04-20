import api from './api';

export const educationalQualificationService = {
  // Get all qualifications/degrees from the backend
  getDegrees: () => api.get('/api/v1/degrees'),

  // Get qualifications for a specific teacher
  getTeacherQualifications: (teacherId) => 
    api.get(`/api/v1/teachers/${teacherId}/teacher_educational_qualifications`),
  
  // Create educational qualification for a teacher
  createTeacherQualification: (teacherId, qualificationData) => {
    // Format the data to match API expectations
    const formattedData = {
      "teacher_educational_qualification": {
        // "teacher_id": teacherId,
        "degree_id": qualificationData.degree_id,
        "subject_id": qualificationData.subject_id,
        "year_of_passing": qualificationData.yearofPassing,
        "school_name": qualificationData.schoolName,
        "college_name": qualificationData.collegeName,
        "university_name": qualificationData.universityName
      }
    };

    return api.post(`/api/v1/teachers/${teacherId}/teacher_educational_qualifications`, formattedData);
  },
  
  // Update an existing qualification
  updateTeacherQualification: (qualificationId, qualificationData) => {
    const formattedData = {
      "teacher_educational_qualification": {
        "degree_id": qualificationData.degree_id,
        "subject_id": qualificationData.subject_id,
        "year_of_passing": qualificationData.yearofPassing,
        "school_name": qualificationData.schoolName,
        "college_name": qualificationData.collegeName,
        "university_name": qualificationData.universityName
      }
    };

    return api.put(`/api/v1/teacher_educational_qualifications/${qualificationId}`, formattedData);
  },
  
  // Delete a qualification
  deleteTeacherQualification: (qualificationId) => 
    api.delete(`/api/v1/teacher_educational_qualifications/${qualificationId}`),
    
  // Format date from YYYY-MM-DD to DD-MM-YYYY
  formatYearOfPassing: (dateString) => {
    if (!dateString) return "";
    
    // Check if the date is already in the expected format
    if (dateString.includes('-') && dateString.split('-')[0].length === 2) return dateString;
    
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }
};

export default educationalQualificationService;