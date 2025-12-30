"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import FixedHeader from "@/components/FixedHeader";
import BottomNavbar from "@/components/BottomNavbar";
import WishlistToast from "@/components/WishlistToast";
import CartToast from "@/components/CartToast";
import HeroBannerSection from "@/components/HeroBannerSection";
import HeroSection from "@/components/HeroSection";
import ProductsSection from "@/components/ProductsSection";
import PosterSection from "@/components/PosterSection";
import CountdownBanner from "@/components/CountdownBanner";

interface SectionConfig {
  id: string;
  type: string;
  enabled: boolean;
  order: number;
  category?: string;
  imageType?: string;
}

export default function Home() {
  const router = useRouter();
  const [sectionsConfig, setSectionsConfig] = useState<SectionConfig[]>([]);

  useEffect(() => {
    // Load sections config from API
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/config/homepage");
        if (response.ok) {
          const data = await response.json();
          if (data.sections && Array.isArray(data.sections)) {
            setSectionsConfig(data.sections);
          }
        }
      } catch (error) {
        console.error("Error loading config:", error);
        // If config fails to load, show all sections by default
        setSectionsConfig([]);
      }
    };

    loadConfig();
  }, []);

  const handleWishlistClick = () => {
    const isAuthenticated =
      localStorage.getItem("Inkhubuthenticated") === "true";
    if (isAuthenticated) {
      router.push("/wishlist");
    } else {
      router.push("/profile");
    }
  };

  const handleProductWishlistClick = () => {
    router.push("/profile");
  };

  const handleAccountClick = () => {
    router.push("/profile");
  };

  // Check if a section is enabled
  const isSectionEnabled = (
    id: string,
    type: string,
    category?: string,
    imageType?: string
  ): boolean => {
    if (sectionsConfig.length === 0) return true; // Show all if config not loaded

    const section = sectionsConfig.find((s) => {
      if (s.id === id) return true;
      if (s.type === type && s.category === category) return true;
      if (s.type === type && s.imageType === imageType) return true;
      return false;
    });

    return section ? section.enabled !== false : true; // Default to enabled if not found
  };

  // Define the sections - using exact category names from Categories page
  const categorySections = [
    { id: "spiritual", type: "products", category: "Spiritual Collection" },
    { id: "poster-anime", type: "poster", imageType: "anime" as const },
    { id: "love-couple", type: "products", category: "Love & Couple Tattoos" },
    { id: "poster-japanese", type: "poster", imageType: "japanese" as const },
    { id: "anime-pop", type: "products", category: "Anime & Pop Tattoos" },
    { id: "animal", type: "products", category: "Animal Tattoos" },
    { id: "countdown", type: "countdown" },
    { id: "minimal", type: "products", category: "Minimal Tattoos" },
    { id: "bold-dark", type: "products", category: "Bold & Dark Tattoos" },
    { id: "tattoo-packs", type: "products", category: "Tattoos Packs" },
    {
      id: "body-placement",
      type: "products",
      category: "Body Placement Tattoos",
    },
    { id: "size-type", type: "products", category: "Tattoos Size & Type" },
  ];

  const heroBannerEnabled = isSectionEnabled("hero-banner", "hero-banner");
  const heroSectionEnabled = isSectionEnabled("hero-section", "hero-section");
  const allTattoosEnabled = isSectionEnabled(
    "all-tattoos",
    "products",
    "All Tattoos"
  );

  return (
    <div className="home-page">
      <WishlistToast />
      <CartToast />
      <FixedHeader
        onWishlistClick={handleWishlistClick}
        onAccountClick={handleAccountClick}
      />
      <main className="main-content">
        {(heroBannerEnabled || heroSectionEnabled) && (
          <div data-section-id="hero">
            {heroBannerEnabled && <HeroBannerSection />}
            {heroSectionEnabled && <HeroSection />}
          </div>
        )}

        {/* Display each category section once */}
        {categorySections.map((section, index) => {
          const enabled = isSectionEnabled(
            section.id,
            section.type,
            section.category,
            section.imageType
          );
          if (!enabled) return null;

          return (
            <React.Fragment key={`section-${index}`}>
              {section.type === "products" ? (
                <div data-section-id="featured">
                  <ProductsSection
                    onWishlistClick={handleProductWishlistClick}
                    categoryTitle={section.category}
                  />
                </div>
              ) : section.type === "countdown" ? (
                <CountdownBanner />
              ) : (
                <PosterSection imageType={section.imageType} />
              )}
            </React.Fragment>
          );
        })}

        {/* All products section at the end - without category titles */}
        {allTattoosEnabled && (
          <div data-section-id="featured">
            <ProductsSection
              onWishlistClick={handleProductWishlistClick}
              categoryTitle="All Tattoos"
              hideCategoryImage={true}
            />
          </div>
        )}
      </main>
      <BottomNavbar />
    </div>
  );
}
