import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("points"); // Default sort by points
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const db = getDatabase();
        const usersRef = ref(db, "users");
        
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Transform data into array format suitable for leaderboard
            const usersArray = Object.entries(data).map(([userId, userData]) => {
              // Extract email from userId (reverse the sanitization)
              const email = userId.replace(/_/g, ".").replace(/_(.*?)_/g, "@$1.");
              
              // Default values in case stats are missing
              const points = userData.stats?.totalPoints || 0;
              const streak = userData.stats?.streak || 0;
              const level = userData.stats?.level || 1;
              const entriesCount = userData.entries ? Object.keys(userData.entries).length : 0;
              
              // Get user display name or use email
              const displayName = userData.profile?.displayName || email.split('@')[0];
              const photoURL = userData.profile?.photoURL || null;
              
              return {
                userId,
                email,
                displayName,
                photoURL,
                points,
                streak,
                level,
                entriesCount
              };
            });
            
            setLeaderboardData(usersArray);
          } else {
            setLeaderboardData([]);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  // Sort the leaderboard data based on the selected filter
  const sortedData = [...leaderboardData].sort((a, b) => {
    if (filter === "points") return b.points - a.points;
    if (filter === "streak") return b.streak - a.streak;
    if (filter === "level") return b.level - a.level;
    if (filter === "entries") return b.entriesCount - a.entriesCount;
    return 0;
  });

  // Find the current user's rank
  const getCurrentUserRank = () => {
    if (!currentUser) return null;
    
    const currentUserEmail = currentUser.email;
    const userIndex = sortedData.findIndex(user => user.email === currentUserEmail);
    
    if (userIndex === -1) return null;
    return {
      rank: userIndex + 1,
      total: sortedData.length
    };
  };

  const userRank = getCurrentUserRank();

  return (
    <div className="leaderboard">
      <div className="cyber-notification">
        <div className="leaderboard-header">
          <h2>Global Leaderboard</h2>
          <p>Compare your progress with other users</p>
        </div>
        
        <div className="leaderboard-filters">
          <p>Sort by:</p>
          <div className="filter-buttons">
            <button 
              className={filter === "points" ? "active-button" : ""} 
              onClick={() => setFilter("points")}
            >
              Points
            </button>
            <button 
              className={filter === "streak" ? "active-button" : ""} 
              onClick={() => setFilter("streak")}
            >
              Streak
            </button>
            <button 
              className={filter === "level" ? "active-button" : ""} 
              onClick={() => setFilter("level")}
            >
              Level
            </button>
            <button 
              className={filter === "entries" ? "active-button" : ""} 
              onClick={() => setFilter("entries")}
            >
              Activities
            </button>
          </div>
        </div>

        {userRank && (
          <div className="user-rank-highlight">
            <div className="rank-info">
              <p>Your Rank: <span>{userRank.rank}</span> of {userRank.total}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="leaderboard-loading">
            <p>Loading leaderboard data...</p>
          </div>
        ) : (
          <div className="leaderboard-table">
            <div className="leaderboard-header-row">
              <div className="rank-column">Rank</div>
              <div className="user-column">User</div>
              <div className="stats-column">
                {filter === "points" && "Points"}
                {filter === "streak" && "Streak"}
                {filter === "level" && "Level"}
                {filter === "entries" && "Activities"}
              </div>
            </div>

            {sortedData.length > 0 ? (
              sortedData.map((user, index) => {
                const isCurrentUser = currentUser && user.email === currentUser.email;
                return (
                  <div 
                    key={user.userId} 
                    className={`leaderboard-row ${isCurrentUser ? "current-user" : ""}`}
                  >
                    <div className="rank-column">
                      {index + 1}
                      {index < 3 && (
                        <span className={`rank-badge rank-${index + 1}`}>
                          {index === 0 && "🥇"}
                          {index === 1 && "🥈"}
                          {index === 2 && "🥉"}
                        </span>
                      )}
                    </div>
                    <div className="user-column">
                      {user.photoURL && (
                        <img src={user.photoURL} alt="User" className="user-avatar" />
                      )}
                      <span className="user-name">{user.displayName}</span>
                    </div>
                    <div className="stats-column">
                      {filter === "points" && (
                        <span>{user.points} pts</span>
                      )}
                      {filter === "streak" && (
                        <span>{user.streak} days 🔥</span>
                      )}
                      {filter === "level" && (
                        <span>Level {user.level}</span>
                      )}
                      {filter === "entries" && (
                        <span>{user.entriesCount} activities</span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-entries">
                <p>No users found. Be the first to join the leaderboard!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;