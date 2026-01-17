"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import BottomNavbar from "@/components/BottomNavbar";
import { getProductsByCategory } from "@/lib/productsService";
import type { Product } from "@/types";
import Image from "next/image";

export default function CategoriesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All Tattoos");
  // PERF: Store products per category instead of all products
  const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
  const [loadingCategories, setLoadingCategories] = useState<Set<string>>(new Set());
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const categoryTitleRefs = useRef<Record<string, HTMLHeadingElement | null>>(
    {}
  );
  const sidebarItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sidebarRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const categoryObserverRef = useRef<IntersectionObserver | null>(null);
  const isScrollingToCategory = useRef(false);
  // PERF: Track which categories have been loaded to prevent duplicate fetches
  const loadedCategoriesRef = useRef<Set<string>>(new Set());
  const loadingPromisesRef = useRef<Record<string, Promise<void>>>({});

  // PERF: Load products for a specific category only when needed
  const loadCategoryProducts = useCallback(async (categoryName: string) => {
    // PERF: Skip if already loaded or currently loading
    if (loadedCategoriesRef.current.has(categoryName) || loadingCategories.has(categoryName)) {
      return;
    }

    // PERF: If a load is already in progress, wait for it
    const existingPromise = loadingPromisesRef.current[categoryName];
    if (existingPromise) {
      await existingPromise;
      return;
    }

    setLoadingCategories(prev => new Set(prev).add(categoryName));

    // PERF: Create and store the promise to prevent duplicate fetches
    const loadPromise = (async () => {
      try {
        const products = await getProductsByCategory(categoryName);
        setCategoryProducts(prev => ({
          ...prev,
          [categoryName]: products
        }));
        loadedCategoriesRef.current.add(categoryName);
      } catch (error) {
        console.error(`Error loading products for ${categoryName}:`, error);
        setCategoryProducts(prev => ({
          ...prev,
          [categoryName]: []
        }));
      } finally {
        setLoadingCategories(prev => {
          const next = new Set(prev);
          next.delete(categoryName);
          return next;
        });
        delete loadingPromisesRef.current[categoryName];
      }
    })();

    loadingPromisesRef.current[categoryName] = loadPromise;
    await loadPromise;
  }, [loadingCategories]);

  // PERF: Get category thumbnail image from first product in that category
  const getCategoryImage = useCallback((categoryName: string) => {
    const products = categoryProducts[categoryName] || [];

    if (products.length > 0 && products[0].image) {
      return products[0].image;
    }

    // PERF: Try to get image from any loaded category
    const anyCategory = Object.values(categoryProducts).find(cat => cat.length > 0);
    if (anyCategory && anyCategory[0]?.image) {
      return anyCategory[0].image;
    }

    // Transparent placeholder as last resort
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3C/svg%3E';
  }, [categoryProducts]);

  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [hiddenPositions, setHiddenPositions] = useState<number[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  // Load category order from config.json
  useEffect(() => {
    const loadCategoryOrder = async () => {
      try {
        const response = await fetch("/api/config/categories");
        if (response.ok) {
          const data = await response.json();
          // Use order array if available, otherwise fall back to enabled array
          const order = data?.order || data?.enabled || [];
          const hidden = data?.hiddenPositions || [];
          setCategoryOrder(order);
          setHiddenPositions(hidden);
          setCategoriesLoaded(true);
        }
      } catch (error) {
        console.error("Error loading category order:", error);
        // Fallback to default order
        setCategoryOrder([
          "All Tattoos",
          "Spiritual Collection",
          "Love & Couple Tattoos",
          "Anime & Pop Tattoos",
          "Animal Tattoos",
          "Minimal Tattoos",
          "Bold & Dark Tattoos",
          "Tattoos Packs",
          "Body Placement Tattoos",
          "Lifestyle Tattoos",
          "Tattoos Size & Type",
        ]);
        setHiddenPositions([]);
        setCategoriesLoaded(true);
      }
    };
    loadCategoryOrder();
  }, []);

  // Listen for admin preview updates
  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      const { sectionId, data } = event.detail;
      if (sectionId === "categories") {
        if (data.order && Array.isArray(data.order)) {
          setCategoryOrder(data.order);
        }
        if (data.hiddenPositions && Array.isArray(data.hiddenPositions)) {
          setHiddenPositions(data.hiddenPositions);
        }
      }
    };

    window.addEventListener(
      "adminPreviewUpdate",
      handleAdminUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "adminPreviewUpdate",
        handleAdminUpdate as EventListener
      );
    };
  }, []);

  // Map category names to IDs
  const categoryNameToId = (name: string): string => {
    const mapping: Record<string, string> = {
      "All Tattoos": "all-tattoos",
      "Spiritual Collection": "spiritual",
      "Love & Couple Tattoos": "love-couple",
      "Anime & Pop Tattoos": "anime-pop",
      "Animal Tattoos": "animal",
      "Minimal Tattoos": "minimal",
      "Bold & Dark Tattoos": "bold-dark",
      "Tattoos Packs": "tattoo-packs",
      "Body Placement Tattoos": "body-placement",
      "Lifestyle Tattoos": "lifestyle",
      "Tattoos Size & Type": "size-type",
    };
    return mapping[name] || name.toLowerCase().replace(/\s+/g, "-");
  };

  // Build mainCategories from order array, filtering out hidden positions
  const mainCategories =
    categoryOrder.length > 0 && categoriesLoaded
      ? categoryOrder
          .filter((name, index) => !hiddenPositions.includes(index))
          .map((name) => ({
            id: categoryNameToId(name),
            name: name,
          }))
      : [
          { id: "all-tattoos", name: "All Tattoos" },
          { id: "spiritual", name: "Spiritual Collection" },
          { id: "love-couple", name: "Love & Couple Tattoos" },
          { id: "anime-pop", name: "Anime & Pop Tattoos" },
          { id: "animal", name: "Animal Tattoos" },
          { id: "minimal", name: "Minimal Tattoos" },
          { id: "bold-dark", name: "Bold & Dark Tattoos" },
          { id: "tattoo-packs", name: "Tattoos Packs" },
          { id: "body-placement", name: "Body Placement Tattoos" },
          { id: "lifestyle", name: "Lifestyle Tattoos" },
          { id: "size-type", name: "Tattoos Size & Type" },
        ];

  // PERF: Load first visible category on mount
  useEffect(() => {
    if (categoriesLoaded && mainCategories.length > 0) {
      const firstCategory = mainCategories[0].name;
      if (firstCategory && !loadedCategoriesRef.current.has(firstCategory)) {
        loadCategoryProducts(firstCategory);
      }
    }
  }, [categoriesLoaded, mainCategories.length, loadCategoryProducts]);

  // PERF: Get products for a category (from cached state)
  const getProductsForCategory = useCallback((categoryName: string): Product[] => {
    return categoryProducts[categoryName] || [];
  }, [categoryProducts]);

  // Auto-scroll sidebar when category changes (from scrolling main content)
  useEffect(() => {
    if (
      !isScrollingToCategory.current &&
      sidebarItemRefs.current[selectedCategory] &&
      sidebarRef.current
    ) {
      const sidebarItem = sidebarItemRefs.current[selectedCategory];
      const sidebar = sidebarRef.current;

      if (sidebarItem) {
        // Get the position of the sidebar item relative to the sidebar container
        const itemTop = sidebarItem.offsetTop;
        const itemHeight = sidebarItem.offsetHeight;
        const sidebarHeight = sidebar.clientHeight;
        const sidebarScrollTop = sidebar.scrollTop;

        // Calculate if the item is visible in the sidebar
        const itemBottom = itemTop + itemHeight;
        const visibleTop = sidebarScrollTop;
        const visibleBottom = sidebarScrollTop + sidebarHeight;

        // Scroll sidebar if item is not fully visible
        if (itemTop < visibleTop || itemBottom > visibleBottom) {
          // Center the item in the sidebar
          const scrollTo = itemTop - sidebarHeight / 2 + itemHeight / 2;
          sidebar.scrollTo({
            top: scrollTo,
            behavior: "smooth",
          });
        }
      }
    }
  }, [selectedCategory]);

  // PERF: Create stable IntersectionObserver callback
  const handleTitleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (isScrollingToCategory.current) return;

    // Find all visible title entries
    const visibleEntries = entries.filter((entry) => entry.isIntersecting);

    if (visibleEntries.length > 0) {
      // Find the title closest to the top of the viewport
      const topEntry = visibleEntries.reduce((closest, entry) => {
        const closestTop = Math.abs(closest.boundingClientRect.top);
        const entryTop = Math.abs(entry.boundingClientRect.top);
        return entryTop < closestTop ? entry : closest;
      });

      const categoryName = topEntry.target.getAttribute("data-category");
      if (categoryName) {
        setSelectedCategory(categoryName);
      }
    }
  }, []);

  // PERF: Create stable IntersectionObserver for category visibility (to load products)
  const handleCategoryVisibility = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const categoryName = entry.target.getAttribute("data-category");
        if (categoryName && !loadedCategoriesRef.current.has(categoryName)) {
          loadCategoryProducts(categoryName);
        }
      }
    });
  }, [loadCategoryProducts]);

  // PERF: Intersection Observer to detect which category title is visible on screen
  useEffect(() => {
    // PERF: Reuse observer if it exists
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(handleTitleIntersection, {
        root: null,
        rootMargin: "-80px 0px -80% 0px", // Trigger when title is near top of screen
        threshold: [0, 1],
      });
    }

    // PERF: Observe all category title elements
    Object.keys(categoryTitleRefs.current).forEach((key) => {
      if (categoryTitleRefs.current[key]) {
        observerRef.current?.observe(categoryTitleRefs.current[key]!);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [handleTitleIntersection, mainCategories.length]); // PERF: Only recreate when categories change

  // PERF: Intersection Observer to load category products when they become visible
  useEffect(() => {
    if (!categoryObserverRef.current) {
      categoryObserverRef.current = new IntersectionObserver(handleCategoryVisibility, {
        root: null,
        rootMargin: "200px 0px", // PERF: Start loading 200px before category becomes visible
        threshold: 0.1,
      });
    }

    // PERF: Observe category containers for lazy loading
    Object.keys(categoryRefs.current).forEach((key) => {
      if (categoryRefs.current[key]) {
        categoryObserverRef.current?.observe(categoryRefs.current[key]!);
      }
    });

    return () => {
      if (categoryObserverRef.current) {
        categoryObserverRef.current.disconnect();
        categoryObserverRef.current = null;
      }
    };
  }, [handleCategoryVisibility, mainCategories.length]);

  // PERF: Handle sidebar category click - scroll to category and ensure products are loaded
  const handleCategoryClick = useCallback((categoryName: string) => {
    isScrollingToCategory.current = true;
    setSelectedCategory(categoryName);

    // PERF: Load products for this category if not already loaded
    if (!loadedCategoriesRef.current.has(categoryName)) {
      loadCategoryProducts(categoryName);
    }

    const targetElement = categoryRefs.current[categoryName];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });

      // Reset flag after scroll animation completes
      setTimeout(() => {
        isScrollingToCategory.current = false;
      }, 1000);
    }
  }, [loadCategoryProducts]);

  return (
    <div className="categories-page">
      <header className="categories-header">
        <h1 className="categories-title">Categories</h1>
        <div className="categories-header-icons">
          <button
            className="categories-icon-btn"
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
            className="categories-icon-btn"
            onClick={() => router.push("/wishlist")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#e8e8e8" viewBox="0 0 256 256"><path d="M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z"></path></svg>
          </button>
          <button
            className="categories-icon-btn"
            onClick={() => router.push("/profile")}
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
      </header>

      <div className="categories-content">
        <aside
          className="categories-sidebar"
          ref={sidebarRef as React.RefObject<HTMLElement>}
        >
          {mainCategories.map((category, index) => (
            <div
              key={`${category.id}-${index}`}
              ref={(el) => {
                if (el) sidebarItemRefs.current[category.name] = el;
              }}
              className={`category-sidebar-item ${
                selectedCategory === category.name ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="category-sidebar-thumbnail">
                {/* PERF: Use Next.js Image component for better performance */}
                <Image
                  src={getCategoryImage(category.name)}
                  alt={category.name}
                  width={60}
                  height={60}
                  loading="lazy"
                  unoptimized={true}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3C/svg%3E';
                  }}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <span className="category-sidebar-name">{category.name}</span>
            </div>
          ))}
        </aside>

        <main className="categories-main">
          <div data-section-id="category-list">
            {mainCategories.map((category, index) => {
              const products = getProductsForCategory(category.name);
              const isLoading = loadingCategories.has(category.name);
              const hasLoaded = loadedCategoriesRef.current.has(category.name);
              
              return (
                <div
                  key={`${category.id}-${index}`}
                  ref={(el) => {
                    if (el) {
                      categoryRefs.current[category.name] = el;
                      el.setAttribute("data-category", category.name);
                    }
                  }}
                  className="category-section-container"
                >
                  <h2
                    className="category-section-title"
                    ref={(el) => {
                      if (el) categoryTitleRefs.current[category.name] = el;
                    }}
                    data-category={category.name}
                  >
                    {category.name}
                  </h2>
                  <div className="subcategories-grid">
                    {isLoading && !hasLoaded ? (
                      <div className="categories-loading">
                        <p>Loading products...</p>
                      </div>
                    ) : products.length > 0 ? (
                      products.map((product, idx) => (
                        <div
                          key={`${product.id}-${idx}`}
                          className="subcategory-card"
                          onClick={() =>
                            router.push(`/product/${product.id}`)
                          }
                        >
                          <div className="subcategory-image">
                            {/* PERF: Use Next.js Image component for better performance */}
                            <Image
                              src={product.image}
                              alt={product.title || product.name || "Product"}
                              width={150}
                              height={150}
                              loading="lazy"
                              unoptimized={true}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23f0f0f0" width="150" height="150"/%3E%3C/svg%3E';
                              }}
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <p className="subcategory-name">
                            {product.title || product.name}
                          </p>
                        </div>
                      ))
                    ) : hasLoaded ? (
                      <p className="no-products">
                        No products in this category yet
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      <BottomNavbar />
    </div>
  );
}
