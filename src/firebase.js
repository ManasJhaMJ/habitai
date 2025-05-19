import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase, ref, set, push, get, onValue, query, orderByChild } from "firebase/database";

// 🔹 Firebase Configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

// 🔹 Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);

// 🔹 Google Sign-In
const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Always use Firebase UID as the primary identifier
        const userId = user.uid;
        
        // Save user profile information
        await set(ref(database, `users/${userId}/profile`), {
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
            email: user.email,
            uid: userId,
            lastLogin: new Date().toISOString()
        });
        
        // Initialize stats if they don't exist
        const statsRef = ref(database, `users/${userId}/stats`);
        const statsSnapshot = await get(statsRef);
        
        if (!statsSnapshot.exists()) {
            // Set default stats for new users
            await set(statsRef, {
                totalPoints: 0,
                streak: 0,
                level: 1,
                progress: 0,
                entriesCount: 0,
                lastActivity: new Date().toISOString(),
                achievements: {
                    firstEntry: false,
                    streakMaster: false,
                    knowledgeSeeker: false,
                    dedicatedLearner: false,
                }
            });
        }
        
        return user;
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        return null;
    }
};

// 🔹 Logout
const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// 🔹 Save Learning Entry
const saveLearningEntry = async (userId, entry) => {
    if (!userId) {
        console.error("No valid user ID provided");
        return;
    }
    
    try {
        const userEntriesRef = ref(database, `users/${userId}/entries`);
        const newEntryRef = await push(userEntriesRef, entry);
        
        // Update the user's stats after saving an entry
        await updateUserStats(userId);
        
        return newEntryRef.key;
    } catch (error) {
        console.error("Error saving entry:", error);
    }
};

// 🔹 Helper function to update user stats
const updateUserStats = async (userId) => {
    try {
        // Get current stats
        const userStatsRef = ref(database, `users/${userId}/stats`);
        const statsSnapshot = await get(userStatsRef);
        let currentStats = statsSnapshot.exists() ? statsSnapshot.val() : { 
            totalPoints: 0, 
            streak: 0, 
            level: 1,
            progress: 0,
            entriesCount: 0,
            achievements: {
                firstEntry: false,
                streakMaster: false,
                knowledgeSeeker: false,
                dedicatedLearner: false,
            }
        };
        
        // Get entries count
        const entriesRef = ref(database, `users/${userId}/entries`);
        const entriesSnapshot = await get(entriesRef);
        const entriesCount = entriesSnapshot.exists() ? Object.keys(entriesSnapshot.val()).length : 0;
        
        // Update entries count in stats
        currentStats.entriesCount = entriesCount;
        
        // Calculate streak
        const now = new Date();
        const lastActivity = currentStats.lastActivity ? new Date(currentStats.lastActivity) : null;
        let streak = currentStats.streak || 0;
        
        if (lastActivity) {
            const today = new Date().toDateString();
            const lastActivityDate = new Date(lastActivity).toDateString();
            
            // Check if last activity was today (ignore)
            if (lastActivityDate === today) {
                // Don't change streak for multiple entries on same day
            } 
            // Check if last activity was yesterday
            else {
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastActivityDate === yesterday.toDateString()) {
                    streak++; // Increment streak for consecutive days
                } else {
                    streak = 1; // Reset streak for gap in activity
                }
            }
        } else {
            streak = 1; // First activity
        }
        
        // Update streak and check for longest streak
        currentStats.streak = streak;
        currentStats.longestStreak = Math.max(streak, currentStats.longestStreak || 0);
        
        // Update points and level
        currentStats.totalPoints += 10; // Add points for new entry
        currentStats.progress += 10;
        
        // Level up if progress reaches threshold
        if (currentStats.progress >= 100) {
            currentStats.level += 1;
            currentStats.progress = currentStats.progress - 100;
        }
        
        // Update achievements
        currentStats.achievements = currentStats.achievements || {};
        currentStats.achievements.firstEntry = true; // Always true if they have an entry
        if (streak >= 7) currentStats.achievements.streakMaster = true;
        if (currentStats.level >= 5) currentStats.achievements.knowledgeSeeker = true;
        if (entriesCount >= 50) currentStats.achievements.dedicatedLearner = true;
        
        // Update last activity timestamp
        currentStats.lastActivity = now.toISOString();
        
        // Save updated stats
        await set(userStatsRef, currentStats);
        
        return currentStats;
    } catch (error) {
        console.error("Error updating stats:", error);
    }
};

// 🔹 Fetch Learning Entries
const fetchLearningEntries = async (userId, setEntries) => {
    if (!userId) {
        console.error("No valid user ID provided");
        setEntries([]);
        return;
    }
    
    const userEntriesRef = ref(database, `users/${userId}/entries`);
    onValue(userEntriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const entriesArray = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value
            }));
            setEntries(entriesArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } else {
            setEntries([]);
        }
    });
};

// 🔹 Save User Stats
const saveUserStats = async (userId, stats) => {
    if (!userId) {
        console.error("No valid user ID provided");
        return;
    }
    
    try {
        await set(ref(database, `users/${userId}/stats`), stats);
        return true;
    } catch (error) {
        console.error("Error saving stats:", error);
        return false;
    }
};

// 🔹 Fetch User Stats
const fetchUserStats = async (userId, setStats) => {
    if (!userId) {
        console.error("No valid user ID provided");
        setStats({
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
            }
        });
        return;
    }
    
    const userStatsRef = ref(database, `users/${userId}/stats`);
    onValue(userStatsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setStats(data);
        } else {
            setStats({
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
                }
            });
        }
    });
};

// 🔹 Fetch Global Leaderboard
const fetchLeaderboard = async (sortBy = "totalPoints", limit = 50) => {
    try {
        const usersRef = ref(database, "users");
        const snapshot = await get(usersRef);
        
        if (!snapshot.exists()) {
            return [];
        }
        
        const data = snapshot.val();
        const usersArray = Object.entries(data).map(([userId, userData]) => {
            // Get profile info
            const profile = userData.profile || {};
            // Get stats
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
        
        // Sort based on the selected criterion
        const sortedUsers = usersArray.sort((a, b) => {
            if (sortBy === "totalPoints") return b.totalPoints - a.totalPoints;
            if (sortBy === "streak") return b.streak - a.streak;
            if (sortBy === "level") return b.level - a.level;
            if (sortBy === "entriesCount") return b.entriesCount - a.entriesCount;
            return 0;
        });
        
        return sortedUsers.slice(0, limit);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
};

export { 
    auth, 
    signInWithGoogle, 
    logout, 
    database, 
    saveLearningEntry, 
    fetchLearningEntries, 
    saveUserStats, 
    fetchUserStats,
    fetchLeaderboard
};