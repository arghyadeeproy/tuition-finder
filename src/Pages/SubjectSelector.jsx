import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { teacherStudentRequestService } from "../services/teacherStudentRequestService";
import { subjectService } from "../services/subjectService";

const TuitionFinder = () => {
  const navigate = useNavigate();
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Form state
  const [formData, setFormData] = useState({
    teacherAssignment: "multiple", // default values
    classPreference: "individual",
    teachingMode: "online",
    medium: "english"
  });

  // Fetch subjects from API on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await subjectService.getSubjects();
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          // Store full subject objects including IDs
          setSubjects(response.data.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setSubjects(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          setSubjects(response.data);
        } else {
          console.warn("Unexpected subject data format:", response.data);
          setSubjects([]);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        // Set some default subjects as fallback
        setSubjects([
          { id: 1, name: "Mathematics", is_active: true },
          { id: 2, name: "Physics", is_active: true },
          { id: 3, name: "Chemistry", is_active: true },
          { id: 4, name: "Biology", is_active: true },
          { id: 5, name: "English", is_active: true }
        ]);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectSelect = (subject) => {
    const isSelected = selectedSubjects.some(s => s.id === subject.id);
    
    if (isSelected) {
      setSelectedSubjects(selectedSubjects.filter(s => s.id !== subject.id));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setErrorMessage("");
  };

  const handleAddSubject = async () => {
    if (searchTerm && !subjects.some(s => s.name.toLowerCase() === searchTerm.toLowerCase())) {
      try {
        // Instead of creating a temp subject, we should create it in the backend first
        const newSubjectData = {
          name: searchTerm,
          is_active: true
        };
        
        // Create the subject in the backend
        const response = await subjectService.createSubject(newSubjectData);
        
        // Add the new subject (with server-assigned ID) to our list
        const newSubject = response.data.subject || response.data;
        
        setSubjects([...subjects, newSubject]);
        setSelectedSubjects([...selectedSubjects, newSubject]);
        setSearchTerm("");
      } catch (error) {
        console.error("Error creating new subject:", error);
        setErrorMessage("Failed to add new subject. Please try again.");
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (selectedSubjects.length === 0) {
      setErrorMessage("Please select at least one subject");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    
    try {
      // Extract the subject IDs from selected subjects and ensure they are integers
      const subjectIds = selectedSubjects.map(subject => {
        // If id is a string that contains only digits, parse it to an integer
        const id = typeof subject.id === 'string' && /^\d+$/.test(subject.id) 
          ? parseInt(subject.id, 10) 
          : subject.id;
        return id;
      }).filter(id => typeof id === 'number'); // Filter out any non-numeric IDs

      // Get user ID from localStorage (set during sign-in)
      const studentId = localStorage.getItem('user_id');
      
      if (!studentId) {
        setErrorMessage("You need to be logged in to find teachers");
        setIsLoading(false);
        navigate('/login'); // Redirect to login if not logged in
        return;
      }

      // Ensure student_id is an integer
      const parsedStudentId = parseInt(studentId, 10);

      // *** IMPORTANT CHANGE: Do NOT wrap the data in teacher_student_request here ***
      // The service method will do that wrapping for us
      const requestData = {
        student_id: parsedStudentId,
        subject_ids: subjectIds,
        status: "request_send",
        mode_of_teaching: formData.teachingMode,
        preferred_group: formData.classPreference,
        preferred_medium: formData.medium,
        teacher_assignment_preference: formData.teacherAssignment,
        preferred_time: ["morning", "afternoon"]
      };

      console.log("Sending request data:", requestData);

      // Send the request to the API
      const response = await teacherStudentRequestService.createRequest(requestData);
      
      console.log("Teacher request created:", response.data);
      
      // Navigate to the teacher finder page with the request ID
      // Extract the ID correctly from the response
      const requestId = response.data.id || 
                        (response.data.teacher_student_request && response.data.teacher_student_request.id);
      
      if (requestId) {
        navigate('/teacherfinder', { state: { requestId } });
      } else {
        console.error("No request ID returned from API", response.data);
        setErrorMessage("Request created but couldn't get request ID. Please try again.");
      }
      
    } catch (error) {
      console.error("Error creating teacher request:", error);
      
      // Extract and display more specific error message if available
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          setErrorMessage(errorData);
        } else if (errorData.error) {
          setErrorMessage(errorData.error);
        } else if (errorData.message) {
          setErrorMessage(errorData.message);
        } else {
          setErrorMessage("Failed to submit your request. Please check your inputs and try again.");
        }
      } else {
        setErrorMessage("Failed to submit your request. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter subjects based on search term
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubjectExists = subjects.some(subject =>
    subject.name.toLowerCase() === searchTerm.toLowerCase()
  );

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-blue-700 overflow-hidden">
      {/* Left Section */}
      <div
        className="bg-[#2E3192] shadow-lg rounded-lg flex items-center justify-center"
        style={{
          height: "1010px",
          width: "100%",
          maxWidth: "1902px",
        }}
      >
        <div className="w-full max-w-3xl px-6 py-8">
          {/* Logo Only */}
          <div className="flex justify-center mb-6">
            <img src="//assets/LOGO.png" alt="Star Educators" className="h-16" />
          </div>
          
          {/* Error Message Display */}
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}
          
          <div className="mb-6 text-center">
            <p className="text-lg font-medium text-white font-inter text-[32px]">
              Find Online & home tutor in seconds
            </p>
            <p className="text-gray-300">
              You can choose multiple subjects from the search bar
            </p>
            
            {/* Subject Selection Dropdown */}
            <div className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Subject"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && filteredSubjects.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredSubjects.map(subject => (
                      <div
                        key={subject.id}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          handleSubjectSelect(subject);
                          setSearchTerm("");
                        }}
                      >
                        {subject.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Selected Subjects */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {selectedSubjects.map(subject => (
                <button
                  key={subject.id}
                  className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => handleSubjectSelect(subject)}
                >
                  {subject.name}
                  <span
                    className="ml-2 text-sm font-medium cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubjectSelect(subject);
                    }}
                  >
                    x
                  </span>
                </button>
              ))}
            </div>
            
            {/* Add new subject button */}
            {!isSubjectExists && searchTerm && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleAddSubject}
                  className="px-4 py-2 font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                >
                  Add Subject
                </button>
              </div>
            )}
          </div>
          
          {/* Form Section */}
          <div className="space-y-6">
            {/* Radio Button Groups - Aligned Horizontally */}
            <div className="text-center">
              <p className="font-medium mb-3 text-white">Are you looking for one teacher to teach all selected subjects?</p>
              <div className="flex justify-center space-x-6">
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="teacherAssignment"
                    value="multiple"
                    checked={formData.teacherAssignment === "multiple"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  Recommend multiple teachers
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="teacherAssignment"
                    value="single"
                    checked={formData.teacherAssignment === "single"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  One teacher will teach all
                </label>
              </div>
            </div>

            <div className="text-center">
              <p className="font-medium mb-3 text-white">What do you want?</p>
              <div className="flex justify-center space-x-6">
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="classPreference"
                    value="individual"
                    checked={formData.classPreference === "individual"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  Individual attention
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="classPreference"
                    value="group"
                    checked={formData.classPreference === "group"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  I prefer group classes
                </label>
              </div>
            </div>

            <div className="text-center">
              <p className="font-medium mb-3 text-white">What mode of teaching do you prefer?</p>
              <div className="flex justify-center space-x-6">
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="teachingMode"
                    value="offline"
                    checked={formData.teachingMode === "offline"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  Offline
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="teachingMode"
                    value="online"
                    checked={formData.teachingMode === "online"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  Online
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="teachingMode"
                    value="both"
                    checked={formData.teachingMode === "both"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  I am comfortable with both
                </label>
              </div>
            </div>

            <div className="text-center">
              <p className="font-medium mb-3 text-white">Medium of learning</p>
              <div className="flex justify-center space-x-6">
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="medium"
                    value="english"
                    checked={formData.medium === "english"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  English
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="medium"
                    value="hindi"
                    checked={formData.medium === "hindi"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  Hindi
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="medium"
                    value="bengali"
                    checked={formData.medium === "bengali"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  Bengali
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="medium"
                    value="any"
                    checked={formData.medium === "any"}
                    onChange={handleFormChange}
                    className="mr-2"
                  />
                  Language is not an issue
                </label>
              </div>
            </div>

            {/* Explore Button */}
            <div className="flex justify-center mt-6">
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isLoading ? "Processing..." : "Explore Teachers"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Right Section - Banner Image */}
      <div className="hidden lg:block lg:h-[1010px] lg:w-[902px] overflow-hidden">
        <img
          src="//assets/banner.png"
          alt="Banner"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};

export default TuitionFinder;