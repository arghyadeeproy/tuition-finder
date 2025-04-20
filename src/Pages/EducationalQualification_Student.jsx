import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentEducationalQualificationService } from '../services/studentEducationalQualificationService';

const PersonalDetailsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    educationType: 'School',
    schoolName: '',
    classStandard: '',
    collegeName: '',
    universityName: '',
    workingProfessional: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.educationType) {
      newErrors.educationType = 'Please select your education type';
    }
    
    if (formData.educationType === 'School' && !formData.schoolName) {
      newErrors.schoolName = 'School name is required';
    }
    
    if (formData.educationType === 'School' && !formData.classStandard) {
      newErrors.classStandard = 'Class/Standard is required';
    }

    if (formData.educationType === 'College' && !formData.collegeName) {
      newErrors.collegeName = 'College name is required';
    }
    
    if (formData.educationType === 'University' && !formData.universityName) {
      newErrors.universityName = 'University name is required';
    }
    
    if (formData.educationType === 'Working' && !formData.workingProfessional) {
      newErrors.workingProfessional = 'Professional information is required';
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
      setIsSubmitting(true);
      
      try {
        // Get student ID from localStorage
        const studentId = localStorage.getItem('student_id') || localStorage.getItem('user_id');
        
        if (!studentId) {
          console.error("Student ID not found in localStorage");
          setErrors({
            general: "Student ID not found. Please complete personal details first."
          });
          setIsSubmitting(false);
          return;
        }
        
        // Format the education data using the service helper method
        const educationData = studentEducationalQualificationService.formatStudentEducationData(formData);
        
        // Submit the qualification
        await studentEducationalQualificationService.createStudentQualification(
          studentId,
          educationData
        );
        
        // Navigate to the next page
        navigate('/subject');
      } catch (error) {
        console.error('Error submitting educational qualification:', error);
        setErrors({
          general: "Error submitting educational qualification. Please try again."
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-screen bg-indigo-100 flex flex-col overflow-x-hidden">
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
      <div className="flex-grow flex justify-center items-center p-4 w-full">
        <div className="w-full max-w-4xl bg-white p-6 md:p-8 rounded-lg shadow-md mx-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">Education</h1>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Form Fields based on the mockup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* I am in dropdown */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">I am in <span className="text-red-500">*</span></label>
              <select
                name="educationType"
                value={formData.educationType}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 text-base md:text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                  ${errors.educationType ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="University">University</option>
                <option value="Working">Working Professional</option>
              </select>
              {errors.educationType && <p className="mt-1 text-sm text-red-500">{errors.educationType}</p>}
            </div>

            {/* School Name */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                School Name 
                {formData.educationType === 'School' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleInputChange}
                placeholder="Input"
                className={`mt-1 block w-full px-3 py-2 text-base md:text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                  ${errors.schoolName ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.schoolName && <p className="mt-1 text-sm text-red-500">{errors.schoolName}</p>}
            </div>

            {/* Class/Standard */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Class/Standard
                {formData.educationType === 'School' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="classStandard"
                value={formData.classStandard}
                onChange={handleInputChange}
                placeholder="Input"
                className={`mt-1 block w-full px-3 py-2 text-base md:text-sm border rounded-md focus:ring-indigo-500 focus:border-indigo-500 
                  ${errors.classStandard ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.classStandard && <p className="mt-1 text-sm text-red-500">{errors.classStandard}</p>}
            </div>

            {/* College Name */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                College Name
                {formData.educationType === 'College' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleInputChange}
                placeholder="Input"
                className={`mt-1 block w-full px-3 py-2 text-base md:text-sm border 
                  ${errors.collegeName ? 'border-red-500' : 'border-gray-300'} 
                  rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.collegeName && <p className="mt-1 text-sm text-red-500">{errors.collegeName}</p>}
            </div>

            {/* University */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                University
                {formData.educationType === 'University' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="universityName"
                value={formData.universityName}
                onChange={handleInputChange}
                placeholder="Input"
                className={`mt-1 block w-full px-3 py-2 text-base md:text-sm border
                  ${errors.universityName ? 'border-red-500' : 'border-gray-300'}
                  rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.universityName && <p className="mt-1 text-sm text-red-500">{errors.universityName}</p>}
            </div>

            {/* Other (Working professional) */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Other (Working professional)
                {formData.educationType === 'Working' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="workingProfessional"
                value={formData.workingProfessional}
                onChange={handleInputChange}
                placeholder="you are working as?"
                className={`mt-1 block w-full px-3 py-2 text-base md:text-sm border
                  ${errors.workingProfessional ? 'border-red-500' : 'border-gray-300'}
                  rounded-md focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.workingProfessional && <p className="mt-1 text-sm text-red-500">{errors.workingProfessional}</p>}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              className="px-8 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 flex items-center gap-2 text-base"
              onClick={() => navigate('/studentdetails1')}
              disabled={isSubmitting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            <button
              className="px-8 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 text-base"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Continue'}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;