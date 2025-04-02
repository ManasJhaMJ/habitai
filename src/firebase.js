import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase, ref, set, push, get, onValue } from "firebase/database";

// 🔹 Firebase Configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.AUTH_DOMAIN ,
    databaseURL: process.env.DATABASE_URL ,
    projectId: process.env.PROJECT_ID ,
    storageBucket: process.env.STORAGE_BUCKET ,
    messagingSenderId: process.env.MESSAGING_SENDER_ID ,
    appId: process.env.APP_ID ,
    measurementId: process.env.MEASUREMENT_ID  
};

// 🔹 Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);

// 🔹 Helper function to sanitize emails for Firebase keys
const sanitizeEmail = (email) => {
    return email.replace(/[@.]/g, "_");  // Replace @ and . with _
};

// 🔹 Google Sign-In
const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const email = result.user.email; 
        return email; 
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

// 🔹 Save Learning Entry (using sanitized email instead of UID)
const saveLearningEntry = async (email, entry) => {
    try {
        const userId = sanitizeEmail(email);
        const userEntriesRef = ref(database, `users/${userId}/entries`);
        await push(userEntriesRef, entry);
    } catch (error) {
        console.error("Error saving entry:", error);
    }
};

// 🔹 Fetch Learning Entries
const fetchLearningEntries = async (email, setEntries) => {
    const userId = sanitizeEmail(email);
    const userEntriesRef = ref(database, `users/${userId}/entries`);
    onValue(userEntriesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const entriesArray = Object.values(data);
            setEntries(entriesArray.reverse());
        } else {
            setEntries([]);
        }
    });
};

// 🔹 Save User Stats (Points, Streaks)
const saveUserStats = async (email, stats) => {
    try {
        const userId = sanitizeEmail(email);
        await set(ref(database, `users/${userId}/stats`), stats);
    } catch (error) {
        console.error("Error saving stats:", error);
    }
};

// 🔹 Fetch User Stats
const fetchUserStats = async (email, setStats) => {
    const userId = sanitizeEmail(email);
    const userStatsRef = ref(database, `users/${userId}/stats`);
    onValue(userStatsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setStats(data);
    });
};

export { 
    auth, 
    signInWithGoogle, 
    logout, 
    database, 
    saveLearningEntry, 
    fetchLearningEntries, 
    saveUserStats, 
    fetchUserStats 
};