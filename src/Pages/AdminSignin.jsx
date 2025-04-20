import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminAuthForm = () => {
  // Form data for admin login and signup
  const [formData, setFormData] = useState({
    // Login fields
    email: '',
    password: '',
    
    // Additional signup fields
    agreeToTerms: false,
    user_role_id: 4 // Default to admin role (4)
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [message, setMessage] = useState(null);
  
  const navigate = useNavigate();

  // Clear localStorage when component mounts
  useEffect(() => {
    localStorage.clear();
  }, []);

  const validateLogin = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
  };

  const handleClear = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (validateLogin()) {
      try {
        setIsLoading(true);
        
        // Create the API instance for authentication
        const api = axios.create({
          baseURL: 'http://localhost:3001',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        // Send login request to the backend
        const response = await api.post('/admin_users/tokens/sign_in', {
          email: formData.email,
          password: formData.password
        });
        
        console.log('Login response:', response.data);
        
        // Clear any previous auth data
        localStorage.clear();
        
        // Store the received token
        if (response.data?.token) {
          localStorage.setItem('auth_token', response.data.token);
        } else if (response.data?.refresh_token) {
          localStorage.setItem('auth_token', response.data.refresh_token);
        }
        
        // Store user ID
        if (response.data?.resource_owner?.id) {
          localStorage.setItem('user_id', response.data.resource_owner.id.toString());
        }
        
        // Store role ID (admin)
        localStorage.setItem('role_id', '4');
        
        // Navigate to admin dashboard
        navigate('/admin');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Login error:', error);
        
        // Handle different types of errors
        if (error.response && error.response.status === 401) {
          setErrors({
            apiError: 'Invalid credentials. Please check your email and password.'
          });
        } else if (error.response && error.response.data && error.response.data.error) {
          setErrors({
            apiError: error.response.data.error
          });
        } else {
          setErrors({
            apiError: 'An error occurred during login. Please try again.'
          });
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
        
        // Create the API instance for authentication
        const api = axios.create({
          baseURL: 'http://localhost:3001',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        // Prepare the admin registration data
        const adminData = {
          admin_user: {
            email: formData.email,
            password: formData.password
          }
        };
        
        // Send signup request to the backend
        const response = await api.post('/admin_users', adminData);
        
        // Clear any previous auth data
        localStorage.clear();
        
        // Switch to login mode after successful registration
        setAuthMode('login');
        setFormData({
          ...formData,
          password: ''
        });
        
        // Show success message
        setMessage({
          type: 'success',
          text: 'Admin registration successful! Please log in with your credentials.'
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Signup error:', error);
        
        // Handle different types of errors
        if (error.response && error.response.data && error.response.data.errors) {
          // Combine all error messages
          const errorMessages = Object.entries(error.response.data.errors)
            .map(([key, messages]) => `${key}: ${messages.join(', ')}`)
            .join('; ');
            
          setErrors({
            apiError: errorMessages
          });
        } else if (error.response && error.response.data && error.response.data.error) {
          setErrors({
            apiError: error.response.data.error
          });
        } else {
          setErrors({
            apiError: 'Registration failed. Please try again.'
          });
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
    // Clear localStorage when switching modes
    localStorage.clear();
    setAuthMode(prevMode => prevMode === 'login' ? 'signup' : 'login');
    setErrors({});
    setMessage(null);
  };

  return (
    <div 
      className="h-screen w-screen overflow-hidden"
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
              Admin Portal
            </h1>
            <p className="text-xl sm:text-2xl">
              Manage all aspects of the Star Educators platform
            </p>
          </div>

          {/* Right side */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg w-full max-w-md mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                {authMode === 'login' ? 'Admin Access' : 'Create Admin Account'}
              </h2>
              <p className="text-gray-600 mb-6">
                {authMode === 'login' ? 'Log in to access admin dashboard' : 'Create new administrator account'}
              </p>
              
              {errors.apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {errors.apiError}
                </div>
              )}
              
              {message && message.type === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  {message.text}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type="text"
                      name="email"
                      placeholder="Enter Admin Email"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                        ${errors.email ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 focus:border-indigo-500'}`}
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="username"
                    />
                    {formData.email && (
                      <button
                        type="button"
                        onClick={() => handleClear('email')}
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
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter admin password"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                        ${errors.password ? 'border-red-500 focus:ring-red-200' : 'focus:ring-indigo-200 focus:border-indigo-500'}`}
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
                    {/* Role selection dropdown - fixed to admin */}
                    <div className="space-y-1">
                      <div className="relative">
                        <select
                          name="user_role_id"
                          value={formData.user_role_id}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 
                            focus:ring-indigo-200 focus:border-indigo-500"
                          disabled
                        >
                          <option value="4">Administrator</option>
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
                    authMode === 'login' ? 'Admin Login' : 'Register Admin'
                  )}
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-600">
                    {authMode === 'login' 
                      ? <>Need admin access? <button type="button" onClick={toggleAuthMode} className="text-indigo-600 hover:text-indigo-800">Sign up</button></>
                      : <>Already an admin? <button type="button" onClick={toggleAuthMode} className="text-indigo-600 hover:text-indigo-800">Log in</button></>
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

export default AdminAuthForm;