import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/LoginPage";
import LearningTracker from "./components/LearningTracker";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import Roadmap from "./Pages/Roadmap";
import Home from "./Pages/Home";
import Leaderboard from "./components/Leaderboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Show loading state while auth state is being determined
  if (loading) {
    return (
      <div className="loading">
        <p>Initializing App...</p>
      </div>
    );
  }

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={<Home />} />
        
        {/* Protected routes */}
        <Route
          path="/tracker"
          element={user ? <LearningTracker user={user} /> : <Navigate to="/login" />}
        />
        <Route 
          path="/roadmap" 
          element={user ? <Roadmap /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/leaderboard" 
          element={user ? <Leaderboard /> : <Navigate to="/login" />} 
        />
        
        {/* Fallback route - redirects to home if no match */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
      <Chatbot />
    </Router>
  );
}