import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { educationalQualificationService } from '../services/educationalQualificationService';
import { subjectService } from '../services/api';

const PersonalDetailsForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    collegeName: '',
    universityName: '',
    yearofPassing: '',
    EducationalQualification: '',
    subject_id: '',
    certificate: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subjects and degrees on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch subjects
        const subjectsResponse = await subjectService.getSubjects();
        console.log('Subjects response:', subjectsResponse);
        
        // Handle Axios response structure - check if it's wrapped in data property
        if (subjectsResponse && subjectsResponse.data) {
          // Extract the actual API response from Axios wrapper
          const apiResponse = subjectsResponse.data;
          
          // Now check the API response structure
          if (apiResponse.status === "success" && Array.isArray(apiResponse.data)) {
            console.log('Setting subjects from API data:', apiResponse.data);
            setSubjects(apiResponse.data);
          } else {
            console.error('Unexpected subjects API response format:', apiResponse);
            setErrors(prev => ({
              ...prev,
              general: "Error loading subjects. Please refresh and try again."
            }));
          }
        } else {
          console.error('Invalid subjects response:', subjectsResponse);
          setErrors(prev => ({
            ...prev,
            general: "Error loading subjects. Please refresh and try again."
          }));
        }

        // Fetch degrees
        const degreesResponse = await educationalQualificationService.getDegrees();
        console.log('Degrees response:', degreesResponse);
        
        // Handle Axios response structure for degrees
        if (degreesResponse && degreesResponse.data) {
          // Extract the actual API response data
          const apiResponse = degreesResponse.data;
          
          // Check if we have an array of degrees
          if (Array.isArray(apiResponse.data)) {
            console.log('Setting degrees from API data:', apiResponse.data);
            setDegrees(apiResponse.data);
          } else {
            console.error('Unexpected degree API response format:', apiResponse);
            setErrors(prev => ({
              ...prev,
              general: "Error loading degrees. Please refresh and try again."
            }));
          }
        } else {
          console.error('Invalid degrees response:', degreesResponse);
          setErrors(prev => ({
            ...prev,
            general: "Error loading degrees. Please refresh and try again."
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setErrors(prev => ({
          ...prev,
          general: "Error loading data. Please check your connection and try again."
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.EducationalQualification) {
      newErrors.EducationalQualification = 'Please select your educational qualification';
    }
    
    if (!formData.subject_id) {
      newErrors.subject_id = 'Please select your specialized subject';
    }
    
    if (!formData.schoolName) {
      newErrors.schoolName = 'School name is required';
    }

    if (!formData.collegeName) {
      newErrors.collegeName = 'College name is required';
    }

    if (!formData.universityName) {
      newErrors.universityName = 'University name is required';
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
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
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

  const handleNext = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Get teacher ID from localStorage
        const teacherId = localStorage.getItem('teacher_id');
        
        if (!teacherId) {
          console.error("Teacher ID not found in localStorage");
          setErrors({
            general: "Teacher ID not found. Please complete personal details first."
          });
          setIsSubmitting(false);
          return;
        }
        
        // Get the degree ID and subject ID from the form values
        const degreeId = parseInt(formData.EducationalQualification);
        const subjectId = parseInt(formData.subject_id);
        
        // Format the qualification data
        const qualificationData = {
          degree_id: degreeId,
          subject_id: subjectId,
          yearofPassing: educationalQualificationService.formatYearOfPassing(formData.yearofPassing),
          schoolName: formData.schoolName,
          collegeName: formData.collegeName,
          universityName: formData.universityName
        };
        
        console.log('Submitting qualification data:', qualificationData);
        
        // Submit the qualification
        await educationalQualificationService.createTeacherQualification(
          teacherId,
          qualificationData
        );
        
        // Navigate to the next page
        navigate('/teachersubject');
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

  // Function to show a user-friendly error message when API fails
  const renderErrorState = () => (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <div className="text-red-600 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">Could not load data</h3>
      <p className="text-gray-600 mb-4">{errors.general || "There was a problem connecting to the server."}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Try Again
      </button>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-center mb-8 text-black">Educational Details</h1>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          )}

          {/* General Error Message for API failures */}
          {!isLoading && errors.general && !(subjects.length > 0 && degrees.length > 0) && renderErrorState()}

          {/* Form Fields */}
          {!isLoading && subjects.length > 0 && degrees.length > 0 && (
            <div className="space-y-6">
              {errors.general && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                  {errors.general}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black">Choose your Educational Qualification <span className="text-red-500">*</span></label>
                  <select
                    name="EducationalQualification"
                    value={formData.EducationalQualification}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                      ${errors.EducationalQualification ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Choose</option>
                    {degrees.map(degree => (
                      <option key={degree.id} value={degree.id}>
                        {degree.name}
                      </option>
                    ))}
                  </select>
                  {errors.EducationalQualification && <p className="mt-1 text-sm text-red-500">{errors.EducationalQualification}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black">Subject Specialized In <span className="text-red-500">*</span></label>
                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                      ${errors.subject_id ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Choose</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                  {errors.subject_id && <p className="mt-1 text-sm text-red-500">{errors.subject_id}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black">School Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    placeholder="Enter School Name"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                      ${errors.schoolName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.schoolName && <p className="mt-1 text-sm text-red-500">{errors.schoolName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">College Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    placeholder="Enter College Name"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                      ${errors.collegeName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.collegeName && <p className="mt-1 text-sm text-red-500">{errors.collegeName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">University Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="universityName"
                    value={formData.universityName}
                    onChange={handleInputChange}
                    placeholder="Enter University Name"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                      ${errors.universityName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.universityName && <p className="mt-1 text-sm text-red-500">{errors.universityName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">Year of Passing <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="yearofPassing"
                    value={formData.yearofPassing}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-black
                      ${errors.yearofPassing ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.yearofPassing && <p className="mt-1 text-sm text-red-500">{errors.yearofPassing}</p>}
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-black">Latest Degree/Certificate <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="file"
                      name="certificate"
                      onChange={handleInputChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      id="certificate-input"
                    />
                    <label
                      htmlFor="certificate-input" 
                      className={`mt-1 flex items-center w-full px-3 py-2 border rounded-md cursor-pointer text-black
                        ${errors.certificate ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-gray-500">
                        {formData.certificate ? formData.certificate.name : 'Click to attach file'}
                      </span>
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-black">* File will be stored locally for now</p>
                </div> */}
                
              </div>
              <div className="flex justify-between items-center mt-6">
                <button
                  className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-black"
                  onClick={() => navigate('/details')}
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsForm;