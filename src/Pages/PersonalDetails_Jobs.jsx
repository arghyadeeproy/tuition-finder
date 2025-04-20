import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PersonalDetailsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    alternateNumber: '',
    gender: '',
    dateOfBirth: '',
    maritalStatus: '',
    address: ''
  });
  const [errors, setErrors] = useState({});

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('personaldetails');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const validateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= 18;
  };

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

    if (formData.alternateNumber && !/^\d{10}$/.test(formData.alternateNumber)) {
      newErrors.alternateNumber = 'Invalid alternate number (10 digits required)';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!validateAge(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
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
    
    // Immediate validation for date of birth
    if (name === 'dateOfBirth' && value) {
      if (!validateAge(value)) {
        setErrors(prev => ({
          ...prev,
          dateOfBirth: 'You must be at least 18 years old'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          dateOfBirth: ''
        }));
      }
    } else if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      // Convert form data to JSON and store it
      const jsonData = JSON.stringify(formData);
      localStorage.setItem('personaldetails', jsonData);
      navigate('/jobdetails2');
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
          <h1 className="text-3xl font-bold text-center mb-8">Personal Details </h1>
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
                <label className="block text-sm font-medium text-gray-600">Alternate Number</label>
                <input
                  type="tel"
                  name="alternateNumber"
                  value={formData.alternateNumber}
                  onChange={handleInputChange}
                  placeholder="Enter alternate number"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.alternateNumber ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.alternateNumber && <p className="mt-1 text-sm text-red-500">{errors.alternateNumber}</p>}
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
                <label className="block text-sm font-medium text-gray-600">Date of Birth (Must be 18 or older) <span className="text-red-500">*</span></label>
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
              >
                Back
              </button>
              <button
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;