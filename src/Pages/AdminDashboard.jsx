import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
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
  BellIcon,
  UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  const busyHoursData = [
    { name: '8am-12pm', school: 40, college: 24, working: 35 },
    { name: '12pm-4pm', school: 30, college: 40, working: 22 },
    { name: '4pm-8pm', school: 20, college: 38, working: 30 },
    { name: '8pm-12am', school: 27, college: 39, working: 45 },
  ];

  const classTypeData = [
    { name: 'Online', value: 45 },
    { name: 'Offline', value: 35 },
    { name: 'Mix', value: 20 },
  ];

  const mostSearchedData = [
    { subject: 'Physics', value: 65 },
    { subject: 'Math', value: 12 },
    { subject: 'English', value: 60 },
    { subject: 'History', value: 48 },
    { subject: 'Chemistry', value: 72 },
    { subject: 'Biology', value: 45 },
    { subject: 'Computer', value: 68 },
    { subject: 'Hindi', value: 70 },
    { subject: 'Sanskrit', value: 85 }
  ];

  const industryJobData = [
    { time: '8am-12pm', school: 15, college: 12, working: 35 },
    { time: '12pm-4pm', school: 0, college: 42, working: 45 },
    { time: '4pm-8pm', school: 20, college: 25, working: 15 },
    { time: '8pm-12am', school: 12, college: 0, working: 42 }
  ];

  const hiringRatioData = [
    { name: 'Online', value: 45 },
    { name: 'Offline', value: 25 },
    { name: 'Mix', value: 30 }
  ];

  const COLORS = ['#36A2EB', '#FF6384', '#FFCE56'];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Star Educators</h1>
        </div>
        <nav className="space-y-2 flex-1">
          {[
            { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', active: true, onClick: () => navigate('/admin') },
            { icon: <Users className="w-5 h-5" />, label: 'Teachers', onClick: () => navigate('/Admin_Teacher') },
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
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-gray-600">An Overview for the month</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Teachers: 192</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-gray-600">Active Teachers</div>
                  <div className="text-2xl font-bold text-indigo-600">134</div>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Total Students: 2203</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-gray-600">Active Students</div>
                  <div className="text-2xl font-bold text-indigo-600">1898</div>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 mb-1">Active Job Posts: 23</div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-gray-600">Job Applications</div>
                  <div className="text-2xl font-bold text-indigo-600">148</div>
                </div>
                <BriefcaseIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Teaching Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Teaching</h3>
              <select className="p-2 border rounded-md">
                <option>January, 2025</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Offline vs Online Classes</h3>
                <div className="flex justify-center">
                  <PieChart width={400} height={300}>
                    <Pie
                      data={classTypeData}
                      cx={200}
                      cy={150}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {classTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Busy Hours</h3>
                <BarChart width={500} height={300} data={busyHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Bar dataKey="school" fill="#36A2EB" name="School Students" />
                  <Bar dataKey="college" fill="#FF6384" name="College Students" />
                  <Bar dataKey="working" fill="#FFCE56" name="Working Pro" />
                </BarChart>
              </div>
            </div>

            {/* Most Searched Subject Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-semibold mb-4">Most Searched Subject</h3>
              <BarChart width={1000} height={200} data={mostSearchedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>
          </div>

          {/* Jobs Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Jobs</h3>
              <select className="p-2 border rounded-md">
                <option>January, 2025</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Industry wise job postings</h3>
                <BarChart width={500} height={300} data={industryJobData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Bar dataKey="school" fill="#36A2EB" name="School Students" />
                  <Bar dataKey="college" fill="#FF6384" name="College Students" />
                  <Bar dataKey="working" fill="#FFCE56" name="Working Pro" />
                </BarChart>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Hiring Ratio</h3>
                <div className="flex justify-center">
                  <PieChart width={400} height={300}>
                    <Pie
                      data={hiringRatioData}
                      cx={200}
                      cy={150}
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {hiringRatioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-80 bg-white border-l h-screen overflow-auto">
        {/* Notifications */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <BellIcon className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-center">No new notifications</p>
            <p className="text-sm text-center">You're all caught up!</p>
          </div>
        </div>

        {/* Teacher Approvals */}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Teacher Approvals</h3>
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <UserIcon className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-center">No pending approvals</p>
            <p className="text-sm text-center">All teacher applications have been processed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;