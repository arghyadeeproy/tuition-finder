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
        "degree_name": qualificationData.degree_name,
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
        "degree_name": qualificationData.degree_name,
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
    
  // Format date from YYYY-MM-DD or YYYY-MM or YYYY to MM/YYYY
  formatYearOfPassing: (dateString) => {
    if (!dateString) return "";

    // If already in mm/yyyy format, return as is
    if (/^\d{2}\/\d{4}$/.test(dateString)) return dateString;

    try {
      // Handle YYYY-MM-DD, YYYY-MM, or YYYY
      let year = "";
      let month = "01"; // Default to January if not provided

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // YYYY-MM-DD
        const [y, m] = dateString.split('-');
        year = y;
        month = m;
      } else if (/^\d{4}-\d{2}$/.test(dateString)) {
        // YYYY-MM
        const [y, m] = dateString.split('-');
        year = y;
        month = m;
      } else if (/^\d{4}$/.test(dateString)) {
        // YYYY
        year = dateString;
        month = "01";
      } else {
        // Try to parse as Date
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          year = String(date.getFullYear());
          month = String(date.getMonth() + 1).padStart(2, '0');
        } else {
          return dateString;
        }
      }

      return `${month}/${year}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }
};

export default educationalQualificationService;