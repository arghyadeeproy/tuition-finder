import api from './api';

export const educationalQualificationService = {
  // Get all qualifications/degrees from the backend
  getDegrees: () => api.get('/api/v1/degrees'),

  // Get qualifications for a specific teacher
  getTeacherQualifications: (teacherId) => 
    api.get(`/api/v1/teachers/${teacherId}/teacher_educational_qualifications`),
  
  // Create educational qualification for a teacher
  createTeacherQualification: (teacherId, qualificationData) => {
    console.log("Original qualification data:", qualificationData);
    
    // CRITICAL FIX: Force the year of passing to be a string, defaulting to current year
    let yearValue = qualificationData.yearofPassing || qualificationData.year_of_passing || String(new Date().getFullYear());
    
    // Make sure it's a string
    yearValue = String(yearValue);
    
    // Ensure it's a valid 4-digit year
    if (!/^\d{4}$/.test(yearValue)) {
      yearValue = String(new Date().getFullYear());
    }
    
    console.log("Final year value to be sent:", yearValue);

    const formattedData = {
      "teacher_educational_qualification": {
        "degree_id": qualificationData.degree_id,
        "degree_name": qualificationData.degree_name || "",
        "subject_id": qualificationData.subject_id,
        "year_of_passing": yearValue, // CRITICAL: Use the validated year value
        "school_name": qualificationData.schoolName || "",
        "college_name": qualificationData.collegeName || "",
        "university_name": qualificationData.universityName || "",
        "school_education_board": qualificationData.school_education_board || "cbse"
      }
    };

    console.log("Sending API request with data:", JSON.stringify(formattedData));
    return api.post(`/api/v1/teachers/${teacherId}/teacher_educational_qualifications`, formattedData);
  },
  
  // Update an existing qualification
  updateTeacherQualification: (qualificationId, qualificationData) => {
    // CRITICAL FIX: Force the year of passing to be a string, defaulting to current year
    let yearValue = qualificationData.yearofPassing || qualificationData.year_of_passing || String(new Date().getFullYear());
    
    // Make sure it's a string
    yearValue = String(yearValue);
    
    // Ensure it's a valid 4-digit year
    if (!/^\d{4}$/.test(yearValue)) {
      yearValue = String(new Date().getFullYear());
    }

    const formattedData = {
      "teacher_educational_qualification": {
        "degree_id": qualificationData.degree_id,
        "degree_name": qualificationData.degree_name || "",
        "subject_id": qualificationData.subject_id,
        "year_of_passing": yearValue,
        "school_name": qualificationData.schoolName || "",
        "college_name": qualificationData.collegeName || "",
        "university_name": qualificationData.universityName || "",
        "school_education_board": qualificationData.school_education_board || "cbse"
      }
    };

    return api.put(`/api/v1/teacher_educational_qualifications/${qualificationId}`, formattedData);
  },
  
  // Delete a qualification
  deleteTeacherQualification: (qualificationId) => 
    api.delete(`/api/v1/teacher_educational_qualifications/${qualificationId}`),
    
  // We're no longer using this function as it was part of the issue
  // Instead, we handle the validation directly in the create/update methods
  formatYearOfPassing: (dateString) => {
    // Always return a 4-digit year string
    if (!dateString) {
      // If empty, use current year
      return String(new Date().getFullYear());
    }

    // If already a 4-digit year, return as is
    if (/^\d{4}$/.test(dateString)) {
      return dateString;
    }

    // Try to extract year from common formats
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      // YYYY-MM-DD
      return dateString.split('-')[0];
    }
    if (/^\d{4}-\d{2}$/.test(dateString)) {
      // YYYY-MM
      return dateString.split('-')[0];
    }
    if (/^\d{2}\/\d{4}$/.test(dateString)) {
      // MM/YYYY
      return dateString.split('/')[1];
    }

    // Try to parse as Date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return String(date.getFullYear());
    }

    // Fallback: use current year
    return String(new Date().getFullYear());
  }
};

export default educationalQualificationService;