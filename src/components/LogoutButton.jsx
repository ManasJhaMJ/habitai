import React from "react";
import { auth } from "../firebase"; 
import { signOut } from "firebase/auth";

const LogoutButton = () => {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User logged out successfully!");
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    };

    return (
        <button onClick={handleLogout} className="logout-button">
            Logout
        </button>
    );
};

export default LogoutButton;