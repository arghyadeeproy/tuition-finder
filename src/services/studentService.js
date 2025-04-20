import api from './api';

export const studentService = {
  // Get all students
  getStudents: () => api.get('/api/v1/students'),
  
  // Get a specific student by ID
  getStudentById: (id) => api.get(`/api/v1/students/${id}`),
  
  // Create a new student
  createStudent: (studentData) => {
    // Format date of birth to match expected format "DD/MM/YYYY"
    let formattedDOB = studentData.dateOfBirth;
    if (formattedDOB && formattedDOB.includes('-')) {
      // Convert from YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = formattedDOB.split('-');
      formattedDOB = `${day}/${month}/${year}`;
    }
    
    // Get the user_id with robust fallback
    let userId = null;
    
    // Try multiple storage locations
    const storedUserId = localStorage.getItem('user_id');
    const userData = localStorage.getItem('user_data');
    
    if (storedUserId) {
      userId = parseInt(storedUserId);
      console.log('Using user_id from localStorage:', userId);
    } else if (userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData && parsedUserData.id) {
          userId = parseInt(parsedUserData.id);
          console.log('Using user_id from user_data:', userId);
          // Save for future use
          localStorage.setItem('user_id', userId);
        }
      } catch (e) {
        console.error('Error parsing user_data:', e);
      }
    }
    
    if (!userId) {
      console.error('No user ID found in any storage location');
      throw new Error('User ID is required but not found');
    }
    
    // Match API format expected by the backend
    const apiFormattedData = {
      "student": {
        "user_id": userId,
        "name": studentData.name,
        "mobile_number": studentData.mobileNumber,
        "address": studentData.address,
        "gender": studentData.gender,
        "age": calculateAge(formattedDOB), // Calculate age from DOB
        "guardian_number": studentData.alternateNumber || "", // Changed from alt_mobile to guardian_number
        "is_active": true,
        "date_of_birth": formattedDOB,
        "marital_status": studentData.maritalStatus
      }
    };
    
    // Log the request for debugging
    console.log('Sending API request:', apiFormattedData);
    
    return api.post('/api/v1/students', apiFormattedData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
  },
  
  // Update an existing student
  updateStudent: (id, studentData) => {
    // Format date of birth
    let formattedDOB = studentData.dateOfBirth;
    if (formattedDOB && formattedDOB.includes('-')) {
      // Convert from YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = formattedDOB.split('-');
      formattedDOB = `${day}/${month}/${year}`;
    }
    
    const apiFormattedData = {
      "student": {
        "name": studentData.name,
        "mobile_number": studentData.mobileNumber,
        "address": studentData.address,
        "gender": studentData.gender,
        "age": calculateAge(formattedDOB), // Calculate age from DOB
        "guardian_number": studentData.alternateNumber || "", // Changed from alt_mobile to guardian_number
        "is_active": true,
        "date_of_birth": formattedDOB,
        "marital_status": studentData.maritalStatus
      }
    };
    
    return api.put(`/api/v1/students/${id}`, apiFormattedData);
  },
  
  // Delete a student
  deleteStudent: (id) => api.delete(`/api/v1/students/${id}`),
  
  // Get student preferences 
  getStudentPreferences: (studentId) => api.get(`/api/v1/students/${studentId}/preferences`),
  
  // Create student preferences
  createStudentPreferences: (studentId, preferenceData) => {
    return api.post(`/api/v1/students/${studentId}/preferences`, {
      preference: preferenceData
    });
  }
};

// Helper function to calculate age from DOB (DD/MM/YYYY)
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "";
  
  // Parse the DD/MM/YYYY format
  const [day, month, year] = dateOfBirth.split('/').map(Number);
  
  // Create date objects
  const birthDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
  const today = new Date();
  
  // Calculate the difference in years
  let age = today.getFullYear() - birthDate.getFullYear();
  
  // Adjust age if birthday hasn't occurred yet this year
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age.toString(); // Return as string to match JSON format
}

export default studentService;