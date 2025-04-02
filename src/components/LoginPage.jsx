import React from "react";
import { signInWithGoogle } from "../firebase";

export default function Login() {
  return (
    <div className="login-container">
      <h2>Sign in to Access Learning Tracker</h2>
      <button className="google-button" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
}