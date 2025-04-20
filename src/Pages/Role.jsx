import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const TuitionFinderPage = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if user is already authenticated
        const authToken = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('user_id');
        const roleId = localStorage.getItem('role_id');

        if (authToken && userId && roleId) {
          // User is authenticated, navigate based on role
          navigateByRole(roleId);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Function to navigate based on role ID
  const navigateByRole = (roleId) => {
    switch (roleId) {
      case '1':
        navigate('/dashboard');
        break;
      case '2':
        navigate('/subject');
        break;
      default:
        // Default to roles page if role ID is invalid
        // No action needed - stay on current page
        break;
    }
  };

  const handleCardClick = (role) => {
    // Store the selected role in session storage to be used after login
    sessionStorage.setItem('selected_role', role);
    
    // Redirect to login page
    navigate('/');
  };

  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-900 text-white p-4 flex items-center" style={{height: '201px' }}>
        <div className="container mx-auto flex items-center">
          <img 
            src="/assets/LOGO (2).png" 
            alt="Star Educators Logo"
            className="h-20 cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-700 mb-8">I am</h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="bg-white w-44 h-44 md:w-56 md:h-56 p-4 md:p-6 rounded-lg shadow-md text-center 
              cursor-pointer hover:shadow-lg transition-all flex flex-col items-center justify-center"
            onClick={() => handleCardClick('student')}
          >
            <img src="/assets/student-icon.png" alt="Student Icon" className="w-12 h-12 md:w-16 md:h-16" />
            <h3 className="mt-4 text-base md:text-lg font-medium">A Student looking for guidance</h3>
          </div>

          <div
            className="bg-white w-44 h-44 md:w-56 md:h-56 p-4 md:p-6 rounded-lg shadow-md text-center 
              cursor-pointer hover:shadow-lg transition-all flex flex-col items-center justify-center"
            onClick={() => handleCardClick('teacher')}
          >
            <img src="/assets/teacher-icon.png" alt="Teacher Icon" className="w-12 h-12 md:w-16 md:h-16" />
            <h3 className="mt-4 text-base md:text-lg font-medium">A teacher, looking for students</h3>
          </div>

          <div
            className="bg-white w-44 h-44 md:w-56 md:h-56 p-4 md:p-6 rounded-lg shadow-md text-center 
              cursor-pointer hover:shadow-lg transition-all flex flex-col items-center justify-center"
            onClick={() => handleCardClick('job')}
          >
            <img src="/assets/job-icon.png" alt="Job Icon" className="w-12 h-12 md:w-16 md:h-16" />
            <h3 className="mt-4 text-base md:text-lg font-medium">Seeking for Job opportunities</h3>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6 space-x-4">
          <button
            className="w-36 h-14 bg-gray-200 rounded-full hover:bg-gray-300 text-lg"
            onClick={() => navigate('/')}
          >
            Back
          </button>
          <button
            className="w-36 h-14 bg-indigo-800 text-white rounded-full hover:opacity-90 text-lg"
            onClick={() => navigate('/slots')}
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default TuitionFinderPage;