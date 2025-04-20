import api from './api';

export const teacherService = {
  // Get all teachers
  getTeachers: () => api.get('/api/v1/teachers'),
  
  // Get a specific teacher by ID
  getTeacherById: (id) => api.get(`/api/v1/teachers/${id}`),
  
  // Create a new teacher - fixed to match exact API format
  createTeacher: (teacherData) => {
    // Format date of birth to match expected format "DD/MM/YYYY"
    let formattedDOB = teacherData.dateOfBirth;
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
    
    // Match exactly the format seen in your API request example
    const apiFormattedData = {
      "teacher": {
        "user_id": userId,
        "name": teacherData.name,
        "address": teacherData.address,
        "mobile_number": teacherData.mobileNumber,
        "whatsapp_number": teacherData.alternateNumber || "",
        "email": teacherData.email || `${teacherData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        "gender": teacherData.gender,
        "date_of_birth": formattedDOB,
        // Add latitude and longitude if provided
        "latitude": teacherData.latitude || null,
        "longitude": teacherData.longitude || null,
        "profile_photo": teacherData.profilePhoto,
        "aadhar_photo": teacherData.aadharPhoto,
        "is_active": true,
      }
    };
    
    // Log the request for debugging
    console.log('Sending API request:', apiFormattedData);
    
    return api.postForm('/api/v1/teachers', apiFormattedData);
  },
  
  // Update an existing teacher
  updateTeacher: (id, teacherData) => {
    // Format date of birth
    let formattedDOB = teacherData.dateOfBirth;
    if (formattedDOB && formattedDOB.includes('-')) {
      // Convert from YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = formattedDOB.split('-');
      formattedDOB = `${day}/${month}/${year}`;
    }
    
    const apiFormattedData = {
      "teacher": {
        "name": teacherData.name,
        "address": teacherData.address,
        "mobile_number": teacherData.mobileNumber,
        "email": teacherData.email || `${teacherData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        "alt_mobile": teacherData.alternateNumber || "",
        "gender": teacherData.gender,
        "date_of_birth": formattedDOB,
        "is_active": true,
        // Add latitude and longitude if provided
        "latitude": teacherData.latitude || null,
        "longitude": teacherData.longitude || null
      }
    };
    
    return api.post(`/api/v1/teachers/${id}`, apiFormattedData);
  },
  
  // Delete a teacher
  deleteTeacher: (id) => api.delete(`/api/v1/teachers/${id}`),
  
  // Handle teacher preferences 
  getTeacherPreferences: (teacherId) => api.get(`/api/v1/teachers/${teacherId}/preferences`),
  
  // Create teacher preferences - UPDATED to use axios instead of fetch
  createTeacherPreferences: (teacherId, preferenceData) => {
    // Create FormData object for proper file handling
    const formData = new FormData();
    
    // Add all non-array, non-file properties
    Object.keys(preferenceData).forEach(key => {
      // Skip subject_ids and preferred_medium as we'll handle them specially
      if (key !== 'subject_ids' && key !== 'preferred_medium' && key !== 'resume') {
        formData.append(`teacher_preference[${key}]`, preferenceData[key]);
      }
    });
    
    // Handle subject_ids specially - convert array to individual form entries
    if (preferenceData.subject_ids && Array.isArray(preferenceData.subject_ids)) {
      preferenceData.subject_ids.forEach((id) => {
        formData.append(`teacher_preference[subject_ids][]`, id);
      });
    }
    
    // Handle preferred_medium specially - convert array to individual form entries
    if (preferenceData.preferred_medium && Array.isArray(preferenceData.preferred_medium)) {
      preferenceData.preferred_medium.forEach((medium) => {
        formData.append(`teacher_preference[preferred_medium][]`, medium);
      });
    }
    
    // Handle file upload separately
    if (preferenceData.resume) {
      formData.append('teacher_preference[resume]', preferenceData.resume);
    }
    
    // Log the formData keys for debugging
    console.log('FormData keys:', [...formData.keys()]);
    
    // Use axios through the api instance instead of fetch
    return api.post(`/api/v1/teachers/${teacherId}/teacher_preferences`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      return response.data;
    })
    .catch(error => {
      if (error.response && error.response.data) {
        throw new Error(JSON.stringify(error.response.data));
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    });
  }
};

export default teacherService;