import React, { useState, useEffect } from "react";
import {
  auth,
  database,
  saveLearningEntry,
  fetchLearningEntries,
  fetchUserStats,
  saveUserStats,
} from "../firebase";
import { ref, onValue, set } from "firebase/database";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../geminiConfig";
import "./LearningTracker.css";
import LogoutButton from "./LogoutButton";
import Alert from "./Alert";

const LearningTracker = ({ user }) => {
  const [learningInput, setLearningInput] = useState("");
  const [entriesLeft, setEntriesLeft] = useState(3);
  const [learningHistory, setLearningHistory] = useState([]);
  const [userStats, setUserStats] = useState({
    streak: 0,
    longestStreak: 0,
    totalPoints: 0,
    level: 1,
    progress: 0,
    achievements: {
      firstEntry: false,
      streakMaster: false,
      knowledgeSeeker: false,
      dedicatedLearner: false,
    },
  });

  const [alertText, setAlertText] = useState("");
  const [geminiResponse, setGeminiResponse] = useState("");
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);

  useEffect(() => {
    if (!user) return;

    fetchLearningEntries(user.uid, setLearningHistory);
    fetchUserStats(user.uid, setUserStats);

    // Fetch daily entries left from Firebase
    const entriesRef = ref(database, `users/${user.uid}/dailyEntries`);
    onValue(entriesRef, (snapshot) => {
      const data = snapshot.val();
      const todayDate = new Date().toDateString();

      if (data && data.date === todayDate) {
        setEntriesLeft(data.entriesLeft);
      } else {
        // Only reset if no previous data exists for today
        const defaultEntries = 3;
        set(ref(database, `users/${user.uid}/dailyEntries`), {
          date: todayDate,
          entriesLeft: defaultEntries,
        });
        setEntriesLeft(defaultEntries);
      }
    });
  }, [user]);

  const showAlert = (message) => {
    setAlertText(message);
    setTimeout(() => setAlertText(""), 3000);
  };

  const getGeminiFeedback = async (learningEntry) => {
    try {
      setIsLoadingGemini(true);
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `As a learning coach, provide brief feedback and 1-2 specific suggestions to improve this skill/habit based on this learning journal entry: "${learningEntry}". Keep your response under 150 words, dont promote bad habits like long term gaming or gambling and dont use Markdown.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setGeminiResponse(text);
    } catch (error) {
      console.error("Error getting Gemini feedback:", error);
      setGeminiResponse("Unable to generate suggestions at this time. Please try again later.");
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const handleLearningSubmit = async () => {
    if (!user) return;
    if (!learningInput.trim() || entriesLeft === 0) return;

    const newEntry = { text: learningInput, timestamp: new Date().toISOString() };
    await saveLearningEntry(user.uid, newEntry);

    showAlert("Entry added successfully!");

    // Get Gemini feedback
    await getGeminiFeedback(learningInput);

    // Update streak
    const updatedStats = { ...userStats };
    const lastEntryDate = learningHistory.length > 0 
        ? new Date(learningHistory[learningHistory.length - 1].timestamp).toDateString() 
        : null;
    const todayDate = new Date().toDateString();

    if (lastEntryDate !== todayDate) {
        updatedStats.streak += 1;
    }

    if (updatedStats.streak > updatedStats.longestStreak) {
        updatedStats.longestStreak = updatedStats.streak;
    }

    updatedStats.totalPoints += 10;
    updatedStats.progress += 10;
    if (updatedStats.progress >= 100) {
        updatedStats.level += 1;
        updatedStats.progress = 0;
    }

    updatedStats.achievements.firstEntry = true;
    if (updatedStats.streak >= 7) updatedStats.achievements.streakMaster = true;
    if (updatedStats.level >= 5) updatedStats.achievements.knowledgeSeeker = true;
    if (learningHistory.length + 1 >= 50) updatedStats.achievements.dedicatedLearner = true;

    await saveUserStats(user.uid, updatedStats);

    // Decrease entry count and save in Firebase
    const newEntriesLeft = entriesLeft - 1;
    await set(ref(database, `users/${user.uid}/dailyEntries`), {
        date: todayDate,
        entriesLeft: newEntriesLeft
    });

    setEntriesLeft(newEntriesLeft);
    setLearningInput("");
  };

  return (
    <section>
      <div className="learning-tracker">
        <div className="stats-container cyber-notification">
          <div className="stat-box glass">Current Streak: {userStats.streak} days</div>
          <div className="stat-box glass">
            Longest Streak: {userStats.longestStreak} days
          </div>
          <div className="stat-box glass">Total Points: {userStats.totalPoints}</div>
        </div>
        <div className="learning-input cyber-notification">
          <textarea
            placeholder="What did you learn today?"
            value={learningInput}
            onChange={(e) => setLearningInput(e.target.value)}
          />
          <button onClick={handleLearningSubmit} disabled={entriesLeft === 0}>
            Record Learning (+10 Points)
          </button>
          <p>{entriesLeft} entries left today</p>
        </div>
        
        {/* New Gemini AI Feedback Section */}
        {(isLoadingGemini || geminiResponse) && (
          <div className="ai-feedback cyber-notification">
            <h3>AI Learning Coach</h3>
            {isLoadingGemini ? (
              <p>Generating personalized feedback...</p>
            ) : (
              <div className="feedback-content">
                <p>{geminiResponse}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="level-container cyber-notification">
          <p>Level {userStats.level}</p>
          <p>{userStats.totalPoints} points</p>
          <progress value={userStats.progress} max="100"></progress>
          <p>Next Level: {userStats.level + 1}</p>
        </div>
        <div className="achievements cyber-notification">
          <h3>Achievements</h3>
          <div
            className={`achievement ${
              userStats.achievements.firstEntry ? "achieved" : ""
            }`}
          >
            <h3>First Entry</h3>
            <p>Enter your first learning entry</p>
          </div>
          <div
            className={`achievement ${
              userStats.achievements.streakMaster ? "achieved" : ""
            }`}
          >
            <h3>Streak Master</h3>
            <p>Maintain a 7 day learning streak</p>
          </div>
          <div
            className={`achievement ${
              userStats.achievements.knowledgeSeeker ? "achieved" : ""
            }`}
          >
            <h3>Knowledge Seeker</h3>
            <p>Reach level 5</p>
          </div>
          <div
            className={`achievement ${
              userStats.achievements.dedicatedLearner ? "achieved" : ""
            }`}
          >
            <h3>Dedicated Learner</h3>
            <p>Record 50 learning entries</p>
          </div>
        </div>
        <div className="learning-history cyber-notification">
          <h3>Learning History</h3>
          {learningHistory.map((entry, index) => (
            <div key={index} className="entry">
              <p>{new Date(entry.timestamp).toLocaleDateString()}</p>
              <p>{entry.text}</p>
              <p>{new Date(entry.timestamp).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
        <LogoutButton />
        <Alert message={alertText} />
      </div>
    </section>
  );
};

export default LearningTracker;