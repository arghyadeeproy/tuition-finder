import api from './api';

export const studentEducationalQualificationService = {
  // Get all student qualifications
  getQualifications: () => api.get('/api/v1/student_educational_qualifications'),

  // Get qualifications for a specific student
  getStudentQualifications: (studentId) => 
    api.get(`/api/v1/students/${studentId}/educational_qualifications`),
  
  // Create educational qualification for a student
  createStudentQualification: (studentId, qualificationData) => {
    // Format the data to match API expectations based on the example JSON
    const formattedData = {
      "student_educational_qualification": {
        "student_id": studentId,
        "degree_id": qualificationData.degree_id || 1,
        "current_academic_level": qualificationData.current_academic_level || "",
        "school_name": qualificationData.school_name || "",
        "college_name": qualificationData.college_name || "",
        "university_name": qualificationData.university_name || "",
        "additional_information": qualificationData.additional_information || null
      }
    };

    return api.post('/api/v1/student_educational_qualifications', formattedData);
  },
  
  // Update an existing qualification
  updateStudentQualification: (qualificationId, qualificationData) => {
    const formattedData = {
      "student_educational_qualification": {
        "degree_id": qualificationData.degree_id || 1,
        "current_academic_level": qualificationData.current_academic_level || "",
        "school_name": qualificationData.school_name || "",
        "college_name": qualificationData.college_name || "",
        "university_name": qualificationData.university_name || "",
        "additional_information": qualificationData.additional_information || null
      }
    };

    return api.put(`/api/v1/student_educational_qualifications/${qualificationId}`, formattedData);
  },
  
  // Delete a qualification
  deleteStudentQualification: (qualificationId) => 
    api.delete(`/api/v1/student_educational_qualifications/${qualificationId}`),
    
  // Map educational type to academic level
  mapEducationTypeToAcademicLevel: (educationType) => {
    const academicLevelMap = {
      "School": "Primary/Secondary",
      "College": "Undergraduate",
      "University": "Graduate",
      "Working": "Professional"
    };
    
    return academicLevelMap[educationType] || "Primary/Secondary";
  },
  
  // Map education type to degree_id
  mapEducationTypeToDegreeId: (educationType) => {
    const degreeMap = {
      "School": 3, // Secondary education
      "College": 5, // Vocational/College level
      "University": 6, // Bachelor's level
      "Working": 7  // Assume professional would have at least Master's
    };
    
    return degreeMap[educationType] || 3;
  },
  
  // Format student form data to API expected structure
  formatStudentEducationData: (formData) => {
    return {
      degree_id: studentEducationalQualificationService.mapEducationTypeToDegreeId(formData.educationType),
      current_academic_level: studentEducationalQualificationService.mapEducationTypeToAcademicLevel(formData.educationType),
      school_name: formData.schoolName || "",
      college_name: formData.collegeName || "",
      university_name: formData.universityName || "",
      additional_information: formData.classStandard || formData.workingProfessional || null
    };
  }
};

export default studentEducationalQualificationService;