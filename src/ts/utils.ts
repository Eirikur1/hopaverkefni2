// Utility functions for Venuu app

export class Utils {
  /**
   * Debounce function to limit the rate of function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(this: any, ...args: Parameters<T>): void {
      const later = (): void => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };

      const callNow = immediate && !timeout;

      if (timeout !== null) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(later, wait);

      if (callNow) func.apply(this, args);
    };
  }

  /**
   * Throttle function to limit the rate of function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return function (this: any, ...args: Parameters<T>): void {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Format date to readable string
   */
  static formatDate(date: string | Date, locale: string = "en-US"): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Format date to relative time (e.g., "2 days ago")
   */
  static formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000)
      return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  }

  /**
   * Sanitize HTML string to prevent XSS
   */
  static sanitizeHTML(str: string): string {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }

  /**
   * Generate unique ID
   */
  static generateId(prefix: string = "id"): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if element is in viewport
   */
  static isInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Smooth scroll to element
   */
  static smoothScrollTo(target: Element | string, offset: number = 0): void {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  }

  /**
   * Get query parameters from URL
   */
  static getQueryParams(
    url: string = window.location.href
  ): Record<string, string> {
    const params = new URLSearchParams(new URL(url).search);
    const result: Record<string, string> = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Set query parameters in URL
   */
  static setQueryParams(
    params: Record<string, string | null | undefined>,
    replace: boolean = true
  ): void {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });

    if (replace) {
      window.history.replaceState({}, "", url.toString());
    } else {
      window.history.pushState({}, "", url.toString());
    }
  }

  /**
   * Local storage helpers
   */
  static storage = {
    get<T = any>(key: string, defaultValue: T | null = null): T | null {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        return defaultValue;
      }
    },

    set(key: string, value: any): boolean {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error("Error writing to localStorage:", error);
        return false;
      }
    },

    remove(key: string): boolean {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error("Error removing from localStorage:", error);
        return false;
      }
    },
  };

  /**
   * Animation helpers using vanilla JS
   */
  static animations = {
    fadeIn(element: HTMLElement, duration: number = 300): void {
      element.style.opacity = "0";
      element.style.display = "block";

      const start = performance.now();

      function animate(timestamp: number): void {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.opacity = progress.toString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    },

    fadeOut(element: HTMLElement, duration: number = 300): void {
      const start = performance.now();
      const initialOpacity = parseFloat(getComputedStyle(element).opacity);

      function animate(timestamp: number): void {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.opacity = (initialOpacity * (1 - progress)).toString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.display = "none";
        }
      }

      requestAnimationFrame(animate);
    },

    slideIn(element: HTMLElement, duration: number = 300): void {
      element.style.opacity = "0";
      element.style.transform = "translateY(20px)";
      element.style.display = "block";

      const start = performance.now();

      function animate(timestamp: number): void {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (easeOut)
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        element.style.opacity = easeProgress.toString();
        element.style.transform = `translateY(${20 * (1 - easeProgress)}px)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    },

    staggerIn(
      elements: HTMLElement[],
      duration: number = 300,
      stagger: number = 100
    ): void {
      elements.forEach((element, index) => {
        setTimeout(() => {
          Utils.animations.slideIn(element, duration);
        }, index * stagger);
      });
    },
  };
}

// Make Utils available globally for non-module usage
declare global {
  interface Window {
    Utils: typeof Utils;
  }
}

if (typeof window !== "undefined") {
  window.Utils = Utils;
}
