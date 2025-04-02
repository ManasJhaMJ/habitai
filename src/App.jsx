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

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={<Home />} />
        
        {/* Protect /tracker route */}
        <Route
          path="/tracker"
          element={user ? <LearningTracker user={user} /> : <Navigate to="/login" />}
        />
        <Route path="/roadmap" element={!user ? <Navigate to="/login" /> : <Roadmap />} />
      </Routes>
      <Footer />
      <Chatbot />
    </Router>
  );
}