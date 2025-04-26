import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Adjust this to your API base URL
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for handling authentication errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Redirect to signup page on unauthorized responses
      clearAuthData(); // Use our centralized function
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Centralized function to clear all auth-related data
const clearAuthData = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('role_id');
  localStorage.removeItem('auth_response'); // Added to remove the full response
  // Add any other auth-related items that might be stored
};

// Utility function to wait for user ID to be available
const waitForUserId = (maxWaitTimeMs = 10000, checkIntervalMs = 100) => {
  return new Promise((resolve, reject) => {
    // Check immediately first
    const userId = localStorage.getItem('user_id');
    if (userId) {
      return resolve(userId);
    }
    
    // Set up polling if not found immediately
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      const userId = localStorage.getItem('user_id');
      
      if (userId) {
        clearInterval(checkInterval);
        resolve(userId);
      } else if (Date.now() - startTime > maxWaitTimeMs) {
        clearInterval(checkInterval);
        reject(new Error('No user_id found in localStorage. User might not be logged in.'));
      }
    }, checkIntervalMs);
  });
};

// Improved helper function to recursively find user ID in response
const findUserIdInObject = (obj, maxDepth = 3, currentDepth = 0) => {
  // Prevent too deep recursion
  if (!obj || typeof obj !== 'object' || currentDepth > maxDepth) {
    return null;
  }
  
  // Direct check for id
  if (obj.id && (typeof obj.id === 'number' || typeof obj.id === 'string')) {
    return obj.id;
  }
  
  // Search in nested objects
  for (const key in obj) {
    // Skip certain keys that are unlikely to contain user data
    if (['token_type', 'expires_in', 'created_at', 'updated_at'].includes(key)) {
      continue;
    }
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // If the key is 'user' or contains 'user', prioritize this path
      if (key === 'user' || key.includes('user') || key === 'profile') {
        if (obj[key].id) {
          return obj[key].id;
        }
      }
      
      // Recursive search
      const result = findUserIdInObject(obj[key], maxDepth, currentDepth + 1);
      if (result) {
        return result;
      }
    }
  }
  
  return null;
};

// MODIFIED: Set a fixed role ID (1) instead of fetching it from the server
const setFixedRoleId = (userId) => {
  if (!userId) {
    console.error('Cannot set role ID without a user ID');
    return null;
  }
  
  // Always set role ID to 1 (teacher role)
  const roleId = '1';
  console.log(`Setting fixed role ID: ${roleId} for user ${userId}`);
  localStorage.setItem('role_id', roleId);
  return roleId;
};

