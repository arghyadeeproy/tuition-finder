import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../services/teacherService';

// Helper function to ensure userId is stored persistently
function ensureUserIdPersistence() {
  let userId = localStorage.getItem('user_id');
  if (userId) {
    return userId;
  }

  const userData = localStorage.getItem('user_data');
  if (userData) {
    try {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData && parsedUserData.id) {
        userId = parsedUserData.id;
        localStorage.setItem('user_id', userId);
        console.log('Saved user_id to localStorage from user_data:', userId);
        return userId;
      }
    } catch (e) {
      console.error('Error parsing user_data:', e);
    }
  }

  userId = sessionStorage.getItem('user_id');
  if (userId) {
    localStorage.setItem('user_id', userId);
    console.log('Saved user_id to localStorage from sessionStorage:', userId);
    return userId;
  }

  const authToken = localStorage.getItem('auth_token');
  if (authToken) {
    try {
      const base64Url = authToken.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        if (payload && payload.user_id) {
          userId = payload.user_id;
          localStorage.setItem('user_id', userId);
          console.log('Saved user_id to localStorage from auth token:', userId);
          return userId;
        }
      }
    } catch (e) {
      console.error('Error decoding auth token:', e);
    }
  }

  console.warn('Could not find user_id in any storage location');
  return null;
}

const PersonalDetailsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    whatsappNumber: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    latitude: '',
    longitude: '',
    aadharPhoto: null,
    profilePhoto: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiErrorDetails, setApiErrorDetails] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [useSameMobile, setUseSameMobile] = useState(false);
  const [aadharPreview, setAadharPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [fileSizeError, setFileSizeError] = useState({
    aadharPhoto: '',
    profilePhoto: ''
  });
  const [showPreview, setShowPreview] = useState({ aadhar: false, profile: false });

  const fetchCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
          console.log(`Location obtained: ${latitude}, ${longitude}`);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setErrors(prev => ({
            ...prev,
            location: `Error getting location: ${error.message}`
          }));
          setIsGettingLocation(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setErrors(prev => ({
        ...prev,
        location: 'Geolocation is not supported by this browser'
      }));
      setIsGettingLocation(false);
    }
  };

  useEffect(() => {
    // Immediately fetch location when component mounts
    fetchCurrentLocation();
    
    const userId = ensureUserIdPersistence();
    if (userId) {
      console.log('User ID confirmed in localStorage:', userId);
    } else {
      console.warn('No user ID could be found or extracted');
    }

    const savedData = localStorage.getItem('personaldetails');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Don't include file objects from localStorage as they can't be properly serialized
        const cleanedData = { ...parsedData };
        delete cleanedData.aadharPhoto;
        delete cleanedData.profilePhoto;
        setFormData(cleanedData);
      } catch (e) {
        console.error('Error parsing saved personal details:', e);
      }
    }

    const checkUserAuth = () => {
      const userId = localStorage.getItem('user_id');
      const authToken = localStorage.getItem('auth_token');
      console.log('Auth Check:', {
        userId: userId,
        hasAuthToken: !!authToken
      });
      if (!userId && !authToken) {
        console.warn('No user_id or auth_token found. User might not be logged in.');
        console.log('Redirecting to login page...');
        navigate('/');
      }
    };

    checkUserAuth();
  }, [navigate]);

  const handleSameMobileCheckbox = (e) => {
    const isChecked = e.target.checked;
    setUseSameMobile(isChecked);
    if (isChecked) {
      setFormData(prev => ({
        ...prev,
        whatsappNumber: prev.mobileNumber
      }));
      // Clear WhatsApp validation error if using same as mobile
      if (errors.whatsappNumber) {
        setErrors(prev => ({ ...prev, whatsappNumber: '' }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        whatsappNumber: ''
      }));
    }
  };

  // Enhanced validation function with detailed checks
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters long';
    }

    // Email validation with more comprehensive regex
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile number validation - must be exactly 10 digits
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
    }

    // WhatsApp number validation - must be exactly 10 digits if provided
    if (!useSameMobile && !formData.whatsappNumber) {
      newErrors.whatsappNumber = 'WhatsApp number is required';
    } else if (!useSameMobile && !/^\d{10}$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = 'WhatsApp number must be exactly 10 digits';
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      
      // Check age (must be at least 18)
      if (age < 10) {
        newErrors.dateOfBirth = 'You must be at least 10 years old';
      } else if (formData.dateOfBirth > today.toISOString().split('T')[0]) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    // Address validation
    if (!formData.address || formData.address.trim() === '') {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 10) {
      newErrors.address = 'Please provide a complete address (minimum 10 characters)';
    }

    // Latitude validation - between -90 and 90 with up to 8 decimal places
    if (formData.latitude && !isLatitudeValid(formData.latitude)) {
      newErrors.latitude = 'Invalid latitude format (must be between -90 and 90)';
    }
    
    // Longitude validation - between -180 and 180 with up to 8 decimal places
    if (formData.longitude && !isLongitudeValid(formData.longitude)) {
      newErrors.longitude = 'Invalid longitude format (must be between -180 and 180)';
    }

    // File validation
    if (!formData.aadharPhoto) {
      newErrors.aadharPhoto = 'Aadhar card photo is required';
    }
    
    if (!formData.profilePhoto) {
      newErrors.profilePhoto = 'Profile photo is required';
    }

    // Include file size errors if they exist
    if (fileSizeError.aadharPhoto) {
      newErrors.aadharPhoto = fileSizeError.aadharPhoto;
    }
    
    if (fileSizeError.profilePhoto) {
      newErrors.profilePhoto = fileSizeError.profilePhoto;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper functions for latitude/longitude validation
  const isLatitudeValid = (lat) => {
    // Check if latitude is a valid number between -90 and 90 with up to 8 decimal places
    const latRegex = /^-?([0-8]?[0-9](\.\d{1,8})?|90(\.0{1,8})?)$/;
    return latRegex.test(lat);
  };

  const isLongitudeValid = (lng) => {
    // Check if longitude is a valid number between -180 and 180 with up to 8 decimal places
    const lngRegex = /^-?((1[0-7][0-9]|[0-9]{1,2})(\.\d{1,8})?|180(\.0{1,8})?)$/;
    return lngRegex.test(lng);
  };

  const validateFileType = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return validTypes.includes(file.type);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      if (files && files.length > 0) {
        const file = files[0];
        
        // Validate file type
        if (!validateFileType(file)) {
          setFileSizeError(prev => ({
            ...prev,
            [name]: 'Only JPG, JPEG, or PNG files are allowed'
          }));
          return;
        }
        
        // Validate file size (500KB max)
        if (file.size > 512000) { // 500 KB = 512000 bytes
          setFileSizeError(prev => ({
            ...prev,
            [name]: 'File size must be less than 500KB'
          }));
          return;
        } else {
          setFileSizeError(prev => ({
            ...prev,
            [name]: ''
          }));
        }
        
        // Create and set preview URL
        const previewUrl = URL.createObjectURL(file);
        
        if (name === 'aadharPhoto') {
          setAadharPreview(previewUrl);
        } else if (name === 'profilePhoto') {
          setProfilePreview(previewUrl);
        }
        
        setFormData(prev => ({
          ...prev,
          [name]: file
        }));

        // Clear any existing error for this field
        if (errors[name]) {
          setErrors(prev => ({
            ...prev,
            [name]: ''
          }));
        }
      }
    } else if (name === 'latitude') {
      // Validate latitude as user types
      const isValid = isLatitudeValid(value) || value === '';
      if (!isValid && value !== '') {
        setErrors(prev => ({
          ...prev,
          latitude: 'Invalid latitude format (must be between -90 and 90)'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          latitude: ''
        }));
      }
      setFormData(prev => ({
        ...prev,
        latitude: value
      }));
    } else if (name === 'longitude') {
      // Validate longitude as user types
      const isValid = isLongitudeValid(value) || value === '';
      if (!isValid && value !== '') {
        setErrors(prev => ({
          ...prev,
          longitude: 'Invalid longitude format (must be between -180 and 180)'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          longitude: ''
        }));
      }
      setFormData(prev => ({
        ...prev,
        longitude: value
      }));
    } else if (name === 'mobileNumber') {
      // Allow only digits in mobile number field
      const onlyDigits = value.replace(/[^\d]/g, '');
      
      // Limit to 10 digits
      const limitedDigits = onlyDigits.slice(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: limitedDigits
      }));
      
      // Update WhatsApp number if "same as mobile" is checked
      if (useSameMobile) {
        setFormData(prev => ({
          ...prev,
          whatsappNumber: limitedDigits
        }));
      }
      
      // Clear any existing error for this field
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    } else if (name === 'whatsappNumber') {
      // Allow only digits in WhatsApp number field
      const onlyDigits = value.replace(/[^\d]/g, '');
      
      // Limit to 10 digits
      const limitedDigits = onlyDigits.slice(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: limitedDigits
      }));
      
      // Clear any existing error for this field
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear any existing error for this field
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const handleNext = async () => {
    if (validateForm()) {
      const userId = ensureUserIdPersistence();
      
      if (!userId) {
        setApiError('User not logged in. Please log in to continue.');
        console.log('No user ID found. Redirecting to login page...');
        navigate('/'); 
        return;
      }
      
      // Store form data without file objects
      const formDataToStore = { ...formData };
      delete formDataToStore.aadharPhoto;
      delete formDataToStore.profilePhoto;
      localStorage.setItem('personaldetails', JSON.stringify(formDataToStore));
      
      try {
        setIsSubmitting(true);
        setApiError(null);
        setApiErrorDetails(null);
        
        // Check if we already have a teacher_id in localStorage
        const existingTeacherId = localStorage.getItem('teacher_id');
        let response;
        
        if (existingTeacherId) {
          // Update existing teacher
          console.log('Updating existing teacher with ID:', existingTeacherId);
          response = await teacherService.patchTeacher(existingTeacherId, formData);
        } else {
          // Create new teacher
          console.log('Creating new teacher with user_id:', userId);
          response = await teacherService.createTeacher(formData);
        }
        
        console.log('API response:', response);
        
        // Handle the response and save teacher_id consistently
        if (response.data && response.data.data && response.data.data.id) {
          localStorage.setItem('teacher_id', response.data.data.id);
          console.log('Saved teacher_id to localStorage:', response.data.data.id);
        } else if (response.data && response.data.id) {
          localStorage.setItem('teacher_id', response.data.id);
          console.log('Saved teacher_id to localStorage:', response.data.id);
        } else if (existingTeacherId) {
          // If we're updating and don't get a clear ID back, keep using the existing one
          console.log('Keeping existing teacher_id:', existingTeacherId);
        }
        
        navigate('/details2');
      } catch (error) {
        console.error('Error submitting form:', error);
        
        let errorMessage = 'Failed to save your information. Please try again.';
        
        if (error.response) {
          console.log('API Error Response:', error.response.data);
          
          if (error.response.data?.error_description) {
            errorMessage = error.response.data.error_description;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === 'string') {
            try {
              const parsedError = JSON.parse(error.response.data);
              errorMessage = parsedError.error_description || parsedError.message || errorMessage;
            } catch (e) {
              if (error.response.data.includes('error') || error.response.data.includes('fail')) {
                errorMessage = error.response.data;
              }
            }
          }
          
          if (error.response.data?.errors) {
            setApiErrorDetails(error.response.data.errors);
          }
        }
        
        setApiError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handlePreview = (type) => {
    setShowPreview(prev => ({ ...prev, [type]: true }));
  };

  const handleDelete = (type) => {
    // Reset the file input value
    if (type === 'aadharPhoto') {
      // Reset file input by setting it to null
      setFormData(prev => ({ ...prev, aadharPhoto: null }));
      setAadharPreview(null);
      // Reset any file input element
      const fileInput = document.getElementById('aadhar-input');
      if (fileInput) fileInput.value = '';
    } else if (type === 'profilePhoto') {
      setFormData(prev => ({ ...prev, profilePhoto: null }));
      setProfilePreview(null);
      // Reset any file input element
      const fileInput = document.getElementById('profile-input');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleRefreshLocation = () => {
    fetchCurrentLocation();
  };

  return (
    <div className="min-h-screen w-screen bg-indigo-100 flex flex-col">
      <header className="bg-[#4527a0] text-black p-4 flex items-center fixed top-0 left-0 right-0 z-10" style={{height: '100px' }}>
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
      
      <div className="flex-grow flex justify-center" style={{ marginTop: '550px', paddingBottom: '10px', overflow: 'auto' }}>
        <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md my-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-black">Personal Details</h1>
          
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{apiError}</span>
              
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
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                    ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                    ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Mobile Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                    ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.mobileNumber && <p className="mt-1 text-sm text-red-500">{errors.mobileNumber}</p>}
                <p className="mt-1 text-xs text-gray-500">Enter 10-digit number without country code</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">WhatsApp Number <span className="text-red-500">*</span></label>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="sameMobileCheckbox"
                    checked={useSameMobile}
                    onChange={handleSameMobileCheckbox}
                    className="mr-2"
                  />
                  <label htmlFor="sameMobileCheckbox" className="text-sm text-black">
                    Same as mobile number
                  </label>
                </div>
                <input
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit WhatsApp number"
                  maxLength={10}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                    ${errors.whatsappNumber ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={useSameMobile}
                />
                {errors.whatsappNumber && <p className="mt-1 text-sm text-red-500">{errors.whatsappNumber}</p>}
                <p className="mt-1 text-xs text-gray-500">Enter 10-digit number without country code</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Gender <span className="text-red-500">*</span></label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                    ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
              </div><div>
  <label className="block text-sm font-medium text-black">Date of Birth <span className="text-red-500">*</span></label>
  <div 
    className="relative"
    onClick={(e) => {
      // Find the date input in this container and focus/click it
      const dateInput = e.currentTarget.querySelector('input[type="date"]');
      if (dateInput) {
        dateInput.focus();
        dateInput.showPicker && dateInput.showPicker(); // Modern browsers support showPicker()
      }
    }}
  >
    <input
      type="date"
      name="dateOfBirth"
      value={formData.dateOfBirth}
      onChange={handleInputChange}
      className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
        ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
      max={new Date().toISOString().split('T')[0]} // Prevent future dates
    />
  </div>
  {errors.dateOfBirth && <p className="mt-1 text-sm text-red-500">{errors.dateOfBirth}</p>}
  <p className="mt-1 text-xs text-gray-500">You must be at least 10 years old</p>
</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Address <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your complete address"
                className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                  ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Aadhar Card <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="file"
                  name="aadharPhoto"
                  onChange={handleInputChange}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  id="aadhar-input"
                />
                <label
                  htmlFor="aadhar-input" 
                  className={`mt-1 flex items-center w-full px-3 py-2 border rounded-md cursor-pointer text-black
                    ${errors.aadharPhoto ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-black">
                    {formData.aadharPhoto ? formData.aadharPhoto.name : 'Click to upload Aadhar Card'}
                  </span>
                </label>
              </div>
              {errors.aadharPhoto && <p className="mt-1 text-sm text-red-500">{errors.aadharPhoto}</p>}
              <p className="mt-1 text-xs text-gray-500">Upload scanned copy of your Aadhar Card (JPG, JPEG, PNG only, max 500KB)</p>
              
              <div className="mt-2 flex space-x-2">
                {aadharPreview && (
                  <>
                    <button
                      className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                      onClick={() => handlePreview('aadhar')}
                      type="button"
                    >
                      Preview
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      onClick={() => handleDelete('aadharPhoto')}
                      type="button"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            <div>
            <label className="block text-sm font-medium text-black">Profile Photo <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="file"
                  name="profilePhoto"
                  onChange={handleInputChange}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                  id="profile-input"
                />
                <label
                  htmlFor="profile-input" 
                  className={`mt-1 flex items-center w-full px-3 py-2 border rounded-md cursor-pointer text-black
                    ${errors.profilePhoto ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="text-black">
                    {formData.profilePhoto ? formData.profilePhoto.name : 'Click to upload Profile Photo'}
                  </span>
                </label>
              </div>
              {errors.profilePhoto && <p className="mt-1 text-sm text-red-500">{errors.profilePhoto}</p>}
              <p className="mt-1 text-xs text-gray-500">Upload your Profile Photo (JPG, JPEG, PNG only, max 500KB)</p>
              
              <div className="mt-2 flex space-x-2">
                {profilePreview && (
                  <>
                    <button
                      className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                      onClick={() => handlePreview('profile')}
                      type="button"
                    >
                      Preview
                    </button>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      onClick={() => handleDelete('profilePhoto')}
                      type="button"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black">Latitude</label>
                <div className="flex">
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="Enter latitude"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                      ${errors.latitude ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.latitude && <p className="mt-1 text-sm text-red-500">{errors.latitude}</p>}
                <p className="mt-1 text-xs text-gray-500">Must be between -90 and 90 (e.g., 28.6139)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">Longitude</label>
                <div className="flex">
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="Enter longitude"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                      ${errors.longitude ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                {errors.longitude && <p className="mt-1 text-sm text-red-500">{errors.longitude}</p>}
                <p className="mt-1 text-xs text-gray-500">Must be between -180 and 180 (e.g., 77.2090)</p>
              </div>
            </div>
            
            {errors.location && <p className="mt-1 text-sm text-red-500 text-center">{errors.location}</p>}
            
            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-black"
                onClick={() => navigate('/')}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="button"
                className={`px-6 py-2 ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600'} text-white rounded-md hover:bg-indigo-700`}
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPreview.aadhar && aadharPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-md max-w-lg">
            <h3 className="text-lg font-medium mb-2 text-black">Aadhar Card Preview</h3>
            <img src={aadharPreview} alt="Aadhar Preview" className="max-h-96 max-w-full" />
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => setShowPreview(prev => ({ ...prev, aadhar: false }))}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview.profile && profilePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-md max-w-lg">
            <h3 className="text-lg font-medium mb-2 text-black">Profile Photo Preview</h3>
            <img src={profilePreview} alt="Profile Preview" className="max-h-96 max-w-full" />
            <div className="flex justify-end mt-4">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => setShowPreview(prev => ({ ...prev, profile: false }))}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalDetailsForm;