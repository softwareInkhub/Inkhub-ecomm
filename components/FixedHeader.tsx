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
        localStorage.getItem("Inkhubuthenticated") === "true";
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
                width="16"
                height="16"
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
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
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
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
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
                width="24"
                height="24"
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