// API endpoints
export const authService = {
  // Sign in with complete localStorage reset and fixed role ID
  signIn: async (credentials) => {
    try {
      // IMPORTANT: Clear all localStorage data BEFORE making the request
      localStorage.clear();
      
      const response = await api.post('/users/tokens/sign_in', credentials);
      console.log('Response from sign_in:', response.data);
      
      // Store the full response data in localStorage
      localStorage.setItem('auth_response', JSON.stringify(response.data));
      
      // Store auth token
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      } else if (response.data?.refresh_token) {
        localStorage.setItem('auth_token', response.data.refresh_token);
      }
      
      // Enhanced user ID extraction - checks multiple locations in the response
      let userId = null;
      
      // Check direct properties first
      if (response.data?.id) {
        userId = response.data.id;
        console.log('Found direct user_id in response:', userId);
      } else if (response.data?.user_id) {
        userId = response.data.user_id;
        console.log('Found user_id property in response:', userId);
      } else if (response.data?.user?.id) {
        userId = response.data.user.id;
        console.log('Found user_id in user object:', userId);
      } else if (response.data?.profile?.id) {
        userId = response.data.profile.id;
        console.log('Found user_id in profile object:', userId);
      } else if (response.data?.resource_owner?.id) {
        userId = response.data.resource_owner.id;
        console.log('Found user_id in resource_owner object:', userId);
      } else {
        // Try to find the ID using the recursive helper
        userId = findUserIdInObject(response.data);
        if (userId) {
          console.log('Found user_id through deep search:', userId);
        } else {
          console.warn('User ID not found in response');
        }
      }
      if (userId) {
        localStorage.setItem('user_id', userId.toString());
        // MODIFIED: Set the fixed role ID (1) instead of fetching it
        const roleId = setFixedRoleId(userId);
        if (response.data.profile !== null) {
        switch (roleId) {
          case '1':
            localStorage.setItem('teacher_id', response.data.profile[0].id);
            break;
          case '2':
            localStorage.setItem('student_id', response.data.profile[0].id);
            break;
          case '3':
            localStorage.setItem('job_seeker_id', response.data.profile[0].id);
            break;
          case '4':
            localStorage.setItem('employer_id', response.data.profile[0].id);
            break;
        }
      }
      }
      
      return response;
    } catch (error) {
      console.error('Sign in error:', error);
      // Ensure localStorage is cleared on failure
      clearAuthData();
      throw error;
    }
  },
  
  adminSignIn: async (credentials) => {
    try {
      // Clear everything before admin sign in
      localStorage.clear();
      
      const response = await api.post('/admin-sign-in', credentials);
      
      // Store the full response data in localStorage
      localStorage.setItem('auth_response', JSON.stringify(response.data));
      
      // Store admin token if available
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      // Store admin user ID in local storage after successful login
      if (response.data && response.data.user_id) {
        localStorage.setItem('user_id', response.data.user_id.toString());
      } else if (response.data && response.data.user && response.data.user.id) {
        localStorage.setItem('user_id', response.data.user.id.toString());
      }
      
      // MODIFIED: Set the fixed role ID (1) for admin as well
      const userId = localStorage.getItem('user_id');
      if (userId) {
        setFixedRoleId(userId);
      }
      
      return response;
    } catch (error) {
      clearAuthData();
      throw error;
    }
  },
  
  // Updated signUp method with proper localStorage clearing and fixed role ID
  signUp: async (userData) => {
    try {
      // IMPORTANT: Clear ALL localStorage data before registration
      localStorage.clear();
      
      console.log('Sending registration data:', userData);
      const response = await api.post('/api/v1/users', userData);
      console.log('Signup response:', response.data);
      
      // Store the full response data in localStorage
      localStorage.setItem('auth_response', JSON.stringify(response.data));
      
      // Store auth token if provided
      if (response.data?.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      
      // Store user ID
      let userId = null;
      
      if (response.data?.id) {
        userId = response.data.id;
      } else if (response.data?.user?.id) {
        userId = response.data.user.id;
      } else if (response.data?.data?.id) {
        userId = response.data.data.id;
      } else if (response.data?.data?.user?.id) {
        userId = response.data.data.user.id;
      } else {
        // Try to find the ID using the recursive helper
        userId = findUserIdInObject(response.data);
      }
      
      if (userId) {
        localStorage.setItem('user_id', userId.toString());
        
        // MODIFIED: Set the fixed role ID (1) for new signups
        setFixedRoleId(userId);
      }
      
      return response;
    } catch (error) {
      console.error('Sign up error:', error);
      // Clear any partial data on error
      clearAuthData();
      throw error;
    }
  },
  
  // Sign out method to clear all auth data
  signOut: () => {
    localStorage.clear();
    // Optionally call a server endpoint to invalidate the token
    // return api.post('/users/tokens/sign_out');
  },
  
  getActivityLog: () => api.get('/Activity-Log'),
  
  // Helper method to get the current user ID
  getCurrentUserId: () => localStorage.getItem('user_id'),
  
  // Helper method to get the current role ID
  getCurrentRoleId: () => {
    // MODIFIED: If role ID doesn't exist, set it to 1 and return
    const roleId = localStorage.getItem('role_id');
    if (!roleId) {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        return setFixedRoleId(userId);
      }
    }
    return roleId;
  },

  // Helper method to get the full auth response
  getFullAuthResponse: () => {
    const authResponse = localStorage.getItem('auth_response');
    return authResponse ? JSON.parse(authResponse) : null;
  },
  
  // Method that waits for user ID to be available
  waitForUserId: (maxWaitTimeMs = 10000, checkIntervalMs = 100) => waitForUserId(maxWaitTimeMs, checkIntervalMs),
  
  // Method to ensure role ID is available (always sets it to 1)
  ensureRoleId: async () => {
    try {
      // First check if role ID is already in localStorage
      const roleId = localStorage.getItem('role_id');
      if (roleId) {
        console.log('Role ID already exists in localStorage:', roleId);
        return roleId;
      }
      
      // If not, get the user ID and set the fixed role ID
      const userId = localStorage.getItem('user_id');
      if (userId) {
        console.log('No role ID found. Setting fixed role ID (1)...');
        return setFixedRoleId(userId);
      }
      
      console.error('Cannot set role ID without a user ID');
      return null;
    } catch (error) {
      console.error('Error ensuring role ID:', error);
      return null;
    }
  },
  
  // Method that ensures a user is logged in before proceeding
  requireAuth: async (redirectPath = '/') => {
    try {
      await waitForUserId();
      // MODIFIED: Always ensure the role ID is set to 1
      const userId = localStorage.getItem('user_id');
      if (userId && !localStorage.getItem('role_id')) {
        setFixedRoleId(userId);
      }
      return true;
    } catch (error) {
      window.location.href = redirectPath;
      return false;
    }
  },
  
  // Helper for handling post-login redirection based on profile existence
  handleRoleBasedRedirection: async (navigate, setIsLoading, setErrors) => {
    try {
      // Wait for user ID to be available
      const userId = await waitForUserId(5000);
      console.log('User ID confirmed:', userId);
      
      // Ensure role ID is set to 1
      if (!localStorage.getItem('role_id')) {
        setFixedRoleId(userId);
      }
      
      // Get the current user data
      try {
        const response = await api.get(`/api/v1/users/${userId}`);
        console.log('User data for redirection:', response.data);
        
        // Simple profile null check
        const userData = response.data;
        const hasProfile = userData && userData.profile !== null;
        
        console.log('Profile exists:', !!hasProfile);
        
        if (hasProfile) {
          console.log('Redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.log('Redirecting to details');
          navigate('/personal_details_teacher');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Default to details if unable to determine profile status
        navigate('/personal_details_teacher');
      }
      
      if (setIsLoading) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error during redirection:', error);
      if (setErrors) {
        setErrors({
          apiError: error.message || 'An error occurred. Please try again.'
        });
      }
      if (setIsLoading) {
        setIsLoading(false);
      }
    }
  }
};

export const userService = {
  getUsers: () => api.get('/api/v1/users'),
  getUserById: (id) => api.get(`/api/v1/users/${id}`),
  createUser: (userData) => api.post('/api/v1/users', userData),
  
  // Get current user with waiting capability
  getCurrentUser: async (waitTime = 10000) => {
    try {
      const userId = await waitForUserId(waitTime);
      return api.get(`/api/v1/users/${userId}`);
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

export const teacherService = {
  getTeachers: () => api.get('/teacher'),
  getTeacherPreferences: () => api.get('/Teacher-Preference'),
  getTeacherSchedule: () => api.get('/TeacherSchedule')
};

export const jobService = {
  getJobApplicants: () => api.get('/Job-Applicants'),
  getCompanyJobs: () => api.get('/Company-Job'),
  getCompanies: () => api.get('/Company')
};

export const studentService = {
  getStudents: () => api.get('/Student'),
  getTeacherStudentRequests: () => api.get('/Teacher-Student-Request')
};

export const dashboardService = {
  getDashboardData: () => api.get('/dashboard')
};

export const subjectService = {
  getSubjects: () => api.get('/api/v1/subjects')
};

export const employerService = {
  getEmployers: () => api.get('/employer')
};

export const qualificationService = {
  getQualifications: () => api.get('/educational-qualification')
};

// Sample implementation of handlePostLoginRedirection function for CombinedAuthForm component
export const handlePostLoginRedirection = async (navigate, setIsLoading, setErrors) => {
  try {
    // Use the new centralized method for redirection based on profile existence
    await authService.handleRoleBasedRedirection(navigate, setIsLoading, setErrors);
  } catch (error) {
    console.error('Error during post-login redirection:', error);
    if (setErrors) {
      setErrors({
        apiError: error.message || 'An error occurred. Please try again.'
      });
    }
    if (setIsLoading) {
      setIsLoading(false);
    }
  }
};

// For use in components that need user information
export const checkAuthAndFetchUserData = async (setUser, setLoading, navigate) => {
  try {
    setLoading(true);
    // Ensure the user is authenticated
    await authService.requireAuth('/');
    
    // Ensure role ID is available (set to 1)
    await authService.ensureRoleId();
    
    // Get the current user data
    const response = await userService.getCurrentUser();
    setUser(response.data);
    setLoading(false);
  } catch (error) {
    console.error('Error fetching user data:', error);
    setLoading(false);
    // Redirect to login if authentication failed
    navigate('/');

  }
};

export default api;