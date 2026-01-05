"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";
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
  // PERF: Track which sections should be rendered (for deferred loading)
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set([0, 1, 2])); // Load first 3 sections immediately
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // PERF: Define category sections as constant (doesn't depend on state/props)
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

  useEffect(() => {
    // PERF: Load sections config from API (defer non-critical)
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
        setSectionsConfig([]);
      }
    };

    // PERF: Defer config loading until after first paint
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadConfig();
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        loadConfig();
      }, 100);
    }
  }, []);

  // PERF: IntersectionObserver to load sections as they become visible
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback: show all sections if IntersectionObserver not available
      setVisibleSections(new Set(categorySections.map((_, i) => i)));
      return;
    }

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const sectionIndex = parseInt(
                entry.target.getAttribute("data-section-index") || "0"
              );
              setVisibleSections((prev) => new Set([...prev, sectionIndex]));
            }
          });
        },
        { rootMargin: "300px 0px" } // PERF: Start loading 300px before section becomes visible
      );
    }

    // Observe all section containers
    Object.keys(sectionRefs.current).forEach((key) => {
      const index = parseInt(key);
      if (sectionRefs.current[index] && !visibleSections.has(index)) {
        observerRef.current?.observe(sectionRefs.current[index]!);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [categorySections.length, visibleSections]);

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

        {/* PERF: Display each category section with deferred loading */}
        {categorySections.map((section, index) => {
          const enabled = isSectionEnabled(
            section.id,
            section.type,
            section.category,
            section.imageType
          );
          if (!enabled) return null;

          const shouldRender = visibleSections.has(index);

          return (
            <div
              key={`section-${index}`}
              ref={(el) => {
                if (el) sectionRefs.current[index] = el;
              }}
              data-section-index={index}
              data-section-id="featured"
            >
              {shouldRender ? (
                section.type === "products" ? (
                  <ProductsSection
                    onWishlistClick={handleProductWishlistClick}
                    categoryTitle={section.category}
                  />
                ) : section.type === "countdown" ? (
                  <CountdownBanner />
                ) : (
                  <PosterSection imageType={section.imageType} />
                )
              ) : (
                // PERF: Placeholder to maintain layout and trigger intersection observer
                <div style={{ minHeight: "200px" }} />
              )}
            </div>
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
