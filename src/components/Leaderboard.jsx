import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { auth } from "../firebase";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("totalPoints"); // Default sort by points
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
              // Get profile data
              const profile = userData.profile || {};
              // Get stats data
              const stats = userData.stats || {};
              
              return {
                userId,
                displayName: profile.displayName || "Unknown User",
                photoURL: profile.photoURL || null,
                email: profile.email || null,
                totalPoints: stats.totalPoints || 0,
                streak: stats.streak || 0,
                level: stats.level || 1,
                entriesCount: stats.entriesCount || 0
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
    if (filter === "totalPoints") return b.totalPoints - a.totalPoints;
    if (filter === "streak") return b.streak - a.streak;
    if (filter === "level") return b.level - a.level;
    if (filter === "entriesCount") return b.entriesCount - a.entriesCount;
    return 0;
  });

  // Find the current user's rank
  const getCurrentUserRank = () => {
    if (!currentUser) return null;
    
    const userIndex = sortedData.findIndex(user => user.userId === currentUser.uid);
    
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
              className={filter === "totalPoints" ? "active-button" : ""} 
              onClick={() => setFilter("totalPoints")}
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
              className={filter === "entriesCount" ? "active-button" : ""} 
              onClick={() => setFilter("entriesCount")}
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
                {filter === "totalPoints" && "Points"}
                {filter === "streak" && "Streak"}
                {filter === "level" && "Level"}
                {filter === "entriesCount" && "Activities"}
              </div>
            </div>

            {sortedData.length > 0 ? (
              sortedData.map((user, index) => {
                const isCurrentUser = currentUser && user.userId === currentUser.uid;
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
                      {filter === "totalPoints" && (
                        <span>{user.totalPoints} pts</span>
                      )}
                      {filter === "streak" && (
                        <span>{user.streak} days 🔥</span>
                      )}
                      {filter === "level" && (
                        <span>Level {user.level}</span>
                      )}
                      {filter === "entriesCount" && (
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