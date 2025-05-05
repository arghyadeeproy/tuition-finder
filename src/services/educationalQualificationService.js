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
    const formattedYearOfPassing = educationalQualificationService.formatYearOfPassing(qualificationData.yearofPassing);
    
    console.log("API PAYLOAD PREPARATION:");
    console.log("- Raw year value:", qualificationData.yearofPassing);
    console.log("- Formatted year value:", formattedYearOfPassing);
    console.log("- All qualification data:", qualificationData);
    
    // Directly ensure the value is not null before creating payload
    const year_of_passing = formattedYearOfPassing || "01/2000";
    
    const formattedData = {
      "teacher_educational_qualification": {
        "degree_id": qualificationData.degree_id,
        "degree_name": qualificationData.degree_name || "",
        "subject_id": qualificationData.subject_id,
        "year_of_passing": year_of_passing, // Use guaranteed non-null value
        "school_name": qualificationData.schoolName || "",
        "college_name": qualificationData.collegeName || "",
        "university_name": qualificationData.universityName || "",
        "school_education_board": qualificationData.school_education_board || "cbse" // Default value
      }
    };
    
    console.log("Final API payload:", JSON.stringify(formattedData, null, 2));

    return api.post(`/api/v1/teachers/${teacherId}/teacher_educational_qualifications`, formattedData);
  },
  
  // Update an existing qualification
  updateTeacherQualification: (qualificationId, qualificationData) => {
    const formattedYearOfPassing = educationalQualificationService.formatYearOfPassing(qualificationData.yearofPassing);
    const year_of_passing = formattedYearOfPassing || "01/2000";
    
    const formattedData = {
      "teacher_educational_qualification": {
        "degree_id": qualificationData.degree_id,
        "degree_name": qualificationData.degree_name || "",
        "subject_id": qualificationData.subject_id,
        "year_of_passing": year_of_passing,
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
    
  // Format date from YYYY-MM-DD or YYYY-MM or YYYY to MM/YYYY
  formatYearOfPassing: (dateString) => {
    console.log("Date formatting input:", dateString, "Type:", typeof dateString);
    
    // Handle all falsy values (null, undefined, empty string)
    if (!dateString) {
      console.warn("WARNING: Year of passing is empty or null - using default");
      return "01/2000"; // Default value to prevent null
    }

    // If already in mm/yyyy format, return as is
    if (/^\d{2}\/\d{4}$/.test(dateString)) {
      console.log("Already in correct format:", dateString);
      return dateString;
    }

    try {
      // Handle YYYY-MM-DD, YYYY-MM, or YYYY
      let year = "2000"; // Default year
      let month = "01";  // Default month

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        // YYYY-MM-DD
        const [y, m] = dateString.split('-');
        year = y;
        month = m;
        console.log(`Parsed YYYY-MM-DD: year=${year}, month=${month}`);
      } else if (/^\d{4}-\d{2}$/.test(dateString)) {
        // YYYY-MM
        const [y, m] = dateString.split('-');
        year = y;
        month = m;
        console.log(`Parsed YYYY-MM: year=${year}, month=${month}`);
      } else if (/^\d{4}$/.test(dateString)) {
        // YYYY
        year = dateString;
        console.log(`Parsed YYYY: year=${year}, month=${month}`);
      } else {
        // Try to parse as Date
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          year = String(date.getFullYear());
          month = String(date.getMonth() + 1).padStart(2, '0');
          console.log(`Parsed as Date: year=${year}, month=${month}`);
        } else {
          console.warn("Could not parse date:", dateString);
          return "01/2000"; // Default value for unparseable dates
        }
      }

      const formattedDate = `${month}/${year}`;
      console.log("Final formatted date:", formattedDate);
      return formattedDate;
    } catch (e) {
      console.error('Error formatting date:', e);
      return "01/2000"; // Default value on error
    }
  }
};

export default educationalQualificationService;

// 2. UPDATED FORM SUBMIT LOGIC - PersonalDetailsForm.jsx
// Replace your handleNext function with this one

const handleNext = async () => {
  if (validateForm()) {
    setIsSubmitting(true);
    
    try {
      // Get teacher ID from localStorage
      const teacherId = localStorage.getItem('teacher_id');
      
      if (!teacherId) {
        setErrors({
          general: "Teacher ID not found. Please complete personal details first."
        });
        setIsSubmitting(false);
        return;
      }
      
      // Get the degree ID and subject ID from the form values
      let degreeId = formData.EducationalQualification;
      let degreeName = '';
      if (degreeId === OTHER_QUALIFICATION_VALUE) {
        degreeId = null;
        degreeName = formData.otherQualification.trim();
      } else {
        degreeId = parseInt(degreeId);
      }
      const subjectId = parseInt(formData.subject_id);
      
      // IMPORTANT: Ensure yearofPassing has a value
      // First use the form value, if not available use current date, stringify as backup
      let yearOfPassing = formData.yearofPassing;
      if (!yearOfPassing || yearOfPassing.trim() === '') {
        console.warn("Year of passing was empty, using current date");
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        yearOfPassing = `${year}-${month}`;
      }
      
      console.group("FORM SUBMISSION DATA");
      console.log("- Teacher ID:", teacherId);
      console.log("- Degree ID:", degreeId);
      console.log("- Degree Name:", degreeName);
      console.log("- Subject ID:", subjectId);
      console.log("- Year of Passing (raw):", yearOfPassing);
      console.log("- School Board:", formData.school_education_board);
      console.groupEnd();
      
      // Format the qualification data
      const qualificationData = {
        degree_id: degreeId,
        degree_name: degreeName,
        subject_id: subjectId,
        yearofPassing: yearOfPassing, // This is the critical field
        schoolName: formData.schoolName,
        collegeName: formData.collegeName,
        universityName: formData.universityName,
        school_education_board: formData.school_education_board,
      };
      
      // Submit the qualification
      const response = await educationalQualificationService.createTeacherQualification(
        teacherId,
        qualificationData
      );
      
      console.log("API response:", response);
      
      // Navigate to the next page
      navigate('/teachersubject');
    } catch (error) {
      console.error("Error submitting qualification:", error);
      console.error("Error details:", error.response?.data || error.message);
      setErrors({
        general: "Error submitting educational qualification. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  }
};

// 3. UPDATED DATE FIELD - Add this to PersonalDetailsForm.jsx 
// Add this inside your component but outside any function

// Ensure initial state has a valid date
useEffect(() => {
  if (!formData.yearofPassing || formData.yearofPassing.trim() === '') {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const initialDate = `${year}-${month}`;
    
    setFormData(prev => ({
      ...prev,
      yearofPassing: initialDate
    }));
    
    console.log("Set default date:", initialDate);
  }
}, []);

