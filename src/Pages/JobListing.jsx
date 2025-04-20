import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const TuitionFinder = () => {
  const navigate = useNavigate();
  
  return (
    <div className="h-screen w-screen flex flex-col bg-[#EBECFF]">
      {/* Navbar - Unblurred */}
      <header className="bg-[#4527a0] text-white p-4 flex items-center z-10" style={{height: '201px'}}>
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

      {/* Blurred content with "Under Construction" message */}
      <div className="relative flex-grow">
        {/* Construction message */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-white/80 px-8 py-4 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-purple-800">Under Construction</h1>
          </div>
        </div>

        {/* Blurred content */}
        <div className="absolute inset-0 backdrop-blur-md">
          {/* Original content structure but blurred */}
          <div className="py-2 flex justify-center">
            <div className="flex space-x-4 overflow-x-auto">
              <button className="px-4 py-2 rounded-md bg-white text-purple-800">Online</button>
              <button className="px-4 py-2 rounded-md bg-white text-purple-800">Later</button>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2 ml-4 md:ml-[370px]">Job Listing</h2>
          
          <main className="flex-grow flex flex-col items-center mt-2">
            <div className="grid grid-cols-1 gap-4 px-4">
              {/* Placeholder cards */}
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="bg-white rounded-md p-4 shadow-md w-full md:w-[974px] h-[200px]" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default TuitionFinder;