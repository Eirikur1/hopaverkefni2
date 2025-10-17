// Utility functions for Venuu app
export class Utils {
    /**
     * Debounce function to limit the rate of function calls
     */
    static debounce(func, wait, immediate = false) {
        let timeout = null;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate)
                    func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(later, wait);
            if (callNow)
                func.apply(this, args);
        };
    }
    /**
     * Throttle function to limit the rate of function calls
     */
    static throttle(func, limit) {
        let inThrottle = false;
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
     */
    static formatRelativeTime(date) {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
        if (diffInSeconds < 60)
            return "Just now";
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
    static sanitizeHTML(str) {
        const temp = document.createElement("div");
        temp.textContent = str;
        return temp.innerHTML;
    }
    /**
     * Generate unique ID
     */
    static generateId(prefix = "id") {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Check if element is in viewport
     */
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    }
    /**
     * Smooth scroll to element
     */
    static smoothScrollTo(target, offset = 0) {
        const element = typeof target === "string" ? document.querySelector(target) : target;
        if (!element)
            return;
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
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        }
        catch (err) {
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
            }
            catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }
    /**
     * Get query parameters from URL
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
     */
    static setQueryParams(params, replace = true) {
        const url = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") {
                url.searchParams.delete(key);
            }
            else {
                url.searchParams.set(key, value);
            }
        });
        if (replace) {
            window.history.replaceState({}, "", url.toString());
        }
        else {
            window.history.pushState({}, "", url.toString());
        }
    }
}
/**
 * Local storage helpers
 */
Utils.storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        }
        catch (error) {
            console.error("Error reading from localStorage:", error);
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        }
        catch (error) {
            console.error("Error writing to localStorage:", error);
            return false;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        }
        catch (error) {
            console.error("Error removing from localStorage:", error);
            return false;
        }
    },
};
/**
 * Animation helpers using vanilla JS
 */
Utils.animations = {
    fadeIn(element, duration = 300) {
        element.style.opacity = "0";
        element.style.display = "block";
        const start = performance.now();
        function animate(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            element.style.opacity = progress.toString();
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    },
    fadeOut(element, duration = 300) {
        const start = performance.now();
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        function animate(timestamp) {
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            element.style.opacity = (initialOpacity * (1 - progress)).toString();
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
            else {
                element.style.display = "none";
            }
        }
        requestAnimationFrame(animate);
    },
    slideIn(element, duration = 300) {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.display = "block";
        const start = performance.now();
        function animate(timestamp) {
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
    staggerIn(elements, duration = 300, stagger = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                Utils.animations.slideIn(element, duration);
            }, index * stagger);
        });
    },
};
if (typeof window !== "undefined") {
    window.Utils = Utils;
}
//# sourceMappingURL=utils.js.map