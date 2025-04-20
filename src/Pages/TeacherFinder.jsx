import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TuitionFinder = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all');

  const teacherData = {
    teachers: [
      {
        name: "Alice Wonderland",
        location: "Kolkata, West Bengal, India",
        experience: "5 Year Experience",
        distance: "10 Kms",
        phone: "9876543210",
        description: "Experienced in teaching mathematics and science with a focus on interactive learning.",
        image: "/assets/DP/dp1.jpg", // Placeholder image for Alice
        type: ['online', 'offline', 'individual']
      },
      {
        name: "Bob Johnson", 
        location: "Delhi, India",
        experience: "8 Year Experience",
        distance: "15 Kms",
        phone: "7890123456",
        description: "Expert in English and History, ensuring students excel in academics.",
        image: "/assets/DP/dp2.jpg", // Placeholder image for Bob
        type: ['online', 'group']
      },
      {
        name: "Charlie Smith",
        location: "Mumbai, Maharashtra, India", 
        experience: "3 Year Experience",
        distance: "12 Kms",
        phone: "6543210987",
        description: "Specialized in computer science and coding with a practical approach to problem-solving.",
        image: "/assets/DP/dp3.jpg", // Placeholder image for Charlie
        type: ['offline', 'individual']
      },
      {
        name: "Charlie Smith",
        location: "Mumbai, Maharashtra, India",
        experience: "3 Year Experience", 
        distance: "12 Kms",
        phone: "6543210987",
        description: "Specialized in computer science and coding with a practical approach to problem-solving.",
        image: "/assets/DP/dp4.jpg", // Placeholder image for Charlie
        type: ['online', 'group']
      },
    ],
  };

  const filteredTeachers = teacherData.teachers.filter(teacher => {
    if (filterType === 'all') return true;
    return teacher.type.includes(filterType.toLowerCase());
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-[#EBECFF]">
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
          onClick={() => navigate('/app')}
        />
      </header>
      <div className="py-2 flex justify-center bg-[#EBECFF]">
        <div className="flex space-x-4 overflow-x-auto">
          <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-md ${filterType === 'all' ? 'bg-purple-800 text-white' : 'bg-white text-purple-800'} hover:bg-gray-200`}
          >
            All
          </button>
          <button 
            onClick={() => setFilterType('online')}
            className={`px-4 py-2 rounded-md ${filterType === 'online' ? 'bg-purple-800 text-white' : 'bg-white text-purple-800'} hover:bg-gray-200`}
          >
            Online
          </button>
          <button 
            onClick={() => setFilterType('offline')}
            className={`px-4 py-2 rounded-md ${filterType === 'offline' ? 'bg-purple-800 text-white' : 'bg-white text-purple-800'} hover:bg-gray-200`}
          >
            Offline
          </button>
          <button 
            onClick={() => setFilterType('individual')}
            className={`px-4 py-2 rounded-md ${filterType === 'individual' ? 'bg-purple-800 text-white' : 'bg-white text-purple-800'} hover:bg-gray-200`}
          >
            Individual
          </button>
          <button 
            onClick={() => setFilterType('group')}
            className={`px-4 py-2 rounded-md ${filterType === 'group' ? 'bg-purple-800 text-white' : 'bg-white text-purple-800'} hover:bg-gray-200`}
          >
            Group
          </button>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2 ml-4 md:ml-[370px]">Recommended Teachers</h2>
      <main className="flex-grow flex flex-col items-center mt-2 bg-[#EBECFF]">
        <div className="grid grid-cols-1 gap-4 px-4">
          {filteredTeachers.map((teacher, index) => (
            <TeacherCard key={index} {...teacher} />
          ))}
        </div>
      </main>
    </div>
  );
};

const TeacherCard = ({ name, location, experience, distance, phone, description, image }) => {
  const [showMessage, setShowMessage] = useState(false);

  const handleConnect = () => {
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  return (
    <div
      className="bg-white rounded-md p-4 shadow-md flex flex-col md:flex-row justify-between items-center relative w-full md:w-[974px] h-auto md:h-[200px]"
    >
      {/* Left section: Image */}
      <div className="flex items-center mb-4 md:mb-0">
        <img
          src={image}
          alt={name}
          className="w-24 h-24 rounded-md object-cover mr-4"
        />
      </div>

      {/* Middle section: Details */}
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-gray-600 mb-1">{location}</p>
        <p className="text-gray-600 mb-2">{description}</p>
      </div>

      {/* Right section: Additional Info */}
      <div className="text-center md:text-right flex flex-col items-center md:items-end ml-4">
        <p className="text-gray-600 mb-1">{experience}</p>
        <p className="text-gray-600 mb-1">{distance}</p>
        <p className="text-gray-600 mb-2">{phone}</p>
        <button 
          onClick={handleConnect}
          className="bg-purple-800 text-white px-4 py-2 rounded-md hover:bg-purple-700 mt-2"
        >
          Connect
        </button>
      </div>

      {/* Popup Message */}
      {showMessage && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          Connection message sent successfully! After a review you can expect a callback !!
        </div>
      )}
    </div>
  );
};

export default TuitionFinder;
