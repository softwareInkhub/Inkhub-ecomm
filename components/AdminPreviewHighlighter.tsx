'use client';

import { useEffect, useState } from 'react';

export default function AdminPreviewHighlighter() {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Only run on client side after mount to avoid hydration warnings
    if (typeof window === 'undefined') return;

    // Check if we're in preview mode
    const checkPreview = () => {
      const params = new URLSearchParams(window.location.search);
      const preview = params.get('preview') === 'true' || params.get('admin') === 'true';
      setIsPreview(preview);
      return preview;
    };

    // Use requestAnimationFrame to ensure DOM is ready and avoid hydration issues
    requestAnimationFrame(() => {
      const preview = checkPreview();

      // Update viewport for preview mode
      if (preview) {
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=430, initial-scale=1, maximum-scale=1, user-scalable=no');
        } else {
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=430, initial-scale=1, maximum-scale=1, user-scalable=no';
          document.head.appendChild(meta);
        }

        // Ensure body and app-container have correct width
        document.body.style.width = '430px';
        document.body.style.maxWidth = '430px';
        document.body.style.margin = '0 auto';
        
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
          (appContainer as HTMLElement).style.width = '430px';
          (appContainer as HTMLElement).style.maxWidth = '430px';
        }
      } else {
        // Restore default viewport when not in preview
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
        document.body.style.width = '';
        document.body.style.maxWidth = '';
        document.body.style.margin = '';
        
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
          (appContainer as HTMLElement).style.width = '';
          (appContainer as HTMLElement).style.maxWidth = '';
        }
      }
    });
  }, []);

  useEffect(() => {
    // Listen for messages from admin panel
    const handleMessage = (event: MessageEvent) => {
      // In production, verify event.origin for security
      
      // Handle section highlighting with fade effect
      if (event.data?.type === 'highlight-section') {
        const { sectionId, selector, fadeAfter = 2000 } = event.data;
        
        // Remove previous highlights from all possible elements
        document.querySelectorAll('[data-section-id], section[aria-label], [class*="hero"], [class*="grid"], [class*="scrollable"], [class*="latest"], [class*="offer"]').forEach((el) => {
          const element = el as HTMLElement
          element.style.outline = ''
          element.style.outlineOffset = ''
          element.style.boxShadow = ''
          element.style.transition = ''
        });

        // Find and highlight the target section using selector
        let targetElement: Element | null = null;
        
        if (selector) {
          // Try the provided selector first
          if (selector.includes(':contains')) {
            // Handle :contains pseudo-selector manually
            const baseSelector = selector.split(':contains')[0]
            const containsText = selector.match(/:contains\("([^"]+)"\)/)?.[1]
            if (containsText) {
              const elements = document.querySelectorAll(baseSelector)
              elements.forEach((el) => {
                if (el.textContent?.includes(containsText)) {
                  targetElement = el.closest('section, div, [data-section-id]') || el
                }
              })
            }
          } else {
            targetElement = document.querySelector(selector)
          }
        }
        
        // Fallback: try data-section-id
        if (!targetElement) {
          targetElement = document.querySelector(`[data-section-id="${sectionId}"]`)
        }
        
        // Fallback: try aria-label
        if (!targetElement && sectionId === 'heroBanners') {
          targetElement = document.querySelector('section[aria-label="Hero Banners"]')
        }
        
        if (targetElement) {
          const element = targetElement as HTMLElement
          
          // Apply highlight with glow effect
          element.style.outline = '3px solid #60a5fa'
          element.style.outlineOffset = '4px'
          element.style.boxShadow = '0 0 0 4px rgba(96, 165, 250, 0.2), 0 0 20px rgba(96, 165, 250, 0.3)'
          element.style.transition = 'all 0.3s ease-in-out'
          element.style.borderRadius = '8px'
          
          // Scroll into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Fade out highlight after specified time
          if (fadeAfter > 0) {
            setTimeout(() => {
              element.style.transition = 'all 1s ease-out'
              element.style.outline = '3px solid rgba(96, 165, 250, 0.3)'
              element.style.boxShadow = '0 0 0 4px rgba(96, 165, 250, 0.1), 0 0 10px rgba(96, 165, 250, 0.1)'
              
              // Remove completely after fade
              setTimeout(() => {
                element.style.outline = ''
                element.style.outlineOffset = ''
                element.style.boxShadow = ''
                element.style.transition = ''
              }, 1000)
            }, fadeAfter)
          }
        }
      }
      
      // Handle admin preview updates - apply changes in real-time
      if (event.data?.type === 'adminPreviewUpdate') {
        const { sectionId, data, sections } = event.data;
        
        if (!sectionId) return;
        
        try {
          // Handle visibility changes first with smooth animations
          if (sections && Array.isArray(sections)) {
            sections.forEach((subsection: any) => {
              const { id, visible, type, category, imageType } = subsection;
              const isVisible = visible !== false;
              
              if (sectionId === 'homepage') {
                // Map homepage subsections to DOM elements
                if (id === 'heroSection') {
                  const heroElements = document.querySelectorAll('[data-section-id="hero"]');
                  heroElements.forEach((el) => {
                    const element = el as HTMLElement;
                    if (isVisible) {
                      element.style.display = '';
                      element.style.opacity = '0';
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      requestAnimationFrame(() => {
                        element.style.opacity = '1';
                      });
                    } else {
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      element.style.opacity = '0';
                      setTimeout(() => {
                        element.style.display = 'none';
                      }, 300);
                    }
                  });
                } else if (id === 'productSections') {
                  // Product sections are handled individually below
                  return;
                } else if (type === 'products' && category) {
                  // Find product sections by category title
                  const allProductSections = document.querySelectorAll('[data-section-id="featured"]');
                  allProductSections.forEach((el) => {
                    const section = el as HTMLElement;
                    const heading = section.querySelector('h1, h2, h3, [class*="title"]');
                    if (heading && heading.textContent && heading.textContent.trim() === category) {
                      if (isVisible) {
                        section.style.display = '';
                        section.style.opacity = '0';
                        section.style.transition = 'opacity 0.3s ease-in-out';
                        requestAnimationFrame(() => {
                          section.style.opacity = '1';
                        });
                      } else {
                        section.style.transition = 'opacity 0.3s ease-in-out';
                        section.style.opacity = '0';
                        setTimeout(() => {
                          section.style.display = 'none';
                        }, 300);
                      }
                    }
                  });
                } else if (type === 'poster' && imageType) {
                  // Find poster sections - they're typically between product sections
                  const allSections = Array.from(document.querySelectorAll('section, [data-section-id]'));
                  allSections.forEach((el) => {
                    const section = el as HTMLElement;
                    const sectionIdAttr = section.getAttribute('data-section-id');
                    if (!sectionIdAttr || (sectionIdAttr !== 'hero' && sectionIdAttr !== 'featured')) {
                      const hasImages = section.querySelectorAll('img').length > 0;
                      const hasCategoryTitle = section.querySelector('h1, h2, h3, [class*="title"]');
                      if (hasImages && !hasCategoryTitle) {
                        if (isVisible) {
                          section.style.display = '';
                          section.style.opacity = '0';
                          section.style.transition = 'opacity 0.3s ease-in-out';
                          requestAnimationFrame(() => {
                            section.style.opacity = '1';
                          });
                        } else {
                          section.style.transition = 'opacity 0.3s ease-in-out';
                          section.style.opacity = '0';
                          setTimeout(() => {
                            section.style.display = 'none';
                          }, 300);
                        }
                      }
                    }
                  });
                } else if (type === 'countdown') {
                  const countdownElements = document.querySelectorAll('[class*="countdown"], [class*="Countdown"]');
                  countdownElements.forEach((el) => {
                    const element = el as HTMLElement;
                    if (isVisible) {
                      element.style.display = '';
                      element.style.opacity = '0';
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      requestAnimationFrame(() => {
                        element.style.opacity = '1';
                      });
                    } else {
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      element.style.opacity = '0';
                      setTimeout(() => {
                        element.style.display = 'none';
                      }, 300);
                    }
                  });
                }
              } else if (sectionId === 'trends') {
                if (id === 'sections') {
                  const trendSections = document.querySelectorAll('[data-section-id="trending"], [data-section-id="best-sellers"]');
                  trendSections.forEach((el) => {
                    const element = el as HTMLElement;
                    if (isVisible) {
                      element.style.display = '';
                      element.style.opacity = '0';
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      requestAnimationFrame(() => {
                        element.style.opacity = '1';
                      });
                    } else {
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      element.style.opacity = '0';
                      setTimeout(() => {
                        element.style.display = 'none';
                      }, 300);
                    }
                  });
                }
              } else if (sectionId === 'categories') {
                if (id === 'categoryList') {
                  const categoryElements = document.querySelectorAll('[data-section-id="category-list"]');
                  categoryElements.forEach((el) => {
                    const element = el as HTMLElement;
                    if (isVisible) {
                      element.style.display = '';
                      element.style.opacity = '0';
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      requestAnimationFrame(() => {
                        element.style.opacity = '1';
                      });
                    } else {
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      element.style.opacity = '0';
                      setTimeout(() => {
                        element.style.display = 'none';
                      }, 300);
                    }
                  });
                }
              } else if (sectionId === 'hero-banners') {
                const bannerSection = document.querySelector('section[aria-label="Hero Banners"]');
                if (bannerSection) {
                  const element = bannerSection as HTMLElement;
                  if (isVisible) {
                    element.style.display = '';
                    element.style.opacity = '0';
                    element.style.transition = 'opacity 0.3s ease-in-out';
                    requestAnimationFrame(() => {
                      element.style.opacity = '1';
                    });
                  } else {
                    element.style.transition = 'opacity 0.3s ease-in-out';
                    element.style.opacity = '0';
                    setTimeout(() => {
                      element.style.display = 'none';
                    }, 300);
                  }
                }
              } else if (sectionId === 'category-grid') {
                const gridElements = document.querySelectorAll('[class*="hero-grid"], [class*="category-grid"]');
                gridElements.forEach((el) => {
                  const element = el as HTMLElement;
                  element.style.display = isVisible ? '' : 'none';
                  element.style.transition = 'opacity 0.3s ease-in-out';
                  element.style.opacity = isVisible ? '1' : '0';
                });
              } else if (sectionId === 'scrollable-posters') {
                const posterElements = document.querySelectorAll('[class*="scrollable"], [class*="poster"]');
                posterElements.forEach((el) => {
                  const element = el as HTMLElement;
                  element.style.display = isVisible ? '' : 'none';
                  element.style.transition = 'opacity 0.3s ease-in-out';
                  element.style.opacity = isVisible ? '1' : '0';
                });
              } else if (sectionId === 'latest-drops') {
                const latestElements = document.querySelectorAll('[class*="latest"], [class*="drops"]');
                latestElements.forEach((el) => {
                  const element = el as HTMLElement;
                  element.style.display = isVisible ? '' : 'none';
                  element.style.transition = 'opacity 0.3s ease-in-out';
                  element.style.opacity = isVisible ? '1' : '0';
                });
              } else if (sectionId === 'offers') {
                const allHeadings = document.querySelectorAll('h1, h2, h3');
                allHeadings.forEach((heading) => {
                  if (heading.textContent && heading.textContent.includes('Offers')) {
                    const parentSection = heading.closest('section, div, [data-section-id]');
                    if (parentSection) {
                      const element = parentSection as HTMLElement;
                      if (isVisible) {
                        element.style.display = '';
                        element.style.opacity = '0';
                        element.style.transition = 'opacity 0.3s ease-in-out';
                        requestAnimationFrame(() => {
                          element.style.opacity = '1';
                        });
                      } else {
                        element.style.transition = 'opacity 0.3s ease-in-out';
                        element.style.opacity = '0';
                        setTimeout(() => {
                          element.style.display = 'none';
                        }, 300);
                      }
                    }
                  }
                });
              } else if (sectionId === 'hero-poster-inline') {
                const posterElements = document.querySelectorAll('[class*="hero-poster"], [class*="poster-inline"]');
                posterElements.forEach((el) => {
                  const element = el as HTMLElement;
                  element.style.display = isVisible ? '' : 'none';
                  element.style.transition = 'opacity 0.3s ease-in-out';
                  element.style.opacity = isVisible ? '1' : '0';
                });
              } else if (sectionId === 'hero-section') {
                // Legacy support for backward compatibility
                if (id === 'heroBanners') {
                  const bannerSection = document.querySelector('section[aria-label="Hero Banners"]');
                  if (bannerSection) {
                    const element = bannerSection as HTMLElement;
                    if (isVisible) {
                      element.style.display = '';
                      element.style.opacity = '0';
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      requestAnimationFrame(() => {
                        element.style.opacity = '1';
                      });
                    } else {
                      element.style.transition = 'opacity 0.3s ease-in-out';
                      element.style.opacity = '0';
                      setTimeout(() => {
                        element.style.display = 'none';
                      }, 300);
                    }
                  }
                } else if (id === 'categoryGrid') {
                  const gridElements = document.querySelectorAll('[class*="hero-grid"], [class*="category-grid"]');
                  gridElements.forEach((el) => {
                    const element = el as HTMLElement;
                    element.style.display = isVisible ? '' : 'none';
                    element.style.transition = 'opacity 0.3s ease-in-out';
                    element.style.opacity = isVisible ? '1' : '0';
                  });
                } else if (id === 'scrollablePosters') {
                  const posterElements = document.querySelectorAll('[class*="scrollable"], [class*="poster"]');
                  posterElements.forEach((el) => {
                    const element = el as HTMLElement;
                    element.style.display = isVisible ? '' : 'none';
                    element.style.transition = 'opacity 0.3s ease-in-out';
                    element.style.opacity = isVisible ? '1' : '0';
                  });
                } else if (id === 'latestDrops') {
                  const latestElements = document.querySelectorAll('[class*="latest"], [class*="drops"]');
                  latestElements.forEach((el) => {
                    const element = el as HTMLElement;
                    element.style.display = isVisible ? '' : 'none';
                    element.style.transition = 'opacity 0.3s ease-in-out';
                    element.style.opacity = isVisible ? '1' : '0';
                  });
                } else if (id === 'offers') {
                  const allHeadings = document.querySelectorAll('h1, h2, h3');
                  allHeadings.forEach((heading) => {
                    if (heading.textContent && heading.textContent.includes('Offers')) {
                      const parentSection = heading.closest('section, div, [data-section-id]');
                      if (parentSection) {
                        const element = parentSection as HTMLElement;
                        if (isVisible) {
                          element.style.display = '';
                          element.style.opacity = '0';
                          element.style.transition = 'opacity 0.3s ease-in-out';
                          requestAnimationFrame(() => {
                            element.style.opacity = '1';
                          });
                        } else {
                          element.style.transition = 'opacity 0.3s ease-in-out';
                          element.style.opacity = '0';
                          setTimeout(() => {
                            element.style.display = 'none';
                          }, 300);
                        }
                      }
                    }
                  });
                }
              }
            });
          }
          
          // Categories order and visibility updates
          if (sectionId === 'categories') {
            // Dispatch custom event for category order and visibility updates
            window.dispatchEvent(new CustomEvent('adminPreviewUpdate', {
              detail: { 
                sectionId: 'categories', 
                data: { 
                  order: data.order || data.data?.order,
                  hiddenPositions: data.hiddenPositions || data.data?.hiddenPositions
                } 
              }
            }));
            
            // Update category order in the DOM if on categories page
            const categoryElements = document.querySelectorAll('[data-category-name]');
            if (categoryElements.length > 0) {
              // Reorder categories based on new order
              const categoryContainer = categoryElements[0].closest('section, main, .categories-container');
              if (categoryContainer) {
                // This will be handled by the page component listening to the event
                // We just dispatch the event here
              }
            }
          }
          
          // Don't store large data in localStorage (causes quota exceeded)
          // Just dispatch custom event for components that listen
          if (data && Object.keys(data).length > 0) {
            window.dispatchEvent(new CustomEvent('adminPreviewUpdate', {
              detail: { sectionId, data }
            }));
          }
          
          // Apply updates directly to DOM for immediate visual feedback
          
          // Hero banners updates
          if (sectionId === 'hero-banners' && data.heroBanners && Array.isArray(data.heroBanners) && data.heroBanners.length > 0) {
            const bannerSection = document.querySelector('section[aria-label="Hero Banners"]');
            if (bannerSection) {
              const bannerContainer = bannerSection.querySelector('div[style*="display: flex"], div[style*="display:flex"]') || bannerSection;
              const bannerImages = bannerContainer.querySelectorAll('img');
              
              // Update each banner image
              bannerImages.forEach((img, index) => {
                // Since banners are duplicated for infinite scroll, map to original index
                const bannerIndex = index % data.heroBanners.length;
                if (data.heroBanners[bannerIndex]?.image) {
                  let imageSrc = data.heroBanners[bannerIndex].image;
                  // Convert relative paths to absolute URLs
                  if (imageSrc.startsWith('/') && !imageSrc.startsWith('//') && !imageSrc.startsWith('http')) {
                    imageSrc = `${window.location.origin}${imageSrc}`;
                  }
                  (img as HTMLImageElement).src = imageSrc;
                  (img as HTMLImageElement).alt = data.heroBanners[bannerIndex].alt || '';
                }
              });
            }
          }
          
          // Offers section updates
          if (sectionId === 'offers' && data.offers?.items && Array.isArray(data.offers.items)) {
            const allHeadings = document.querySelectorAll('h1, h2, h3');
            allHeadings.forEach((heading) => {
              if (heading.textContent && heading.textContent.includes('Offers')) {
                const offersSection = heading.closest('section, div') || heading.parentElement;
                if (offersSection) {
                  const offerImages = offersSection.querySelectorAll('img');
                  offerImages.forEach((img, index) => {
                    if (index < data.offers.items.length && data.offers.items[index]?.image) {
                      let imageSrc = data.offers.items[index].image;
                      if (imageSrc.startsWith('/') && !imageSrc.startsWith('//') && !imageSrc.startsWith('http')) {
                        imageSrc = `${window.location.origin}${imageSrc}`;
                      }
                      (img as HTMLImageElement).src = imageSrc;
                      (img as HTMLImageElement).alt = data.offers.items[index].alt || '';
                    }
                  });
                }
              }
            });
          }
          
          // Legacy hero-section support
          if (sectionId === 'hero-section') {
            // Update hero banners - find all banner images in the hero banner section
            if (data.heroBanners && Array.isArray(data.heroBanners) && data.heroBanners.length > 0) {
              const bannerSection = document.querySelector('section[aria-label="Hero Banners"]');
              if (bannerSection) {
                const bannerContainer = bannerSection.querySelector('div[style*="display: flex"], div[style*="display:flex"]') || bannerSection;
                const bannerImages = bannerContainer.querySelectorAll('img');
                
                bannerImages.forEach((img, index) => {
                  const bannerIndex = index % data.heroBanners.length;
                  if (data.heroBanners[bannerIndex]?.image) {
                    let imageSrc = data.heroBanners[bannerIndex].image;
                    if (imageSrc.startsWith('/') && !imageSrc.startsWith('//') && !imageSrc.startsWith('http')) {
                      imageSrc = `${window.location.origin}${imageSrc}`;
                    }
                    (img as HTMLImageElement).src = imageSrc;
                    (img as HTMLImageElement).alt = data.heroBanners[bannerIndex].alt || '';
                  }
                });
              }
            }
            
            // Update offers section images
            if (data.offers?.items && Array.isArray(data.offers.items)) {
              const allHeadings = document.querySelectorAll('h1, h2, h3');
              allHeadings.forEach((heading) => {
                if (heading.textContent && heading.textContent.includes('Offers')) {
                  const offersSection = heading.closest('section, div') || heading.parentElement;
                  if (offersSection) {
                    const offerImages = offersSection.querySelectorAll('img');
                    offerImages.forEach((img, index) => {
                      if (index < data.offers.items.length && data.offers.items[index]?.image) {
                        let imageSrc = data.offers.items[index].image;
                        if (imageSrc.startsWith('/') && !imageSrc.startsWith('//') && !imageSrc.startsWith('http')) {
                          imageSrc = `${window.location.origin}${imageSrc}`;
                        }
                        (img as HTMLImageElement).src = imageSrc;
                        (img as HTMLImageElement).alt = data.offers.items[index].alt || '';
                      }
                    });
                  }
                }
              });
            }
          }
          
          // Homepage updates
          if (sectionId === 'homepage') {
            // Update offers section - find offers grid images
            if (data.heroSection?.offers?.items && Array.isArray(data.heroSection.offers.items)) {
              // Try multiple selectors to find offer images
              const offersSection = document.querySelector('section')?.querySelector('h2')?.textContent === 'Offers' 
                ? document.querySelector('section') 
                : Array.from(document.querySelectorAll('section')).find(s => 
                    s.querySelector('h2')?.textContent === 'Offers'
                  );
              
              if (offersSection) {
                const offerImages = offersSection.querySelectorAll('img');
                offerImages.forEach((img, index) => {
                  if (index < data.heroSection.offers.items.length && data.heroSection.offers.items[index]?.image) {
                    let imageSrc = data.heroSection.offers.items[index].image;
                    // Convert relative paths to absolute URLs pointing to the main app
                    if (imageSrc.startsWith('/') && !imageSrc.startsWith('//') && !imageSrc.startsWith('http')) {
                      const mainAppOrigin = window.location.origin.replace(':3001', ':3000');
                      imageSrc = `${mainAppOrigin}${imageSrc}`;
                    } else if (imageSrc.startsWith('data:')) {
                      imageSrc = imageSrc;
                    }
                    (img as HTMLImageElement).src = imageSrc;
                    (img as HTMLImageElement).alt = data.heroSection.offers.items[index].alt || '';
                  }
                });
              }
            }
          }
          
          // Trends page updates
          if (sectionId === 'trends' && data.sections && Array.isArray(data.sections)) {
            data.sections.forEach((section: any, index: number) => {
              // Find trend sections by data-section-id or order
              const sectionElements = document.querySelectorAll('[data-section-id="trending"], [data-section-id="best-sellers"]');
              const sectionElement = sectionElements[index];
              
              if (sectionElement) {
                // Update banner background
                const banner = sectionElement.querySelector('.trending-banner') as HTMLElement;
                if (banner && section.bgColor) {
                  banner.style.background = section.bgColor;
                }
                
                // Update text content
                const title = sectionElement.querySelector('.trending-banner-title');
                if (title && section.title) {
                  title.textContent = section.title;
                }
                
                const subtitle = sectionElement.querySelector('.trending-banner-subtitle');
                if (subtitle && section.subtitle) {
                  subtitle.textContent = section.subtitle;
                }
                
                const tagline = sectionElement.querySelector('.trending-banner-tagline');
                if (tagline && section.tagline) {
                  tagline.textContent = section.tagline;
                }
                
                // Update image
                const bannerImg = sectionElement.querySelector('.trending-banner-image img') as HTMLImageElement;
                if (bannerImg && section.image) {
                  let imageSrc = section.image;
                  // Convert relative paths to absolute URLs pointing to the main app
                  if (imageSrc.startsWith('/') && !imageSrc.startsWith('//') && !imageSrc.startsWith('http')) {
                    const mainAppOrigin = window.location.origin.replace(':3001', ':3000');
                    imageSrc = `${mainAppOrigin}${imageSrc}`;
                  } else if (imageSrc.startsWith('data:')) {
                    imageSrc = imageSrc;
                  }
                  bannerImg.src = imageSrc;
                  bannerImg.alt = section.title || '';
                }
                
                // Update button
                const button = sectionElement.querySelector('.trending-banner-button');
                if (button && section.buttonText) {
                  button.textContent = section.buttonText;
                }
              }
            });
          }
          
          // Terms & Conditions updates
          if (sectionId === 'termsConditions') {
            if (data.title) {
              const titleElement = document.querySelector('h1, .page-title, [class*="title"]');
              if (titleElement) {
                titleElement.textContent = data.title;
              }
            }
            if (data.content) {
              // Try to find content container
              const contentElements = document.querySelectorAll('main, .content, [class*="content"], article');
              contentElements.forEach(el => {
                // Check if it contains markdown-like content
                if (el.textContent && el.textContent.length > 100) {
                  // Convert markdown to HTML (simple conversion)
                  const htmlContent = data.content
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/\n/g, '<br>');
                  el.innerHTML = htmlContent;
                }
              });
            }
          }
          
          // Privacy Policy updates - only dispatch event, let React component handle rendering
          if (sectionId === 'privacy-policy' || sectionId === 'privacyPolicy') {
            // Dispatch custom event for the page component to handle (React will re-render)
            window.dispatchEvent(new CustomEvent('adminPreviewUpdate', {
              detail: { sectionId: 'privacy-policy', data }
            }));
          }
          
          // Refer & Earn updates
          if (sectionId === 'referEarn') {
            if (data.referralCode) {
              const codeElements = document.querySelectorAll('.refer-code-value, [class*="referral-code"], [class*="code"]');
              codeElements.forEach(el => {
                if (el.textContent && el.textContent.length < 20) {
                  el.textContent = data.referralCode;
                }
              });
            }
            if (data.rewardAmount !== undefined) {
              const rewardElements = document.querySelectorAll('[class*="reward"], [class*="earn"]');
              rewardElements.forEach(el => {
                const text = el.textContent || '';
                if (text.includes('₹') || text.includes('250')) {
                  el.textContent = text.replace(/₹\d+/, `₹${data.rewardAmount}`).replace(/\d+/, String(data.rewardAmount));
                }
              });
            }
          }
        } catch (error) {
          console.error('Error applying admin preview update:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return null;
}
