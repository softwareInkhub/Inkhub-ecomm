"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getProductsByCategory } from "@/lib/productsService";
import type { Product } from "@/types";
import Image from "next/image";

interface ProductsSectionProps {
  onWishlistClick?: () => void;
  categoryTitle?: string;
  hideCategoryImage?: boolean;
  useGridLayout?: boolean;
  filterSize?: string;
  sortBy?: string;
}

const ProductsSection: React.FC<ProductsSectionProps> = ({
  onWishlistClick,
  categoryTitle = "Shop Now",
  hideCategoryImage = false,
  useGridLayout = false,
  filterSize = "all",
  sortBy = "default",
}) => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const selectedImageIndices = useRef<{ [key: string]: number }>({});
  const [selectedImageIndicesState, setSelectedImageIndicesState] = useState<{
    [key: string]: number;
  }>({});
  const [touchStartX, setTouchStartX] = useState<{
    [key: string]: number | null;
  }>({});
  const [touchEndX, setTouchEndX] = useState<{ [key: string]: number | null }>(
    {}
  );
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const INITIAL_LIMIT = 12;
  const LOAD_MORE_LIMIT = 12;

  // PERF: Memoize filtered and sorted products
  const processedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by size if not 'all'
    if (filterSize !== "all") {
      filtered = filtered.filter((p) => {
        if ((p as any).size) {
          return (p as any).size.toLowerCase() === filterSize.toLowerCase();
        }
        return true;
      });
    }

    // Sort products based on sortBy
    if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceB - priceA;
      });
    } else if (sortBy === "relevancy") {
      filtered.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA;
      });
    }

    return filtered;
  }, [products, filterSize, sortBy]);

  // PERF: Load products using optimized service
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // PERF: Use getProductsByCategory for better caching
        let data: Product[] = [];
        if (
          categoryTitle &&
          categoryTitle !== "Shop Now" &&
          categoryTitle !== "All Tattoos"
        ) {
          data = await getProductsByCategory(categoryTitle);
        } else {
          // For "All Tattoos" or "Shop Now", fetch all (but limit initial load)
          const { fetchProducts } = await import("@/lib/productsService");
          const allProducts = await fetchProducts();
          data = allProducts;
        }

        setProducts(data);
        // PERF: Initially show only first batch
        const initialBatch = data.slice(0, INITIAL_LIMIT);
        setDisplayedProducts(initialBatch);
        setHasMore(data.length > INITIAL_LIMIT);
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
        setDisplayedProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [categoryTitle]);

  // PERF: Update displayed products when filters/sort change
  useEffect(() => {
    const initialBatch = processedProducts.slice(0, INITIAL_LIMIT);
    setDisplayedProducts(initialBatch);
    setHasMore(processedProducts.length > INITIAL_LIMIT);
  }, [processedProducts]);

  // PERF: Load more products when intersection observer triggers
  const loadMoreProducts = useCallback(() => {
    if (isLoading || !hasMore) return;

    const currentLength = displayedProducts.length;
    const nextBatch = processedProducts.slice(
      currentLength,
      currentLength + LOAD_MORE_LIMIT
    );

    if (nextBatch.length > 0) {
      setDisplayedProducts((prev) => [...prev, ...nextBatch]);
      setHasMore(
        currentLength + nextBatch.length < processedProducts.length
      );
    }
  }, [displayedProducts.length, processedProducts, isLoading, hasMore]);

  // PERF: IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            loadMoreProducts();
          }
        },
        { rootMargin: "200px" }
      );
    }

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isLoading, loadMoreProducts]);

  useEffect(() => {
    const wishlist = JSON.parse(
      localStorage.getItem("bagichaWishlist") || "[]"
    );
    setWishlistedIds(wishlist.map((item: Product) => item.id));

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      const updatedWishlist = JSON.parse(
        localStorage.getItem("bagichaWishlist") || "[]"
      );
      setWishlistedIds(updatedWishlist.map((item: Product) => item.id));
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    window.addEventListener("storage", handleWishlistUpdate);

    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
      window.removeEventListener("storage", handleWishlistUpdate);
    };
  }, []);

  // Get multiple images for each product
  const getProductImages = (productItem: Product) => {
    if (!productItem) return [];

    // Use images from API if available
    if (productItem.images && productItem.images.length > 0) {
      return productItem.images;
    }

    // Fallback to single image if images array is not available
    if (productItem.image) {
      return [productItem.image];
    }

    // Final fallback
    return ["/images/placeholder.webp"];
  };

  const handleImageTouchStart = (productId: string, e: React.TouchEvent) => {
    setTouchEndX((prev) => ({ ...prev, [productId]: null }));
    setTouchStartX((prev) => ({
      ...prev,
      [productId]: e.targetTouches[0].clientX,
    }));
  };

  const handleImageTouchMove = (productId: string, e: React.TouchEvent) => {
    setTouchEndX((prev) => ({
      ...prev,
      [productId]: e.targetTouches[0].clientX,
    }));
  };

  // PERF: Memoize image touch handlers
  const handleImageTouchEnd = useCallback((productId: string, productImages: string[]) => {
    if (!touchStartX[productId] || !touchEndX[productId]) {
      setTouchStartX((prev) => ({ ...prev, [productId]: null }));
      setTouchEndX((prev) => ({ ...prev, [productId]: null }));
      return;
    }

    const distance = touchStartX[productId]! - touchEndX[productId]!;
    const minSwipe = 50;

    if (Math.abs(distance) > minSwipe) {
      const currentIndex = selectedImageIndices.current[productId] || 0;
      const newIndex = distance > 0
        ? (currentIndex + 1) % productImages.length
        : (currentIndex - 1 + productImages.length) % productImages.length;
      
      selectedImageIndices.current[productId] = newIndex;
      setSelectedImageIndicesState((prev) => ({
        ...prev,
        [productId]: newIndex,
      }));
    }

    setTouchStartX((prev) => ({ ...prev, [productId]: null }));
    setTouchEndX((prev) => ({ ...prev, [productId]: null }));
  }, [touchStartX, touchEndX]);

  const handleImageMouseDown = (productId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".product-wishlist-heart")) return;
    setTouchStartX((prev) => ({ ...prev, [productId]: e.clientX }));
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      Object.keys(touchStartX).forEach((productId) => {
        if (touchStartX[productId] !== null && !touchEndX[productId]) {
          setTouchEndX((prev) => ({ ...prev, [productId]: e.clientX }));
        }
      });
    };

    const handleMouseUp = () => {
      Object.keys(touchStartX).forEach((productId) => {
        if (touchStartX[productId] !== null && touchEndX[productId] !== null) {
          const product = products.find((p) => p.id === productId);
          if (product) {
            const productImages = getProductImages(product);
            const distance = touchStartX[productId]! - touchEndX[productId]!;
            const minSwipe = 50;

            if (Math.abs(distance) > minSwipe) {
              const currentIndex = selectedImageIndices.current[productId] || 0;
              const newIndex = distance > 0
                ? (currentIndex + 1) % productImages.length
                : (currentIndex - 1 + productImages.length) % productImages.length;
              
              selectedImageIndices.current[productId] = newIndex;
              setSelectedImageIndicesState((prev) => ({
                ...prev,
                [productId]: newIndex,
              }));
            }
          }
          setTouchStartX((prev) => ({ ...prev, [productId]: null }));
          setTouchEndX((prev) => ({ ...prev, [productId]: null }));
        }
      });
    };

    if (Object.keys(touchStartX).length > 0) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [touchStartX, touchEndX, displayedProducts]);

  // PERF: Memoize handlers
  const handleProductClick = useCallback((product: Product) => {
    router.push(`/product/${product.id}`);
  }, [router]);

  const handleHeartClick = useCallback((productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isAuthenticated =
      localStorage.getItem("Inkhubuthenticated") === "true";
    if (!isAuthenticated && onWishlistClick) {
      onWishlistClick();
      return;
    }

    const wishlist = JSON.parse(
      localStorage.getItem("bagichaWishlist") || "[]"
    );
    const existingIndex = wishlist.findIndex(
      (item: Product) => item.id === productId
    );

    if (existingIndex > -1) {
      wishlist.splice(existingIndex, 1);
      const product = products.find((p) => p.id === productId);
      if (product) {
        window.dispatchEvent(
          new CustomEvent("wishlistUpdated", {
            detail: {
              productName: product.title || product.name,
              added: false,
            },
          })
        );
      }
    } else {
      const product = products.find((p) => p.id === productId);
      if (product) {
        wishlist.push({
          id: product.id,
          name: product.title || product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          images: product.images,
          category: product.category,
        });
        window.dispatchEvent(
          new CustomEvent("wishlistUpdated", {
            detail: { productName: product.title || product.name, added: true },
          })
        );
      }
    }

    localStorage.setItem("bagichaWishlist", JSON.stringify(wishlist));
    setWishlistedIds(wishlist.map((item: Product) => item.id));
  }, [onWishlistClick, displayedProducts]);

  const handleAddToCart = useCallback((productId: string, e: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const cartItems = JSON.parse(localStorage.getItem("bagichaCart") || "[]");
    const product = products.find((p) => p.id === productId);

    if (!product) return;

    if (!cartItems.find((i: Product) => i.id === productId)) {
      cartItems.push(product);
      localStorage.setItem("bagichaCart", JSON.stringify(cartItems));

      // Trigger cart update event
      window.dispatchEvent(new Event("cartUpdated"));

      // Trigger cart toast notification
      window.dispatchEvent(
        new CustomEvent("cartUpdatedToast", {
          detail: { productName: product.title || product.name, added: true },
        })
      );
    } else {
      // Trigger cart toast notification for already in cart
      window.dispatchEvent(
        new CustomEvent("cartUpdatedToast", {
          detail: {
            productName: product.title || product.name,
            added: false,
            message: "already in cart",
          },
        })
      );
    }
  }, [displayedProducts]);

  // PERF: Memoize price calculation
  const getPriceInfo = useCallback((product: Product) => {
    const currentPrice = parseFloat(product.price?.toString() || "0");

    // Fixed discount percent based on product ID for consistency
    const discountMap: { [key: string]: number } = {
      "1": 25,
      "2": 30,
      "3": 20,
      "4": 40,
      "5": 35,
      "6": 15,
      "7": 20,
      "8": 22,
      "9": 18,
      "10": 25,
      "11": 28,
      "12": 24,
      "13": 35,
      "14": 30,
      "15": 32,
      "16": 20,
      "17": 22,
      "18": 18,
      "19": 25,
      "20": 30,
      "21": 28,
      "22": 20,
      "23": 15,
      "24": 24,
      "25": 22,
      "26": 18,
      "27": 20,
      "28": 25,
      "29": 28,
      "30": 26,
      "31": 21,
      "32": 23,
      "33": 20,
      "34": 33,
      "35": 22,
      "36": 24,
    };

    const discountPercent = discountMap[product.id] || 25;
    const previousPrice = Math.ceil(currentPrice / (1 - discountPercent / 100));

    return {
      currentPrice: currentPrice.toFixed(0),
      previousPrice: previousPrice.toFixed(0),
      discountPercent,
    };
  }, []);

  // PERF: Memoize category image
  const categoryImage = useMemo(() => {
    if (displayedProducts.length > 0 && displayedProducts[0].image) {
      return displayedProducts[0].image;
    }
    return null;
  }, [displayedProducts]);

  if (isLoading && displayedProducts.length === 0) {
    return (
      <section className="products-section" aria-label="Products">
        <div className="products-content">
          <div className="categories-loading">
            <p>Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (displayedProducts.length === 0) return null;

  return (
    <section className="products-section" aria-label="Products">
      <div className="products-content">
          {categoryImage &&
          categoryTitle !== "Shop Now" &&
          categoryTitle !== "All Tattoos" &&
          !hideCategoryImage && (
            <div className="category-image-header">
              {/* PERF: Use Next.js Image component */}
              <Image
                src={categoryImage}
                alt={categoryTitle}
                width={1200}
                height={400}
                loading="lazy"
                unoptimized={true}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"%3E%3Crect fill="%23f0f0f0" width="1200" height="400"/%3E%3C/svg%3E';
                }}
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
        {categoryTitle !== "All Tattoos" && (
          <h1 className="wishlist-title">{categoryTitle}</h1>
        )}
        <div
          className={
            categoryTitle === "All Tattoos" || useGridLayout
              ? "products-items-grid"
              : "products-items"
          }
        >
          {displayedProducts.map((product, index) => {
            const priceInfo = getPriceInfo(product);
            const productImages = getProductImages(product);
            const currentImageIndex = selectedImageIndicesState[product.id] ?? selectedImageIndices.current[product.id] ?? 0;
            const currentImage = productImages[currentImageIndex];

            return (
              <div
                key={`${product.id}-${index}`}
                className="wishlist-item"
                onClick={() => handleProductClick(product)}
              >
                <div
                  className="wishlist-item-image"
                  onTouchStart={(e) => handleImageTouchStart(product.id, e)}
                  onTouchMove={(e) => handleImageTouchMove(product.id, e)}
                  onTouchEnd={() =>
                    handleImageTouchEnd(product.id, productImages)
                  }
                  onMouseDown={(e) => handleImageMouseDown(product.id, e)}
                >
                  {/* PERF: Use Next.js Image component for better performance */}
                  <Image
                    src={currentImage}
                    alt={product.title || product.name || "Product"}
                    className="carousel-image"
                    width={400}
                    height={400}
                    loading="lazy"
                    unoptimized={true}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E';
                    }}
                    style={{ objectFit: 'cover' }}
                  />
                  {productImages.length > 1 && (
                    <div className="product-image-dots">
                      {productImages.map((_, index) => (
                        <span
                          key={index}
                          className={`product-image-dot ${
                            currentImageIndex === index ? "active" : ""
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <button
                    className={`product-wishlist-heart ${
                      wishlistedIds.includes(product.id) ? "active" : ""
                    }`}
                    onClick={(e) => handleHeartClick(product.id, e)}
                    aria-label="Add to wishlist"
                  >
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
                <div className="wishlist-item-info">
                  <h3 className="wishlist-item-name">
                    {product.title || product.name}
                  </h3>
                  <p className="wishlist-item-desc">{product.description}</p>
                  <div className="wishlist-item-footer">
                    <div className="wishlist-price-container">
                      <div className="wishlist-price-row">
                        <span className="wishlist-item-price">
                          ₹{priceInfo.currentPrice}
                        </span>
                        <span className="wishlist-discount-badge">
                          {priceInfo.discountPercent}% off
                        </span>
                      </div>
                      <span className="wishlist-previous-price">
                        ₹{priceInfo.previousPrice}
                      </span>
                    </div>
                    <button
                      className="product-cart-icon-btn"
                      onClick={(e) => handleAddToCart(product.id, e)}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 6H21"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* PERF: Load more trigger for infinite scroll */}
        {hasMore && (
          <div ref={loadMoreRef} style={{ height: '20px', width: '100%' }} />
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
