import { useState, useEffect } from 'react';
import { Clock, Wrench, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  const [timeLeft, setTimeLeft] = useState('');
  const maintenanceEndTime = new Date(2025, 3, 25, 18, 0); // April 25, 2025 at 6:00 PM
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = maintenanceEndTime - new Date();
      if (difference <= 0) {
        setTimeLeft("We should be back now! Please refresh the page.");
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Function to handle refresh button click
  const handleRefresh = () => {
    window.location.reload();
  };
  
  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-blue-200 opacity-30"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-blue-300 opacity-20"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full bg-blue-100 opacity-40"></div>
      </div>
      <div className="absolute top-0 left-0 w-full p-6">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-blue-800">Star Educators</h2>
        </div>
      </div>
      <div className="max-w-3xl w-full text-center z-10 px-4">
        <div className="mb-8">
          <div className="bg-white/50 backdrop-blur p-6 rounded-full inline-block mb-6 shadow-lg">
            <Wrench className="text-blue-600 w-16 h-16" />
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Under Maintenance</h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            We're currently improving our site to serve you better. Thanks for your patience.
          </p>
        </div>
        
        <div className="bg-white/70 backdrop-blur rounded-2xl p-8 mb-10 shadow-lg">
          <div className="flex items-center justify-center mb-4">
            <Clock className="text-blue-600 mr-3 w-6 h-6" />
            <h2 className="text-2xl font-semibold text-gray-800">We'll be back by:</h2>
          </div>
          
          <p className="text-3xl text-blue-800 font-bold mb-6">April 25, 2025 at 6:00 PM</p>
          
          <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
            {timeLeft.split(' ').map((unit, index) => (
              <div key={index} className="bg-blue-600 rounded-lg p-3 text-white shadow-md transform hover:scale-105 transition-transform">
                <div className="text-3xl font-mono font-bold mb-1">
                  {unit.slice(0, -1)}
                </div>
                <div className="text-xs uppercase">
                  {unit.slice(-1) === 'd' ? 'Days' : 
                   unit.slice(-1) === 'h' ? 'Hours' : 
                   unit.slice(-1) === 'm' ? 'Minutes' : 'Seconds'}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 text-center text-gray-600">
        <p>© 2025 YourCompany. All rights reserved.</p>
      </div>
      </div>
      </div>
  );
}