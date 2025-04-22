import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../services/teacherService';
import api from '../services/api'; // Import your axios instance

const TutorDashboard = () => {
  const navigate = useNavigate();
  const [activeTutorings, setActiveTutorings] = useState([]);
  const [newRequests, setNewRequests] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load profile data from localStorage
    try {
      const authResponseString = localStorage.getItem('auth_response');
      
      if (authResponseString) {
        const authResponse = JSON.parse(authResponseString);
        
        if (authResponse && authResponse.profile && authResponse.profile.length > 0) {
          setProfileData({
            ...authResponse.profile[0],
            role: authResponse.roles?.name || 'teacher'
          });
          
          // Get teacher ID from auth_response
          const teacherId = authResponse.profile[0].id;
          
          // Fetch teacher preferences including subjects
          if (teacherId) {
            fetchTeacherPreferences(teacherId);
            fetchTeacherDetails(teacherId);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing profile data from localStorage:', error);
      setIsLoading(false);
    }
  }, []);

  // Function to fetch teacher details - now using axios
  const fetchTeacherDetails = async (teacherId) => {
    try {
      const response = await api.get(`/api/v1/teachers/${teacherId}`);
      
      if (response.data.status === 'success' && response.data.data) {
        setTeacherDetails(response.data.data);
      } else {
        console.error('Error fetching teacher details:', response.data);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
      setIsLoading(false);
    }
  };

  // Function to fetch teacher preferences - now using axios
  const fetchTeacherPreferences = async (teacherId) => {
    try {
      const response = await api.get(`/api/v1/teachers/${teacherId}/teacher_preferences`);
      
      if (response.data.status === 'success' && response.data.data && response.data.data.length > 0) {
        setTeacherSubjects(response.data.data[0].subjects || []);
      } else {
        console.error('Error fetching teacher preferences:', response.data);
      }
    } catch (error) {
      console.error('Error fetching teacher preferences:', error);
    }
  };

  // Get profile photo URL or use fallback
  const getProfilePhotoUrl = () => {
    if (teacherDetails && teacherDetails.profile_photo) {
      const baseURL = import.meta.env.VITE_API_URL;
      return `${baseURL}${teacherDetails.profile_photo}`;
    }
    return "/assets/DP/dp1.jpg"; // Fallback image
  };

  // Extract city from address
  const getAddressCity = () => {
    if (teacherDetails && teacherDetails.address) {
      const addressParts = teacherDetails.address.split(' ');
      // If address has city information, return it
      if (addressParts.length >= 2) {
        // Assuming city is the second last word in the address
        return addressParts[addressParts.length - 2];
      }
    }
    return "Location not available";
  };

  const handleApprove = (request) => {
    const newTutoring = {
      name: request.name,
      slots: ["M", "W", "F"],
      time: request.time,
      type: request.attention.includes("Group") ? "Group" : "Individual",
      subjects: request.subjects,
      standard: "Standard 8",
      school: "To be updated"
    };

    setActiveTutorings([...activeTutorings, newTutoring]);
    setNewRequests(newRequests.filter(r => r.name !== request.name));
    
    setNotificationMessage(`${request.name}'s tutoring request has been approved`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleReject = (request) => {
    setNewRequests(newRequests.filter(r => r.name !== request.name));
    setNotificationMessage(`${request.name}'s tutoring request has been rejected`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleEndContract = (student) => {
    setSelectedStudent(student);
    setShowConfirmDialog(true);
  };

  const confirmEndContract = () => {
    setActiveTutorings(activeTutorings.filter(s => s.name !== selectedStudent.name));
    setShowConfirmDialog(false);
    setNotificationMessage(`Contract with ${selectedStudent.name} has been ended`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleButtonClick = (action) => {
    setNotificationMessage(`This ${action} feature is not available as of now`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const schedule = {
    'Sunday': { morning: 'M', afternoon: 'A', evening: 'E', mode: 'IN', group: 'G' },
    'Monday': { morning: 'M', afternoon: 'A', evening: 'E', mode: 'IN', group: 'G' },
    'Tuesday': { morning: 'M', afternoon: 'A', evening: 'E', mode: 'IN', group: 'G' },
    'Wednesday': { morning: 'M', afternoon: 'A', evening: 'E', mode: 'IN', group: 'G' },
    'Thursday': { morning: 'M', afternoon: 'A', evening: 'E', mode: 'IN', group: 'G' },
    'Friday': { morning: 'M', afternoon: 'A', evening: 'E', mode: 'IN', group: 'G' },
    'Saturday': { morning: 'M', afternoon: 'A', evening: 'E', mode: 'IN', group: 'G' }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-[#EBECFF] h-screen w-screen overflow-hidden">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-white shadow-lg rounded-lg px-4 py-3 flex items-center space-x-2 animate-fade-in z-50">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <p className="text-sm text-black">{notificationMessage}</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4 text-black">End Contract Confirmation</h3>
            <p className="text-gray-600 mb-6 text-black">
              Are you sure you want to end the contract with {selectedStudent?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm rounded-full border hover:bg-gray-50 text-black"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndContract}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                End Contract
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#2E3192] text-white w-full">
        <div className="w-full flex justify-between items-center px-4 sm:px-6 h-16">
          <div className="flex items-center space-x-2">
            <img src="/assets/LOGO (1).png" alt="Logo" className="h-8" />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-base sm:text-lg font-bold truncate max-w-32 sm:max-w-full">
              {teacherDetails?.name || profileData?.name || 'Loading...'}
            </span>
            <img 
              src={getProfilePhotoUrl()} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {e.target.src = "/assets/DP/dp1.jpg"}}
            />
            <div className="text-sm">
              <button onClick={handleLogout} className="text-red-300 hover:underline rounded-full">Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Vertical on laptops (md), Horizontal on desktop (lg) */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* This div controls the layout direction */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left column (Account Details) - Full width on laptops, 1/3 width on desktop */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden h-full">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">Account Details</h2>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={getProfilePhotoUrl()} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {e.target.src = "/assets/DP/dp1.jpg"}}
                      />
                      <div>
                        <div className="text-base sm:text-lg font-bold text-black break-words">
                          {teacherDetails?.name || profileData?.name || 'Name not available'} 
                        </div>
                        <div className="text-sm text-black break-words">
                          {teacherDetails?.email || profileData?.email || 'email@mail.com'}
                        </div>
                        {teacherDetails?.mobile_number && (
                          <div className="text-sm text-black">
                            {teacherDetails.mobile_number}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 sm:space-y-2">
                      <button 
                        className="h-9 w-20 bg-white border border-[#79747E] text-[#79747E] rounded-full hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center"
                        onClick={() => handleButtonClick('Edit')}
                      >
                        Edit
                      </button>
                      <button 
                        className="h-9 w-20 bg-white border border-[#79747E] text-[#79747E] rounded-full hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center"
                        onClick={() => handleButtonClick('Details')}
                      >
                        Details
                      </button>
                    </div>
                  </div>

                  {/* Subjects Section */}
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-black">Subjects I Teach</h3>
                    <div className="flex flex-wrap gap-2">
                      {teacherSubjects.length > 0 ? (
                        teacherSubjects.map((subject) => (
                          <span 
                            key={subject.id} 
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {subject.name}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm text-black">No subjects added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Address section */}
                  {teacherDetails?.address && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2 text-black">Address</h3>
                      <p className="text-sm text-black break-words">{teacherDetails.address}</p>
                    </div>
                  )}

                  {/* Teacher preferences display */}
                  {teacherDetails?.teacher_preference && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2 text-black">Teaching Preferences</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-black">Mode:</span>
                          <span className="capitalize text-black">{teacherDetails.teacher_preference.teaching_mode}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-black">Type:</span>
                          <span className="capitalize text-black">{teacherDetails.teacher_preference.preferred_teaching_type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-black">Experience:</span>
                          <span className="text-black">{teacherDetails.teacher_preference.prior_experience} years</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-black">Radius:</span>
                          <span className="text-black">{teacherDetails.teacher_preference.teaching_radius_km} km</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right column (Active + New Requests) - Full width on laptops, 2/3 width on desktop */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {/* Active Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold sticky top-0 bg-white py-2 text-black">Active</h2>
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <div className="text-5xl mb-4">📚</div>
                <p className="text-black text-center">No active tutoring sessions</p>
                <p className="text-sm text-black text-center">When you approve requests, they will appear here</p>
              </div>
            </div>

            {/* New Requests Section */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold sticky top-0 bg-white py-2 text-black">New Requests</h2>
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-black text-center">No new tutoring requests</p>
                <p className="text-sm text-black text-center">New student requests will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorDashboard;