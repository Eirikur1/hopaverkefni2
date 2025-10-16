// Utility functions for Venuu app

export class Utils {
  /**
   * Debounce function to limit the rate of function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Whether to call immediately
   * @returns {Function} Debounced function
   */
  static debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  /**
   * Throttle function to limit the rate of function calls
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Format date to readable string
   * @param {string|Date} date - Date to format
   * @param {string} locale - Locale for formatting
   * @returns {string} Formatted date string
   */
  static formatDate(date, locale = "en-US") {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Format date to relative time (e.g., "2 days ago")
   * @param {string|Date} date - Date to format
   * @returns {string} Relative time string
   */
  static formatRelativeTime(date) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

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
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeHTML(str) {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }

  /**
   * Generate unique ID
   * @param {string} prefix - Prefix for the ID
   * @returns {string} Unique ID
   */
  static generateId(prefix = "id") {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if element is in viewport
   * @param {Element} element - Element to check
   * @returns {boolean} Whether element is in viewport
   */
  static isInViewport(element) {
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
   * @param {Element|string} target - Element or selector to scroll to
   * @param {number} offset - Offset from top
   */
  static smoothScrollTo(target, offset = 0) {
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
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Whether copy was successful
   */
  static async copyToClipboard(text) {
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
   * @param {string} url - URL to parse (defaults to current URL)
   * @returns {Object} Query parameters object
   */
  static getQueryParams(url = window.location.href) {
    const params = new URLSearchParams(new URL(url).search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Set query parameters in URL
   * @param {Object} params - Parameters to set
   * @param {boolean} replace - Whether to replace current history entry
   */
  static setQueryParams(params, replace = true) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });

    if (replace) {
      window.history.replaceState({}, "", url);
    } else {
      window.history.pushState({}, "", url);
    }
  }

  /**
   * Local storage helpers
   */
  static storage = {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error("Error reading from localStorage:", error);
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error("Error writing to localStorage:", error);
        return false;
      }
    },

    remove(key) {
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
   * Animation helpers
   */
  static animations = {
    fadeIn(element, duration = 300) {
      element.style.opacity = "0";
      element.style.display = "block";

      let start = performance.now();

      function animate(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.opacity = progress;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }

      requestAnimationFrame(animate);
    },

    fadeOut(element, duration = 300) {
      let start = performance.now();
      const initialOpacity = parseFloat(getComputedStyle(element).opacity);

      function animate(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.opacity = initialOpacity * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.display = "none";
        }
      }

      requestAnimationFrame(animate);
    },
  };
}

// Make Utils available globally for non-module usage
if (typeof window !== "undefined") {
  window.Utils = Utils;
}
