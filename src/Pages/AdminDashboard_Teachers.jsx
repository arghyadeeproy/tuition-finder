import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BriefcaseIcon, 
  Building2, 
  FileText, 
  MapPin,
  DollarSign,
  MessageCircle,
  Search,
  CheckCircle,
  PlusCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TeachersPage = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Active Teachers');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState({});

  useEffect(() => {
    fetchTeachers(currentPage, pageSize);
  }, [currentPage, pageSize]);
  
  const fetchTeachers = async (page, limit) => {
    try {
      setIsLoading(true);
      // Update the API call to include pagination parameters using the correct format
      const response = await api.get('/api/v1/teachers', {
        params: { page, limit }
      });
      console.log('API Response:', response.data);
      
      if (response.data.status === 'success') {
        const teacherData = response.data.data;
        console.log('Teacher Data:', teacherData);
        
        setTeachers(teacherData);
        
        // Use the actual teacher_count from the API response
        const totalCount = response.data.teacher_count || teacherData.length;
        setTotalTeachers(totalCount);
        setTotalPages(Math.ceil(totalCount / limit));
        
        // Store pagination info from API
        if (response.data.pagination) {
          setPaginationInfo(response.data.pagination);
        }
      } else {
        setError('Failed to retrieve teacher data');
      }
    } catch (err) {
      console.error('Failed to fetch teacher data:', err);
      setError('Failed to load teacher data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search teachers
  const filteredTeachers = teachers.filter(teacher => {
    // Apply active/inactive filter
    const activeFilterMatch = 
      activeFilter === 'All Teachers' || 
      (activeFilter === 'Active Teachers' && teacher.is_active) ||
      (activeFilter === 'Inactive Teachers' && !teacher.is_active);
      
    // Apply search filter
    const searchMatch = 
      searchTerm === '' || 
      teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.mobile_number?.includes(searchTerm) ||
      // Search in subjects if they exist
      (teacher.subjects && teacher.subjects.some(subject => 
        subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
      
    return activeFilterMatch && searchMatch;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle page change
  const goToPage = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Navigate to next/previous page using API links if available
  const goToNextPage = () => {
    if (paginationInfo.next) {
      setCurrentPage(paginationInfo.next);
    } else {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (paginationInfo.prev) {
      setCurrentPage(paginationInfo.prev);
    } else {
      goToPage(currentPage - 1);
    }
  };

  // Helper function to get profile photo URL
  const getProfilePhotoUrl = (teacher) => {
    if (teacher.profile_photo) {
      return `http://localhost:3001${teacher.profile_photo}`;
    }
    return null;
  };

  // Helper function to format subjects list with commas
  const formatSubjectsList = (subjects) => {
    if (!subjects || subjects.length === 0) return 'No subjects';
    return subjects.map(subject => subject.name).join(', ');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Star Educators</h1>
        </div>
        <nav className="space-y-2 flex-1">
          {[
            { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', onClick: () => navigate('/admin') },
            { icon: <Users className="w-5 h-5" />, label: 'Teachers', active: true },
            { icon: <MessageSquare className="w-5 h-5" />, label: 'Enquiries', disabled: true },
            { icon: <Building2 className="w-5 h-5" />, label: 'Recruiters', disabled: true },
            { icon: <BriefcaseIcon className="w-5 h-5" />, label: 'Jobs', disabled: true },
            { icon: <FileText className="w-5 h-5" />, label: 'Job Applications', disabled: true },
            { icon: <MapPin className="w-5 h-5" />, label: 'Service Area', disabled: true },
            { icon: <DollarSign className="w-5 h-5" />, label: 'Revenue', disabled: true },
            { icon: <MessageCircle className="w-5 h-5" />, label: 'Feedbacks', disabled: true },
          ].map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 p-2 rounded cursor-pointer ${
                item.active ? 'bg-indigo-800' : 
                item.disabled ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-indigo-600'
              }`}
              onClick={!item.disabled ? item.onClick : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-auto bg-gray-100">
        {/* Top navigation bar */}
        <div className="bg-indigo-700 text-white p-4 flex justify-between items-center">
          <div></div> {/* Empty div for spacing */}
          <div className="flex items-center space-x-2">
            <span>My Account</span>
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Teachers content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Teachers</h2>
            <p className="text-sm text-gray-500">Manage all registered teachers in the system</p>
          </div>

          {/* Search and filter options */}
          <div className="flex justify-between mb-6">
            <div className="flex space-x-2">
              <div className="relative">
                <button 
                  className="bg-white border rounded-md px-4 py-2 flex items-center space-x-2"
                  onClick={() => {
                    if (activeFilter === 'Active Teachers') {
                      setActiveFilter('Inactive Teachers');
                    } else if (activeFilter === 'Inactive Teachers') {
                      setActiveFilter('All Teachers');
                    } else {
                      setActiveFilter('Active Teachers');
                    }
                  }}
                >
                  <span>{activeFilter}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <button className="bg-white border rounded-md px-4 py-2 flex items-center space-x-2">
                  <span>Filters</span>
                  <PlusCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-2 text-gray-600">Loading teachers...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Teachers grid */}
          {!isLoading && !error && (
            <>
              <div className="mb-4 text-sm text-gray-500">
                <span>Total: {totalTeachers} teachers</span>
              </div>
              
              {filteredTeachers.length === 0 ? (
                <div className="bg-white p-8 rounded-lg text-center">
                  <p className="text-gray-500">No teachers found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTeachers.map((teacher) => (
                    <div key={teacher.id} className="bg-white rounded-lg p-4 flex space-x-4 shadow-sm hover:shadow transition-shadow duration-200">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-500 overflow-hidden">
                        {getProfilePhotoUrl(teacher) ? (
                          <img 
                            src={getProfilePhotoUrl(teacher)} 
                            alt={teacher.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          teacher.name?.charAt(0)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1">
                          <h3 className="font-medium">{teacher.name || 'Unnamed Teacher'}</h3>
                          {teacher.is_active && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{teacher.mobile_number} | {teacher.email}</p>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{teacher.address || 'No address'}</span>
                          </div>
                          {teacher.teacher_preference && (
                            <div className="flex items-center space-x-1">
                              <span>
                                {teacher.teacher_preference.teaching_mode} | 
                                {teacher.teacher_preference.prior_experience} yrs exp
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Subjects section */}
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3" />
                            <span className="font-medium">Subjects:</span> 
                            <span>{formatSubjectsList(teacher.subjects)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination controls */}
              <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm text-gray-600">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, totalTeachers)} to {Math.min(currentPage * pageSize, totalTeachers)} of {totalTeachers} teachers
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex space-x-1">
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum;
                      
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <button
                            key={i}
                            onClick={() => goToPage(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center rounded-md ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-700 hover:bg-indigo-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button 
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>
                  <select 
                    value={pageSize} 
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1); // Reset to first page when changing page size
                    }}
                    className="border rounded-md p-1 text-sm"
                  >
                    {[3, 5, 10, 20].map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeachersPage;