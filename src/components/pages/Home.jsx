import React from 'react';
import { Link, Navigate } from 'react-router-dom';

const Home = () => {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Malicious Content Detector
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Analyze and detect potentially harmful content across the web
      </p>
      <div className="space-x-4">
        <Link
          to="/login"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Home;