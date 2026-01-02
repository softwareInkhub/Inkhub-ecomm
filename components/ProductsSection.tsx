"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchProducts } from "@/lib/productsService";
import type { Product } from "@/types";

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
  const [selectedImageIndices, setSelectedImageIndices] = useState<{
    [key: string]: number;
  }>({});
  const [touchStartX, setTouchStartX] = useState<{
    [key: string]: number | null;
  }>({});
  const [touchEndX, setTouchEndX] = useState<{ [key: string]: number | null }>(
    {}
  );
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();

        // Filter products by category if categoryTitle is provided
        let filteredProducts = data;
        if (
          categoryTitle &&
          categoryTitle !== "Shop Now" &&
          categoryTitle !== "All Tattoos"
        ) {
          filteredProducts = data.filter((p) => p.category === categoryTitle);
        }

        // Filter by size if not 'all'
        if (filterSize !== "all") {
          filteredProducts = filteredProducts.filter((p) => {
            // Assuming products have a size property
            if ((p as any).size) {
              return (p as any).size.toLowerCase() === filterSize.toLowerCase();
            }
            return true; // If no size property, include the product
          });
        }

        // Sort products based on sortBy
        if (sortBy === "price-low") {
          filteredProducts.sort((a, b) => {
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            return priceA - priceB;
          });
        } else if (sortBy === "price-high") {
          filteredProducts.sort((a, b) => {
            const priceA = a.price || 0;
            const priceB = b.price || 0;
            return priceB - priceA;
          });
        } else if (sortBy === "relevancy") {
          // Sort by relevancy - could be based on popularity, ratings, or other factors
          // For now, sorting by product ID (newest first) as a proxy for relevancy
          filteredProducts.sort((a, b) => {
            const idA = parseInt(a.id) || 0;
            const idB = parseInt(b.id) || 0;
            return idB - idA;
          });
        }

        // For "All Tattoos", show all products; otherwise show first 12
        const productLimit =
          categoryTitle === "All Tattoos" ? filteredProducts.length : 12;
        setProducts(filteredProducts.slice(0, productLimit));
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    loadProducts();
  }, [categoryTitle, filterSize, sortBy]);

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

  const handleImageTouchEnd = (productId: string, productImages: string[]) => {
    if (!touchStartX[productId] || !touchEndX[productId]) {
      setTouchStartX((prev) => ({ ...prev, [productId]: null }));
      setTouchEndX((prev) => ({ ...prev, [productId]: null }));
      return;
    }

    const distance = touchStartX[productId]! - touchEndX[productId]!;
    const minSwipe = 50;

    if (Math.abs(distance) > minSwipe) {
      const currentIndex = selectedImageIndices[productId] || 0;
      if (distance > 0) {
        // Swiped left, go to next image
        setSelectedImageIndices((prev) => ({
          ...prev,
          [productId]: (currentIndex + 1) % productImages.length,
        }));
      } else {
        // Swiped right, go to previous image
        setSelectedImageIndices((prev) => ({
          ...prev,
          [productId]:
            (currentIndex - 1 + productImages.length) % productImages.length,
        }));
      }
    }

    setTouchStartX((prev) => ({ ...prev, [productId]: null }));
    setTouchEndX((prev) => ({ ...prev, [productId]: null }));
  };

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
              const currentIndex = selectedImageIndices[productId] || 0;
              if (distance > 0) {
                setSelectedImageIndices((prev) => ({
                  ...prev,
                  [productId]: (currentIndex + 1) % productImages.length,
                }));
              } else {
                setSelectedImageIndices((prev) => ({
                  ...prev,
                  [productId]:
                    (currentIndex - 1 + productImages.length) %
                    productImages.length,
                }));
              }
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
  }, [touchStartX, touchEndX, selectedImageIndices, products]);

  const handleProductClick = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleHeartClick = (productId: string, e: React.MouseEvent) => {
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
  };

  const handleAddToCart = (productId: string, e: React.MouseEvent) => {
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
  };

  // Calculate previous price and discount for demo purposes
  const getPriceInfo = (product: Product) => {
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
  };

  // Get category image from first product
  const getCategoryImage = () => {
    if (products.length > 0 && products[0].image) {
      return products[0].image;
    }
    return null;
  };

  const categoryImage = getCategoryImage();

  if (products.length === 0) return null;

  return (
    <section className="products-section" aria-label="Products">
      <div className="products-content">
        {categoryImage &&
          categoryTitle !== "Shop Now" &&
          categoryTitle !== "All Tattoos" &&
          !hideCategoryImage && (
            <div className="category-image-header">
              <img src={categoryImage} alt={categoryTitle} />
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
          {products.map((product) => {
            const priceInfo = getPriceInfo(product);
            const productImages = getProductImages(product);
            const currentImageIndex = selectedImageIndices[product.id] || 0;
            const currentImage = productImages[currentImageIndex];

            return (
              <div
                key={product.id}
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
                  <img
                    src={currentImage}
                    alt={product.title || product.name || "Product"}
                    className="carousel-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E';
                    }}
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
      </div>
    </section>
  );
};

export default ProductsSection;
