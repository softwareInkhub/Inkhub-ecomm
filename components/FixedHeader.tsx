"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LocationModal from "./LocationModal";

interface FixedHeaderProps {
  onWishlistClick?: () => void;
  onAccountClick?: () => void;
}

const FixedHeader: React.FC<FixedHeaderProps> = ({
  onWishlistClick,
  onAccountClick,
}) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated =
        localStorage.getItem("Bagichaauthenticated") === "true";
      setIsAuthenticated(authenticated);
    };

    checkAuth();

    // Listen for authentication changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChanged", handleAuthChange);
    // Also check on focus in case localStorage changed in another tab
    window.addEventListener("focus", checkAuth);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChanged", handleAuthChange);
      window.removeEventListener("focus", checkAuth);
    };
  }, []);

  const handleAccountClick = () => {
    if (isAuthenticated) {
      // Navigate to profile page
      router.push("/profile");
    } else {
      // Login
      if (onAccountClick) {
        onAccountClick();
      }
    }
  };

  return (
    <>
      <header className="fixed-header" role="banner">
        <div className="header-content">
          <div className="delivery-info">
            <p className="delivery-text">
              Delivery in <span className="highlight">60 minutes</span>
            </p>
            <div
              className="address-wrapper"
              onClick={() => setShowLocationModal(true)}
            >
              <span className="address">Shreepal Complex, Suren R...</span>
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="header-icons">
            <button
              className="icon-btn"
              aria-label="Search"
              onClick={() => router.push("/search")}
            >
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button
              className="icon-btn"
              aria-label="Wishlist"
              onClick={onWishlistClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#e8e8e8" viewBox="0 0 256 256"><path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z"></path></svg>
            </button>
            <button
              className="icon-btn account-icon-btn"
              aria-label={
                isAuthenticated ? "Account (Profile)" : "Account (Login)"
              }
              onClick={handleAccountClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-circle-user-round-icon lucide-circle-user-round"
              >
                <path d="M18 20a6 6 0 0 0-12 0" />
                <circle cx="12" cy="10" r="4" />
                <circle cx="12" cy="12" r="10" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
};

export default FixedHeader;
