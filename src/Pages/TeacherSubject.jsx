import { useState, useEffect, useRef } from 'react';
import { subjectService } from '../services/subjectService';
import { useNavigate } from 'react-router-dom';
import { teacherService } from "../services/teacherService";

export default function TuitionFinderForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const qualificationInputRef = useRef(null);

  // School Education Board options must match enum order: {cbse: 0, icse: 1, state: 2, other: 3}
  // But for API, we will send string values
  const schoolEducationBoardOptions = [
    { label: "CBSE", value: "cbse" },
    { label: "ICSE", value: "icse" },
    { label: "State Board", value: "state" },
    { label: "Other", value: "other" }
  ];

  const [formData, setFormData] = useState({
    teachLocation: true,
    teachSchools: true,
    teachSpecialChild: true,
    trainedSpecialChild: true,
    experience: "2",
    radius: "10",
    selectedSubjects: [],
    teachOnline: false, // Disabled online teaching
    teachOffline: true, // Default to offline
    selectedMediums: [],
    mark_sheet: null,
    highest_qualification_certificate: null,
    school_education_board: "cbse" // default to string
  });

  // For custom board text and dropdown state
  const [otherBoardInput, setOtherBoardInput] = useState("");
  const [isOtherBoard, setIsOtherBoard] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mediumDropdownOpen, setMediumDropdownOpen] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [qualificationFileError, setQualificationFileError] = useState(null);

  // Teaching medium options
  const teachingMediumOptions = [
    "English",
    "Hindi",
    "Bengali"
  ];

  useEffect(() => {
    // Fetch subjects when component mounts
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await subjectService.getSubjects();

        // Check the structure of the response and extract the subjects array
        const subjectsData = Array.isArray(response.data)
          ? response.data
          : (response.data.subjects || response.data.data || []);

        if (!Array.isArray(subjectsData)) {
          console.error('Invalid subjects data format:', response.data);
          setError('Invalid subject data format received from the server.');
          setSubjects([]);
        } else {
          setSubjects(subjectsData);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load subjects. Please try again later.');
        console.error('Error fetching subjects:', err);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.subject-dropdown')) {
        setDropdownOpen(false);
      }
      if (mediumDropdownOpen && !event.target.closest('.medium-dropdown')) {
        setMediumDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, mediumDropdownOpen]);

  // Handle change for all fields except school_education_board
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for school_education_board
    if (name === "school_education_board") {
      // First check if value is empty, if so use default value
      const boardValue = value === "" ? "cbse" : value;

      // Check if the value is the "Other" option
      if (boardValue === "other") {
        setIsOtherBoard(true);
        setOtherBoardInput("");
      } else {
        setIsOtherBoard(false);
        setOtherBoardInput("");
      }

      // Update the state with the string value
      setFormData({
        ...formData,
        school_education_board: boardValue
      });

      // Debug logging
      console.log(`School board changed to: ${boardValue} (${typeof boardValue})`);
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle custom board input
  const handleOtherBoardInputChange = (e) => {
    setOtherBoardInput(e.target.value);
    // We keep the school_education_board value as "other" for the backend
  };

  const handleFileChange = (e) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setFileError('Please upload only JPG, JPEG or PNG files');
        return;
      }

      // Check file size (500KB = 512000 bytes)
      if (file.size > 512000) {
        setFileError('File size must be less than 500KB');
        return;
      }

      setFormData({
        ...formData,
        mark_sheet: file
      });
    }
  };

  // New: handle qualification certificate file
  const handleQualificationFileChange = (e) => {
    setQualificationFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setQualificationFileError('Please upload only JPG, JPEG or PNG files');
        return;
      }

      // Check file size (500KB = 512000 bytes)
      if (file.size > 512000) {
        setQualificationFileError('File size must be less than 500KB');
        return;
      }

      setFormData({
        ...formData,
        highest_qualification_certificate: file
      });
    }
  };

  const handleRadioChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value === 'yes',
    });
  };

  const handleSubjectChange = (subjectId) => {
    setFormData(prevData => {
      const updatedSubjects = prevData.selectedSubjects.includes(subjectId)
        ? prevData.selectedSubjects.filter(id => id !== subjectId)
        : [...prevData.selectedSubjects, subjectId];

      return {
        ...prevData,
        selectedSubjects: updatedSubjects
      };
    });
  };

  // Helper function to convert UI medium selection to API format
  const getPreferredMedium = (mediums) => {
    if (!Array.isArray(mediums) || mediums.length === 0) {
      return ["english"];
    }
    return Array.from(new Set(mediums.map(m => m.toLowerCase())));
  };

  // Helper function to determine mode of teaching based on checkboxes
  const getModeOfTeaching = () => {
    if (formData.teachOnline && formData.teachOffline) {
      return "both";
    } else if (formData.teachOnline) {
      return "online";
    } else if (formData.teachOffline) {
      return "offline";
    }
    return "offline"; // Default fallback
  };

  // Handle multi-select for teaching mediums
  const handleMediumChange = (medium) => {
    setFormData(prevData => {
      const updatedMediums = prevData.selectedMediums.includes(medium)
        ? prevData.selectedMediums.filter(m => m !== medium)
        : [...prevData.selectedMediums, medium];
      return {
        ...prevData,
        selectedMediums: updatedMediums
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Debug logging
    console.log("Form data before submission:", formData);
    console.log("School Education Board value:", formData.school_education_board, typeof formData.school_education_board);

    // Validate form data before submission - all fields are mandatory
    if (formData.selectedSubjects.length === 0) {
      setSubmitError("Please select at least one subject");
      return;
    }

    if (!formData.teachOffline) {
      setSubmitError("Offline teaching mode is required");
      return;
    }

    if (!formData.mark_sheet) {
      setSubmitError("Please upload your Marksheet");
      return;
    }

    if (!formData.highest_qualification_certificate) {
      setSubmitError("Please upload your Highest Qualification Certificate");
      return;
    }

    if (!formData.radius || formData.radius === "0") {
      setSubmitError("Please specify a valid teaching radius");
      return;
    }

    if (!formData.experience) {
      setSubmitError("Please specify your teaching experience");
      return;
    }

    if (!formData.selectedMediums || formData.selectedMediums.length === 0) {
      setSubmitError("Please select at least one medium of teaching");
      return;
    }

    // Validate school_education_board
    const boardValue = typeof formData.school_education_board === 'string' && formData.school_education_board
      ? formData.school_education_board
      : null;

    if (boardValue === null) {
      setSubmitError("Please select your School Education Board");
      return;
    }

    // For "Other", ensure the user has entered a value
    if (boardValue === "other" && !otherBoardInput.trim()) {
      setSubmitError("Please specify your Board type");
      return;
    }

    // Prepare the data for teacher_preferences API submission
    const teacherId = localStorage.getItem('teacher_id');

    if (!teacherId) {
      setSubmitError("Teacher ID not found. Please ensure you're logged in properly.");
      return;
    }

    // Create the request object with validated school_education_board (as string)
    const teacherPreferenceRequest = {
      teaching_radius_km: parseInt(formData.radius) || 10,
      preferred_teaching_type: "individual",
      prior_experience: parseInt(formData.experience) || 0,
      teaching_mode: getModeOfTeaching(),
      teaching_location_preference: formData.teachLocation,
      teaching_school: formData.teachSchools,
      special_need_children: formData.trainedSpecialChild,
      special_attention_children: formData.teachSpecialChild,
      subject_ids: formData.selectedSubjects.map(id => parseInt(id)),
      preferred_medium: getPreferredMedium(formData.selectedMediums),
      school_education_board: boardValue,
      ...(formData.mark_sheet !== undefined ? { mark_sheet: formData.mark_sheet } : {}),
      ...(formData.highest_qualification_certificate !== undefined ? { highest_qualification_certificate: formData.highest_qualification_certificate } : {})
    };

    // Add the other board text if applicable
    if (boardValue === "other" && otherBoardInput.trim() !== "") {
      teacherPreferenceRequest.school_education_board_other = otherBoardInput.trim();
    }

    try {
      console.log("Submitting request:", JSON.stringify(teacherPreferenceRequest, null, 2));

      // Submit the form data to the API
      const response = await teacherService.createTeacherPreferences(teacherId, teacherPreferenceRequest);
      console.log("Response from server:", response);

      // Navigate to /slots after successful submission
      navigate('/slots');

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error.message || 'There was an error submitting your request. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/educational_details_teacher');
  };


  return (
    <div className="fixed inset-0 bg-indigo-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#4527a0] text-black p-4 flex items-center fixed top-0 left-0 right-0 z-10" style={{height: '100px' }}>
        <img
          src="/assets/LOGO (1).png"
          alt="Star Educators Logo"
          style={{
            height: '50px',
            width: '50px',
            position: 'relative',
            left: '69px',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/')}
        />
      </header>

      {/* Form Card - Centered and takes up most of the screen */}
      <div className="flex-1 flex justify-center items-start overflow-auto py-4" style={{ marginTop: '100px' }}>
        <div className="w-full max-w-5xl mx-6 rounded-lg bg-white shadow-lg p-6 relative">
          <h2 className="text-2xl font-bold mb-8 text-black">Teaching Preferences</h2>

          {/* Show submission error if any */}
          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" id="teacher-preferences-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-6">
                {/* Subject Selection - Improved Dropdown */}
                <div>
                  <label className="text-sm text-black block mb-2">Select subjects you teach <span className="text-red-500">*</span></label>
                  <div className="relative subject-dropdown">
                    {loading ? (
                      <div className="w-full border border-gray-300 rounded p-2 text-black">
                        Loading subjects...
                      </div>
                    ) : error ? (
                      <div className="w-full border border-red-300 rounded p-2 text-red-500">
                        {error}
                      </div>
                    ) : (
                      <div className="w-full">
                        <div
                          className="w-full border border-gray-300 rounded p-2 text-black flex justify-between items-center cursor-pointer bg-white"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                          <div className="flex flex-wrap gap-1">
                            {formData.selectedSubjects.length === 0 ? (
                              <span className="text-black">Select subjects</span>
                            ) : (
                              subjects
                                .filter(subject => formData.selectedSubjects.includes(subject.id?.toString()))
                                .map(subject => (
                                  <span key={subject.id} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                                    {subject.name || subject.title}
                                  </span>
                                ))
                            )}
                          </div>
                          <svg className={`w-4 h-4 text-black transition-transform ${dropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>

                        {dropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                            {subjects.length === 0 ? (
                              <div className="p-2 text-black">No subjects available</div>
                            ) : (
                              subjects.map((subject) => (
                                <div
                                  key={subject.id}
                                  className="p-2 hover:bg-indigo-50 cursor-pointer flex items-center"
                                  onClick={() => handleSubjectChange(subject.id?.toString())}
                                >
                                  <input
                                    type="checkbox"
                                    className="form-checkbox h-4 w-4 text-indigo-600 mr-2"
                                    checked={formData.selectedSubjects.includes(subject.id?.toString())}
                                    onChange={() => {}}
                                  />
                                  <span className="text-black">{subject.name || subject.title}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-black mt-1">
                      Click to open dropdown and select multiple subjects
                    </p>
                  </div>
                </div>

                {/* Teaching Experience */}
                <div className="mt-6">
                  <label className="text-sm text-black block mb-2">Prior teaching experience in years <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full border border-gray-300 rounded p-2 text-black"
                  />
                </div>

                {/* Teaching Medium - Multi-select Dropdown */}
                <div className="mt-6">
                  <label className="text-sm text-black block mb-2">Medium of Teaching <span className="text-red-500">*</span></label>
                  <div className="relative medium-dropdown">
                    <div
                      className="w-full border border-gray-300 rounded p-2 text-black flex justify-between items-center cursor-pointer bg-white"
                      onClick={() => setMediumDropdownOpen(!mediumDropdownOpen)}
                    >
                      <div className="flex flex-wrap gap-1">
                        {formData.selectedMediums.length === 0 ? (
                          <span className="text-black">Select mediums</span>
                        ) : (
                          formData.selectedMediums.map((medium) => (
                            <span key={medium} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                              {medium}
                            </span>
                          ))
                        )}
                      </div>
                      <svg className={`w-4 h-4 text-black transition-transform ${mediumDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {mediumDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                        {teachingMediumOptions.map((medium) => (
                          <div
                            key={medium}
                            className="p-2 hover:bg-indigo-50 cursor-pointer flex items-center"
                            onClick={() => handleMediumChange(medium)}
                          >
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-indigo-600 mr-2"
                              checked={formData.selectedMediums.includes(medium)}
                              onChange={() => {}}
                            />
                            <span className="text-black">{medium}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-black mt-1">
                      Click to open dropdown and select multiple mediums
                    </p>
                  </div>
                </div>

                {/* School Education Board Dropdown */}
                <div className="mt-6">
                  <label className="text-sm text-black block mb-2">
                    School Education Board <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="school_education_board"
                    value={formData.school_education_board}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded p-2 text-black bg-white"
                  >
                    <option value="">Select Board</option>
                    {schoolEducationBoardOptions.map((board) => (
                      <option key={board.value} value={board.value}>{board.label}</option>
                    ))}
                  </select>
                  {/* Show additional input field if "Other" is selected */}
                  {isOtherBoard && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={otherBoardInput}
                        onChange={handleOtherBoardInputChange}
                        placeholder="Please specify your board"
                        className="w-full border border-gray-300 rounded p-2 text-black"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Note: We'll record your board as "Other" in our system.
                      </p>
                    </div>
                  )}
                </div>

                {/* Special Needs Teaching */}
                <div className="mt-6">
                  <p className="text-sm text-black mb-2">I am okay to teach a child who needs special attention <span className="text-red-500">*</span></p>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="teachSpecialChild"
                        checked={formData.teachSpecialChild}
                        onChange={() => handleRadioChange('teachSpecialChild', 'yes')}
                        required
                      />
                      <span className="ml-2 text-black">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="teachSpecialChild"
                        checked={!formData.teachSpecialChild}
                        onChange={() => handleRadioChange('teachSpecialChild', 'no')}
                        required
                      />
                      <span className="ml-2 text-black">No</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                {/* Teaching Mode - Updated to separate checkboxes */}
                <div>
                  <label className="text-sm text-black block mb-2">Teaching mode preference <span className="text-red-500">*</span></label>
                  <div className="space-y-2">
                    <label className="flex items-center opacity-50 cursor-not-allowed">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-gray-400"
                        checked={false}
                        disabled
                      />
                      <span className="ml-2 text-black">Online (Currently unavailable)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-indigo-600"
                        checked={formData.teachOffline}
                        onChange={() => setFormData({...formData, teachOffline: !formData.teachOffline})}
                        required
                      />
                      <span className="ml-2 text-black">Offline</span>
                    </label>
                  </div>
                </div>

                {/* Teaching Radius - Changed to slider with colored background */}
                <div className="mt-6">
                  <label className="text-sm text-black block mb-2">I teach within radius (in KMs) <span className="text-red-500">*</span></label>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="range"
                      name="radius"
                      value={formData.radius}
                      onChange={handleChange}
                      min="0"
                      max="50"
                      step="1"
                      required
                      style={{
                        background: `linear-gradient(90deg, #6366f1 ${(formData.radius/50)*100}%, #e5e7eb ${(formData.radius/50)*100}%)`
                      }}
                      className="w-full h-[4px] rounded-lg appearance-none cursor-pointer focus:outline-none slider-colored"
                    />
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">0 KM</span>
                      <span className="text-sm font-medium text-indigo-800">{formData.radius} KM</span>
                      <span className="text-xs text-gray-500">50 KM</span>
                    </div>
                  </div>
                  {/* Custom styles for the range slider thumb and track */}
                  <style>
                    {`
                      input[type="range"].slider-colored {
                        outline: none;
                        vertical-align: middle;
                        margin: 0;
                        padding: 0;
                        /* Make the bar thinner */
                        height: 20px;
                      }
                      input[type="range"].slider-colored::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #6366f1;
                        border: 2px solid #fff;
                        box-shadow: 0 0 2px rgba(0,0,0,0.2);
                        cursor: pointer;
                        transition: background 0.2s;
                        margin-top: -8px; /* Center the thumb on a 4px track */
                      }
                      input[type="range"].slider-colored::-webkit-slider-runnable-track {
                        height: 4px;
                        border-radius: 2px;
                        background: transparent;
                      }
                      input[type="range"].slider-colored:focus {
                        outline: none;
                      }
                      /* Firefox */
                      input[type="range"].slider-colored::-moz-range-thumb {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #6366f1;
                        border: 2px solid #fff;
                        box-shadow: 0 0 2px rgba(0,0,0,0.2);
                        cursor: pointer;
                        transition: background 0.2s;
                      }
                      input[type="range"].slider-colored::-moz-range-track {
                        height: 4px;
                        border-radius: 2px;
                        background: transparent;
                      }
                      input[type="range"].slider-colored::-moz-focus-outer {
                        border: 0;
                      }
                      /* IE */
                      input[type="range"].slider-colored::-ms-thumb {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #6366f1;
                        border: 2px solid #fff;
                        box-shadow: 0 0 2px rgba(0,0,0,0.2);
                        cursor: pointer;
                        transition: background 0.2s;
                        margin-top: 0px;
                      }
                      input[type="range"].slider-colored::-ms-fill-lower {
                        background: transparent;
                      }
                      input[type="range"].slider-colored::-ms-fill-upper {
                        background: transparent;
                      }
                      input[type="range"].slider-colored {
                        height: 7px;
                      }
                    `}
                  </style>
                </div>

                {/* School Teaching */}
                <div className="mt-6">
                  <p className="text-sm text-black mb-2">I teach at school <span className="text-red-500">*</span></p>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="teachSchools"
                        checked={formData.teachSchools}
                        onChange={() => handleRadioChange('teachSchools', 'yes')}
                        required
                      />
                      <span className="ml-2 text-black">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="teachSchools"
                        checked={!formData.teachSchools}
                        onChange={() => handleRadioChange('teachSchools', 'no')}
                        required
                      />
                      <span className="ml-2 text-black">No</span>
                    </label>
                  </div>
                </div>

                {/* Document Upload - Updated with file type restrictions */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-black">Attach your Marksheet of 12  <span className="text-red-500">*</span></p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    required
                  />
                  <button
                    type="button"
                    className="bg-indigo-800 text-white px-4 py-2 rounded-md flex items-center"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                    </svg>
                    Upload Marksheet
                  </button>
                </div>
                {fileError && (
                  <div className="text-sm text-red-600 mt-1">
                    {fileError}
                  </div>
                )}
                {formData.mark_sheet && !fileError && (
                  <div className="text-sm text-green-600 mt-1">
                    File selected: {formData.mark_sheet.name}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Only JPG, JPEG or PNG files under 500KB are accepted
                </div>

                {/* Highest Qualification Certificate Upload */}
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-black">Attach Highest Qualification Certificate <span className="text-red-500">*</span></p>
                  <input
                    type="file"
                    ref={qualificationInputRef}
                    onChange={handleQualificationFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    required
                  />
                  <button
                    type="button"
                    className="bg-indigo-800 text-white px-4 py-2 rounded-md flex items-center"
                    onClick={() => qualificationInputRef.current.click()}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                    </svg>
                    Upload Certificate
                  </button>
                </div>
                {qualificationFileError && (
                  <div className="text-sm text-red-600 mt-1">
                    {qualificationFileError}
                  </div>
                )}
                {formData.highest_qualification_certificate && !qualificationFileError && (
                  <div className="text-sm text-green-600 mt-1">
                    File selected: {formData.highest_qualification_certificate.name}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Only JPG, JPEG or PNG files under 500KB are accepted
                </div>

                {/* Special Training */}
                <div className="mt-6">
                  <p className="text-sm text-black mb-2">I am trained to teach specially-abled children <span className="text-red-500">*</span></p>
                  <div className="flex space-x-6">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="trainedSpecialChild"
                        checked={formData.trainedSpecialChild}
                        onChange={() => handleRadioChange('trainedSpecialChild', 'yes')}
                        required
                      />
                      <span className="ml-2 text-black">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-5 w-5 text-indigo-600"
                        name="trainedSpecialChild"
                        checked={!formData.trainedSpecialChild}
                        onChange={() => handleRadioChange('trainedSpecialChild', 'no')}
                        required
                      />
                      <span className="ml-2 text-black">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Navigation - buttons in bottom left/right of white container, no tick mark */}
            <div className="w-full flex justify-between items-center mt-8 absolute left-0 right-0 bottom-0 px-6 pb-6">
              <button
                type="button"
                className="border border-indigo-800 text-indigo-800 dark:text-white dark:border-white px-8 py-2 rounded-full flex items-center"
                onClick={handleBack}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <button
                type="submit"
                className="bg-indigo-800 text-white px-8 py-2 rounded-full flex items-center"
              >
                Next
              </button>
            </div>
            {/* Add padding to bottom so content is not hidden behind buttons */}
            <div className="pb-20"></div>
          </form>
        </div>
      </div>
      <footer className="bg-[#4527a0] text-white py-4 text-center">
        <p>For any technical issues, please contact: <a href="mailto:tech.star.educators@gmail.com" className="underline hover:text-indigo-200">tech.star.educators@gmail.com</a></p>
      </footer>
    </div>
  );
}