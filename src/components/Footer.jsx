import React, { useEffect, useState } from "react";

function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      setDeferredPrompt(null);
      setShowInstallButton(false);
    });
  };

  return (
    <footer className="solo-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-info">
            <div className="footer-logo">
              <span className="logo-text">SOLO</span>
              <span className="logo-highlight">LEARNER</span>
            </div>
            <p className="footer-description">
              Track your learning journey, gain experience, and level up your
              skills.
            </p>
            {showInstallButton && (
              <button className="install-button" onClick={handleInstallClick}>
                Install App
              </button>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; 2025 Solo Learner. All rights reserved.
          </div>
          <div className="footer-social">
            {/* Social icons kept unchanged */}
            {/* You can remove them if not needed */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
