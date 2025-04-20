import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authService } from '../services/api';

const CombinedAuthForm = () => {
  // Combined form data for both login and signup
  const [formData, setFormData] = useState({
    // Login fields
    emailOrPhone: '',
    password: '',
    
    // Additional signup fields
    agreeToTerms: false,
    user_role_id: 1 // Default to teacher role (1)
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [serverError, setServerError] = useState(''); // New state for server errors
  const [serverSuccess, setServerSuccess] = useState(''); // New state for server success messages
  
  const navigate = useNavigate();

  // Clear localStorage on component mount to ensure clean state
  useEffect(() => {
    localStorage.clear();
  }, []);

  // Handle redirection after successful login
 // Handle redirection after successful login
// Handle redirection after successful login
// Handle redirection after successful login
const handlePostLoginRedirection = async () => {
  try {
    setIsLoading(true);
    // Get the user's role and ID from localStorage
    const userDetails = JSON.parse(localStorage.getItem('personaldetails') || '{}');
    const roleId = parseInt(localStorage.getItem('role_id'));
    const teacherId = parseInt(localStorage.getItem('teacher_id'));
    
    // If user is a teacher (role_id = 1) and we have a teacher_id
    if (roleId === 1 && teacherId) {
      try {
        // Fetch teacher details from API using axios
        const teacherResponse = await api.get(`/api/v1/teachers/${teacherId}`);
        
        // Fetch teacher schedules separately
        const schedulesResponse = await api.get(`/api/v1/teachers/${teacherId}/teacher_schedules`);
        
        if (teacherResponse.data.status === 'success' && teacherResponse.data.data) {
          const teacherData = teacherResponse.data.data;
          
          // Save teacher data to localStorage for future use
          localStorage.setItem('teacherData', JSON.stringify(teacherData));
          
          // Determine redirect path based on completion status
          if (teacherData.teacher_educational_qualification === null) {
            navigate('/details2');
          } else if (teacherData.teacher_preference === null) {
            navigate('/teacherSubject');
          } else if (schedulesResponse.data.status === 'success' && 
                    (schedulesResponse.data.data === null || 
                     schedulesResponse.data.data.length === 0)) {
            // If schedules API returns empty array, redirect to slots page
            navigate('/slots');
          } else {
            navigate('/dashboard');
          }
        } else {
          // If API returns success but no data, redirect to /details as fallback
          navigate('/details');
        }
      } catch (error) {
        console.error('Error fetching teacher details:', error);
        // If API call fails, redirect to /details as fallback
        navigate('/details');
      }
    } else {
      // For non-teachers or if teacher_id is missing, use the existing redirect logic
      await authService.handleRoleBasedRedirection(navigate, setIsLoading, setErrors);
    }
  } catch (error) {
    console.error('Error during redirection:', error);
    setServerError('Login successful but failed to get user information. Please try again.');
    setIsLoading(false);
  } finally {
    setIsLoading(false);
  }
};

  const validateLogin = () => {
    const newErrors = {};
    
    if (!formData.emailOrPhone) {
      newErrors.emailOrPhone = 'This field is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    
    // Email/Phone validation
    if (!formData.emailOrPhone) {
      newErrors.emailOrPhone = 'Email or phone is required';
    } else if (formData.emailOrPhone.includes('@') && !/\S+@\S+\.\S+/.test(formData.emailOrPhone)) {
      newErrors.emailOrPhone = 'Please enter a valid email address';
    } else if (!formData.emailOrPhone.includes('@') && !/^\d{10}$/.test(formData.emailOrPhone)) {
      newErrors.emailOrPhone = 'Please enter a valid 10-digit phone number';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    // Clear server errors when user starts typing
    if (serverError) setServerError('');
    if (serverSuccess) setServerSuccess('');
  };

  const handleClear = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Updated handleLoginSubmit function to store the full response
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (validateLogin()) {
      try {
        setIsLoading(true);
        setServerError(''); // Clear any previous errors
        
        // Create credentials object based on input type
        const credentials = { email: formData.emailOrPhone, password: formData.password }
        
        console.log('Sending login credentials:', credentials);
        
        // Use the authService to handle login
        const response = await authService.signIn(credentials);
        console.log('Login successful:', response);

        if(response.data.profile === null){
          navigate('/details');
        }
        
        // The authService has already stored auth data in localStorage
        
        // After successful login, let the post-login redirect function handle redirection
        await handlePostLoginRedirection();
        
      } catch (error) {
        console.error('Login error:', error);
        
        // Handle different types of errors
        if (error.response) {
          console.log('Error response data:', error.response.data);
          
          if (error.response.data && error.response.data.message) {
            setServerError(error.response.data.message);
          } else if (error.response.status === 401) {
            setServerError('Invalid email/phone or password. Please try again.');
          } else {
            setServerError(`Authentication failed (${error.response.status}). Please try again.`);
          }
        } else if (error.request) {
          setServerError('No response from server. Please try again later.');
        } else {
          setServerError(error.message || 'Login failed. Please try again.');
        }
        
        setIsLoading(false);
      }
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (validateSignup()) {
      try {
        setIsLoading(true);
        setServerError(''); // Clear any previous errors
        
        // Determine if email or phone was provided
        const isEmail = formData.emailOrPhone.includes('@');
        
        const userData = {
          password: formData.password,
          user_role_id: parseInt(formData.user_role_id, 10)
        };
        
        // Add either email or phone based on input
        if (isEmail) {
          userData.email = formData.emailOrPhone;
        } else {
          userData.phone = formData.emailOrPhone;
        }
        
        console.log('Sending registration data:', userData);
        
        // Use the authService for signup
        const response = await authService.signUp(userData);
        console.log('Signup successful:', response.data);
        
        // After successful signup, switch to login mode
        setAuthMode('login');
        
        // Clear form but keep the email/phone for convenience
        const emailOrPhone = formData.emailOrPhone;
        setFormData({
          emailOrPhone: emailOrPhone,
          password: '',
          agreeToTerms: false,
          user_role_id: 1
        });
        
        // Show success message
        setServerSuccess('Registration successful! Please log in with your credentials.');
        
        setIsLoading(false);
        
      } catch (error) {
        console.error('Signup error:', error);
        
        // Enhanced error handling
        if (error.response) {
          console.log('Error response data:', error.response.data);
          
          // Check for the specific error format mentioned
          if (error.response.data && error.response.data.error_description) {
            setServerError(error.response.data.error_description);
          } else if (error.response.data && error.response.data.error === "user_not_created" && 
                    error.response.data.error_description === "Email has already been taken") {
            setServerError('Email has already been taken');
          } else if (error.response.data && error.response.data.message) {
            setServerError(error.response.data.message);
          } else if (error.response.data && error.response.data.errors) {
            // Format API validation errors
            const apiErrors = {};
            
            // Handle nested errors or array errors
            const processErrors = (errors, prefix = '') => {
              Object.entries(errors).forEach(([key, value]) => {
                const fieldKey = prefix ? `${prefix}.${key}` : key;
                
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                  // Handle nested objects
                  processErrors(value, fieldKey);
                } else {
                  // Handle arrays or direct values
                  const errorMsg = Array.isArray(value) ? value[0] : value;
                  
                  // Map API field names to form field names
                  let formField = key;
                  if (key === 'email' || key === 'phone') {
                    formField = 'emailOrPhone';
                  }
                  
                  apiErrors[formField] = errorMsg;
                }
              });
            };
            
            processErrors(error.response.data.errors);
            
            // If no specific field errors were mapped, show a general error
            if (Object.keys(apiErrors).length === 0) {
              setServerError('Validation failed. Please check your information.');
            } else {
              setErrors(apiErrors);
            }
          } else {
            setServerError(`Registration failed (${error.response.status}). Please try again.`);
          }
        } else if (error.request) {
          setServerError('No response from server. Please try again later.');
        } else {
          setServerError(error.message || 'An error occurred. Please try again.');
        }
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      handleLoginSubmit(e);
    } else {
      handleSignupSubmit(e);
    }
  };

  const toggleAuthMode = () => {
    // Clear localStorage when switching modes to prevent conflicts
    localStorage.clear();
    setAuthMode(prevMode => prevMode === 'login' ? 'signup' : 'login');
    setErrors({});
    setServerError('');
    setServerSuccess('');
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden text-black"
      style={{
        backgroundImage: "url('/assets/bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="fixed top-4 sm:top-6 left-4 sm:left-6 flex items-center text-white z-10">
        <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="text-lg sm:text-xl font-bold">Star Educators</span>
      </div>

      <div className="h-screen w-full flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-4 sm:px-6">
          {/* Left side */}
          <div className="w-full lg:w-1/2 text-white text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight sm:leading-snug">
              Helping students achieve the education they deserve
            </h1>
          </div>

          {/* Right side */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg w-full max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">
                {authMode === 'login' ? 'Welcome to Star Educators' : 'Create your account'}
              </h2>
              <p className="text-gray-600 mb-6">
                {authMode === 'login' ? 'Log in to your account' : 'Join Star Educators to connect with teachers and students'}
              </p>
              
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {serverError}
                </div>
              )}
              
              {serverSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  {serverSuccess}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email/Phone Input */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      name="emailOrPhone"
                      placeholder="Enter Email Id"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                        ${errors.emailOrPhone ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 focus:border-indigo-500'}
                        bg-white text-black placeholder-gray-500`}
                      value={formData.emailOrPhone}
                      onChange={handleInputChange}
                      autoComplete="username"
                    />
                    {formData.emailOrPhone && (
                      <button
                        type="button"
                        onClick={() => handleClear('emailOrPhone')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg 
                          className="w-4 h-4 text-gray-500" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {errors.emailOrPhone && (
                    <p className="text-red-500 text-sm">{errors.emailOrPhone}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter password"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                        ${errors.password ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 focus:border-indigo-500'}
                        bg-white text-black placeholder-gray-500`}
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    />
                    {formData.password && (
                      <button
                        type="button"
                        onClick={() => handleClear('password')}
                        className="absolute right-10 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg 
                          className="w-4 h-4 text-gray-500" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                    >
                      {showPassword ? (
                        <svg 
                          className="w-4 h-4 text-gray-500" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg 
                          className="w-4 h-4 text-gray-500" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm">{errors.password}</p>
                  )}
                </div>

                {/* Additional signup fields */}
                {authMode === 'signup' && (
                  <>
                    {/* Role selection dropdown */}
                    <div className="space-y-1">
                      <div className="relative">
                        <label htmlFor="user_role_id" className="text-gray-700 mb-5">Select account type</label>
                        <select
                          name="user_role_id"
                          value={formData.user_role_id}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                            focus:ring-indigo-200 focus:border-indigo-500 bg-white text-black"
                        >
                          <option value="1">Teacher</option>
                          <option value="2" disabled>Student</option>
                          <option value="3" disabled>Job Seeker</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-start mt-2">
                      <div className="flex items-center h-5">
                        <input
                          id="agreeToTerms"
                          name="agreeToTerms"
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="agreeToTerms" className="text-gray-700">
                          I agree to the <a href="/terms" className="text-indigo-600 hover:text-indigo-800">Terms and Conditions</a>
                        </label>
                        {errors.agreeToTerms && (
                          <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}


                <button
                  type="submit"
                  className={`w-full bg-indigo-800 text-white py-3 rounded-md ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-indigo-700'
                  } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 
                  focus:ring-offset-2 text-sm sm:text-base flex items-center justify-center`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    authMode === 'login' ? 'Log in' : 'Sign up'
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-600">
                    {authMode === 'login' 
                      ? <>Don't have an account? <button type="button" onClick={toggleAuthMode} className="text-indigo-600 hover:text-indigo-800">Sign up</button></>
                      : <>Already have an account? <button type="button" onClick={toggleAuthMode} className="text-indigo-600 hover:text-indigo-800">Log in</button></>
                    }
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedAuthForm;