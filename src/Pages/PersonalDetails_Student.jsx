import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';

const PersonalDetailsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    guardianNumber: '', // Changed from alternateNumber to guardianNumber
    gender: '',
    dateOfBirth: '',
    maritalStatus: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiErrorDetails, setApiErrorDetails] = useState(null);

  // Load saved data on component mount with improved user auth checking
  useEffect(() => {
    const savedData = localStorage.getItem('personaldetails');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    
    // Check if user is logged in with enhanced checks
    const checkUserAuth = () => {
      const userId = localStorage.getItem('user_id');
      const authToken = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('Auth Check:', {
        userId: userId,
        hasAuthToken: !!authToken,
        hasUserData: !!userData
      });
      
      if (!userId) {
        // Try to extract user ID from user_data if available
        if (userData) {
          try {
            const parsedUserData = JSON.parse(userData);
            if (parsedUserData && parsedUserData.id) {
              console.log('Found user ID in user_data:', parsedUserData.id);
              localStorage.setItem('user_id', parsedUserData.id);
              return;
            }
          } catch (e) {
            console.error('Error parsing user_data:', e);
          }
        }
        
        console.warn('No user_id found in localStorage. User might not be logged in.');
        if (!authToken) {
          // If no auth token either, redirect to login
          console.log('No auth token found. Redirecting to login page...');
          navigate('/');
        }
      } else {
        console.log('User ID found in localStorage:', userId);
      }
    };
    
    checkUserAuth();
  }, [navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Invalid mobile number (10 digits required)';
    }

    if (formData.guardianNumber && !/^\d{10}$/.test(formData.guardianNumber)) {
      newErrors.guardianNumber = 'Invalid guardian number (10 digits required)';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!formData.maritalStatus) {
      newErrors.maritalStatus = 'Please select marital status';
    }

    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNext = async () => {
    if (validateForm()) {
      // Enhanced check for user authentication
      // Check if user is logged in
      const userId = localStorage.getItem('user_id');
      const userData = localStorage.getItem('user_data');
      
      if (!userId && userData) {
        // Try to extract user ID from user_data
        try {
          const parsedUserData = JSON.parse(userData);
          if (parsedUserData && parsedUserData.id) {
            localStorage.setItem('user_id', parsedUserData.id);
          }
        } catch (e) {
          console.error('Error parsing user_data:', e);
        }
      }
      
      // Check again after potential extraction
      const finalUserId = localStorage.getItem('user_id');
      if (!finalUserId) {
        setApiError('User not logged in. Please log in to continue.');
        console.log('No user ID found. Redirecting to login page...');
        navigate('/'); // Redirect to login
        return;
      }
      
      // Save to localStorage for form persistence
      localStorage.setItem('personaldetails', JSON.stringify(formData));
      
      try {
        setIsSubmitting(true);
        setApiError(null);
        setApiErrorDetails(null);
        
        console.log('Submitting form with user_id:', finalUserId);
        
        // Convert alternateNumber to student service's expected format
        const studentData = {
          ...formData,
          alternateNumber: formData.guardianNumber // Map guardianNumber to alternateNumber for API
        };
        
        // Submit to API
        const response = await studentService.createStudent(studentData);
        console.log('API response:', response);
        
        // If successful, store the student ID for future reference
        if (response.data && response.data.data && response.data.data.id) {
          localStorage.setItem('student_id', response.data.data.id);
          console.log('Saved student_id to localStorage:', response.data.data.id);
        } else if (response.data && response.data.id) {
          localStorage.setItem('student_id', response.data.id);
          console.log('Saved student_id to localStorage:', response.data.id);
        }
        
        // Navigate to next step
        navigate('/studentdetails2');
      } catch (error) {
        console.error('Error submitting form:', error);
        
        let errorMessage = 'Failed to save your information. Please try again.';
        
        // Check for specific error details from the API
        if (error.response) {
          console.log('API Error Response:', error.response.data);
          errorMessage = error.response.data?.message || errorMessage;
          
          // If there are validation errors, display them
          if (error.response.data?.errors) {
            setApiErrorDetails(error.response.data.errors);
          }
        }
        
        setApiError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-screen bg-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-[#4527a0] text-white p-4 flex items-center" style={{height: '201px' }}>
        <img 
          src="/assets/LOGO (2).png" 
          alt="Star Educators Logo"
          style={{
            height: '78.24px',
            width: '169.89px',
            position: 'relative',
            left: '69px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        />
      </header>
      {/* Form */}
      <div className="flex-grow flex justify-center items-center">
        <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center mb-8">Personal Details</h1>
          
          {/* API Error Messages */}
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{apiError}</span>
              
              {/* Error Details */}
              {apiErrorDetails && (
                <ul className="list-disc pl-5 mt-2">
                  {Object.entries(apiErrorDetails).map(([field, errors]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {Array.isArray(errors) ? errors.join(', ') : errors}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {/* Form Fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.mobileNumber && <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Guardian Number </label>
                <input
                  type="tel"
                  name="guardianNumber"
                  value={formData.guardianNumber}
                  onChange={handleInputChange}
                  placeholder="Enter guardian number"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.guardianNumber ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.guardianNumber && <p className="mt-1 text-sm text-red-500">{errors.guardianNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Gender <span className="text-red-500">*</span></label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Choose</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Date of Birth <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Marital Status <span className="text-red-500">*</span></label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.maritalStatus ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Choose</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
                {errors.maritalStatus && <p className="mt-1 text-sm text-red-500">{errors.maritalStatus}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Address <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                  ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => navigate('/role')}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                className={`px-6 py-2 ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600'} text-white rounded-md hover:bg-indigo-700`}
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;