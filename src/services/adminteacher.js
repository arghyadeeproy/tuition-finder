import api from './api'; // Assuming you're using the API file you shared

// Service for teacher-related API calls
export const teacherService = {
  // Get all teachers with their basic information
  getTeachers: async () => {
    try {
      const response = await api.get('/api/v1/teachers');
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  // Get all users (which includes both teachers and students)
  getUsers: async () => {
    try {
      const response = await api.get('/api/v1/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get educational qualifications for teachers
  getTeacherEducationalQualifications: async () => {
    try {
      const response = await api.get('/api/v1/teacher_educational_qualifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher qualifications:', error);
      throw error;
    }
  },

  // Get merged teacher data with user details and qualifications
  getMergedTeacherData: async () => {
    try {
      // Fetch all required data in parallel
      const [teachersResponse, usersResponse, qualificationsResponse] = await Promise.all([
        teacherService.getTeachers(),
        teacherService.getUsers(),
        teacherService.getTeacherEducationalQualifications()
      ]);

      // Extract data arrays
      const teachers = teachersResponse.data || [];
      const users = usersResponse.data || [];
      const qualifications = qualificationsResponse?.data || [];

      // Create a map of user data by ID for quick lookup
      const userMap = {};
      users.forEach(user => {
        userMap[user.id] = user;
      });

      // Create a map of qualifications by teacher ID
      const qualificationMap = {};
      qualifications.forEach(qual => {
        if (qual.teacher_id) {
          if (!qualificationMap[qual.teacher_id]) {
            qualificationMap[qual.teacher_id] = [];
          }
          qualificationMap[qual.teacher_id].push(qual);
        }
      });

      // Merge teacher data with user data and qualifications
      const mergedTeachers = teachers.map(teacher => {
        // Match with user data
        const userData = userMap[teacher.id] || {};
        
        // Get qualifications for this teacher
        const teacherQualifications = qualificationMap[teacher.id] || [];
        
        // Find the university from qualifications (using the most recent one)
        const sortedQualifications = [...teacherQualifications].sort((a, b) => 
          new Date(b.graduation_date || 0) - new Date(a.graduation_date || 0)
        );
        
        const university = sortedQualifications.length > 0 ? 
          sortedQualifications[0].university : 'Not specified';

        // Extract subjects from qualifications
        const subjects = teacherQualifications
          .map(qual => qual.subject)
          .filter(Boolean)
          .join(', ') || 'Not specified';

        // Merge the data
        return {
          id: teacher.id,
          name: teacher.name || userData.name || 'Unnamed Teacher',
          phone: teacher.mobile_number || 'Not provided',
          email: teacher.email || userData.email || 'Not provided',
          subjects: subjects,
          location: teacher.address || 'Not specified',
          university: university,
          verified: teacher.is_active || false,
          // Include other fields as needed
          gender: teacher.gender,
          dateOfBirth: teacher.date_of_birth
        };
      });

      return {
        status: "success",
        message: `${mergedTeachers.length} teachers found`,
        data: mergedTeachers
      };
    } catch (error) {
      console.error('Error merging teacher data:', error);
      throw error;
    }
  }
};

export default teacherService;