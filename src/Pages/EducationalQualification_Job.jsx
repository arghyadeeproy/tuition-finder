import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PersonalDetailsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    collegeName: '',
    universityName: '',
    yearofPassing: '',
    EducationalQualification: '',
    cv: null
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.EducationalQualification) {
      newErrors.EducationalQualification = 'Please select your educational qualification';
    }
    
    if (!formData.schoolName) {
      newErrors.schoolName = 'School name is required';
    }
    
    if (!formData.yearofPassing) {
      newErrors.yearofPassing = 'Year of passing is required';
    } else {
      const passYear = new Date(formData.yearofPassing).getFullYear();
      const currentYear = new Date().getFullYear();
      if (passYear > currentYear + 4) {
        newErrors.yearofPassing = 'Year of passing cannot be more than 4 years in the future';
      }
    }
    
    if (!formData.cv) {
      newErrors.cv = 'Please upload your latest resume';
    } else {
      const fileExtension = formData.cv.name.toLowerCase().substring(formData.cv.name.lastIndexOf('.'));
      if (fileExtension !== '.pdf') {
        newErrors.cv = 'Please upload PDF files only';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (files[0]) {
        const fileExtension = files[0].name.toLowerCase().substring(files[0].name.lastIndexOf('.'));
        if (fileExtension !== '.pdf') {
          setErrors(prev => ({
            ...prev,
            cv: 'Please upload PDF files only'
          }));
          // Clear the file input
          e.target.value = '';
          return;
        }
      }
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleNext = () => {
    if (validateForm()) {
      navigate('/joblist');
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
          <h1 className="text-3xl font-bold text-center mb-8">Educational Details</h1>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Choose your Educational Qualification <span className="text-red-500">*</span></label>
                <select
                  name="EducationalQualification"
                  value={formData.EducationalQualification}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.EducationalQualification ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Choose</option>
                  <option value="No formal education">No formal education</option>
                  <option value="Primary education">Primary education</option>
                  <option value="Secondary education or high school">Secondary education or high school</option>
                  <option value="GED">GED</option>
                  <option value="Vocational qualification">Vocational qualification</option>
                  <option value="Bachelor's degree">Bachelor's degree</option>
                  <option value="Master's degree">Master's degree</option>
                  <option value="Doctorate or higher">Doctorate or higher</option>
                </select>
                {errors.EducationalQualification && <p className="mt-1 text-sm text-red-500">{errors.EducationalQualification}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">School Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleInputChange}
                  placeholder="Enter School Name"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.schoolName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.schoolName && <p className="mt-1 text-sm text-red-500">{errors.schoolName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">College Name </label>
                <input
                  type="text"
                  name="collegeName"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  placeholder="Enter College Name"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.collegeName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.collegeName && <p className="mt-1 text-sm text-red-500">{errors.collegeName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">University Name</label>
                <input
                  type="text"
                  name="universityName"
                  value={formData.universityName}
                  onChange={handleInputChange}
                  placeholder="Enter University Name"
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.universityName ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.universityName && <p className="mt-1 text-sm text-red-500">{errors.universityName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Year of Passing <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  name="yearofPassing"
                  value={formData.yearofPassing}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                    ${errors.yearofPassing ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.yearofPassing && <p className="mt-1 text-sm text-red-500">{errors.yearofPassing}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Latest Resume (PDF only) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="file"
                    name="cv"
                    onChange={handleInputChange}
                    accept=".pdf"
                    className="hidden"
                    id="cv-input"
                  />
                  <label
                    htmlFor="cv-input" 
                    className={`mt-1 flex items-center w-full px-3 py-2 border rounded-md cursor-pointer
                      ${errors.cv ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-gray-500">
                      {formData.cv ? formData.cv.name : 'Click to attach PDF file'}
                    </span>
                  </label>
                </div>
                {errors.cv && <p className="mt-1 text-sm text-red-500">{errors.cv}</p>}
              </div>
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                onClick={() => navigate('/jobdetails1')}
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