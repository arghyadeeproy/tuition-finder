import React from "react";
import { Link } from "lucide-react";

const ProfileDashboard = () => {
  const timeSlots = ["Morning", "Afternoon", "Evening"];
  const groupTypes = ["Individual", "Group", "Any"];
  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="h-screen w-screen flex flex-col" style={{ backgroundColor: "#EBECFF" }}>
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-4 bg-indigo-800">
        <div className="text-white text-2xl">Star Educators</div>
        <div className="flex items-center gap-4">
          <span className="text-white">Amit Kundu</span>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm">AK</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex justify-center items-start overflow-auto">
        <div className="grid grid-cols-[1fr_2fr_0.8fr] gap-6 max-w-7xl w-full p-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Account Details</h2>
              </div>
              <div className="p-4">
                <div className="flex justify-center mb-6">
                  <img 
                    src="/assets/DP/dp3.jpg"
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Personal Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">DOB</span>
                      <span>00/00/0000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile Number</span>
                      <span>9876543210</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Alternate Number</span>
                      <span>8976543210</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email ID</span>
                      <span>qq@aa.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender</span>
                      <span>Male</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marital Status</span>
                      <span>Single</span>
                    </div>
                  </div>

                  <h3 className="font-semibold pt-4">Educational Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Highest Qualification</span>
                      <span>Graduation</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">School</span>
                      <span>DPS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">College</span>
                      <span>Ashutosh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">University</span>
                      <span>CU</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Of Graduation</span>
                      <span>00/00/0000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Bio</h2>
                <button className="text-sm px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">
                  Edit
                </button>
              </div>
              <div className="p-4">
                <p className="text-gray-500 italic">
                  Add a small paragraph about yourself, this will be visible to
                  students seeking guidance.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Other Details</h2>
              </div>
              <div className="p-4">
                <div className="min-h-[200px]"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Date & Time Preferences</h2>
                <button className="text-sm px-3 py-1 rounded border border-gray-200 hover:bg-gray-50">
                  Edit
                </button>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {weekDays.map((day) => (
                    <div key={day} className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded px-3 py-1 text-sm">
                        {day}
                      </div>
                      <div className="flex gap-2">
                        {timeSlots.map((slot) => (
                          <div
                            key={slot}
                            className="bg-gray-100 rounded px-3 py-1 text-sm"
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {groupTypes.map((type) => (
                          <div
                            key={type}
                            className="bg-gray-100 rounded px-3 py-1 text-sm"
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Verifications</h2>
              </div>
              <div className="p-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">
                      Link Govt. Documents (At least one)
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Aadhar Card</span>
                        <span>1234 7865 9879</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">PAN</span>
                        <span>B768WDRF9</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drivers License</span>
                        <span>GF564FG88809</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Social Media</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Facebook</span>
                        <Link className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Whatsapp</span>
                        <span className="text-blue-500">9876543210.wa.me</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Twitter (X)</span>
                        <Link className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Linked In</span>
                        <Link className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileDashboard;