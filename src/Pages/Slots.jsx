import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { slotsService } from '../services/slot-service';

const Slots = () => {
  const [selectedSlots, setSelectedSlots] = useState({});
  const [selectedTimes, setSelectedTimes] = useState({});
  const [hasValidSelection, setHasValidSelection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['Morning', 'Afternoon', 'Evening'];
  
  // Map days to week_day number for the API
  const dayToNumber = {
    'Monday': 0,
    'Tuesday': 1,
    'Wednesday': 2,
    'Thursday': 3,
    'Friday': 4,
    'Saturday': 5,
    'Sunday': 6
  };

  // When a day is toggled, if unselected, clear all its times
  const handleDaySelect = (day) => {
    setSelectedSlots(prev => {
      const newSelectedSlots = {
        ...prev,
        [day]: !prev[day]
      };
      // If day is being unselected, clear all its times
      if (!newSelectedSlots[day]) {
        setSelectedTimes(prevTimes => {
          const updatedTimes = { ...prevTimes };
          times.forEach(time => {
            delete updatedTimes[`${day}-${time}`];
          });
          return updatedTimes;
        });
      }
      return newSelectedSlots;
    });
  };

  // Only allow selecting times if the day is selected
  const handleTimeSelect = (day, time) => {
    if (!selectedSlots[day]) return; // Prevent selecting time if day is not selected
    const key = `${day}-${time}`;
    setSelectedTimes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    checkValidSelection();
  }, [selectedSlots, selectedTimes]);

  const checkValidSelection = () => {
    // Check if at least one vertical selection exists (day + time)
    let valid = false;
    days.forEach(day => {
      times.forEach(time => {
        const hasDay = selectedSlots[day];
        const hasTime = selectedTimes[`${day}-${time}`];
        if (hasDay && hasTime) {
          valid = true;
        }
      });
    });
    setHasValidSelection(valid);
  };

  // Function to transform UI state into API format
  const prepareScheduleData = (teacherId) => {
    // Create the schedules array that will go inside teacher_schedules
    const schedules = [];
    
    // For each selected day
    days.forEach(day => {
      if (!selectedSlots[day]) return; // Skip days that aren't selected
      
      const weekDayNum = dayToNumber[day];
      
      // Create time_slots_attributes array for this day
      const timeSlots = [];
      
      // For each day, find the selected times
      times.forEach(time => {
        if (!selectedTimes[`${day}-${time}`]) return; // Skip times that aren't selected
        
        // Add this time as its own object in time_slots_attributes
        timeSlots.push({
          time_of_day: time.toLowerCase(),
          preferred_group: "any" // Changed from "individual" to "any" per API format
        });
      });
      
      // Create schedule object for this day with time_slots_attributes
      if (timeSlots.length > 0) {
        schedules.push({
          week_day: weekDayNum,
          time_slots_attributes: timeSlots
        });
      }
    });
    
    // Return the final formatted data object
    return {
      teacher_id: parseInt(teacherId, 10), // Ensure it's a number
      teacher_schedules: schedules
    };
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!hasValidSelection) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get teacher ID from localStorage
      const teacherId = localStorage.getItem('teacher_id'); 
      
      // Prepare schedule data for the API
      const scheduleData = prepareScheduleData(teacherId);
      
      // For debugging
      console.log('Sending schedule data:', JSON.stringify(scheduleData, null, 2));
      
      // Send the formatted data to the API
      await slotsService.createSchedule(teacherId, scheduleData);
      
      console.log('Schedule saved successfully');
      setShowSuccessMessage(true);
      
      // Redirect to home page after showing success message
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      console.error('Error details:', error.response?.data);
      console.error('Status:', error.response?.status);
      setError(
        error.response?.data?.message || 
        error.message ||
        'Failed to save schedule. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#EBECFF]">
      {/* Navbar */}
      <header className="bg-[#4527a0] text-white p-4 flex items-center" style={{height: '165px' }}>
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

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Date & Time</h2>
          <p className="text-gray-600 mb-6">Choose Days and time you prefer to teach</p>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {showSuccessMessage && (
            <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              User registered successfully! Redirecting...
            </div>
          )}
          
          <div className="space-y-4">
            {days.map(day => (
              <div key={day} className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <div className="w-full md:w-32">
                  <button 
                    onClick={() => handleDaySelect(day)}
                    className={`px-2 py-1 md:px-4 md:py-2 rounded-full w-full transition-colors ${
                      selectedSlots[day] 
                        ? 'bg-[#D8D9FF] text-gray-900' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {day}
                  </button>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start space-x-2">
                  {times.map(time => {
                    const isDaySelected = !!selectedSlots[day];
                    return (
                      <button
                        key={`${day}-${time}`}
                        onClick={() => handleTimeSelect(day, time)}
                        className={`px-2 py-1 md:px-4 md:py-2 rounded-full transition-colors ${
                          selectedTimes[`${day}-${time}`] && isDaySelected
                            ? 'bg-[#D8D9FF] text-gray-900'
                            : 'bg-gray-100 text-gray-800'
                        } ${!isDaySelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!isDaySelected}
                        tabIndex={isDaySelected ? 0 : -1}
                        aria-disabled={!isDaySelected}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button className="flex items-center px-6 py-2 text-gray-700 hover:text-gray-900" onClick={() => navigate('/teacherSubject')}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button 
              className={`px-6 py-2 rounded-md ${
                hasValidSelection 
                  ? 'bg-indigo-800 text-white hover:bg-indigo-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!hasValidSelection || isSubmitting || showSuccessMessage}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Saving...' : 'Create Profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slots;