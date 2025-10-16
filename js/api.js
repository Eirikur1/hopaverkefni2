// API service for Venuu app

export class ApiService {
    constructor(baseUrl = '') {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    /**
     * Make HTTP request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Response data
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} Response data
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body data
     * @returns {Promise<Object>} Response data
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise<Object>} Response data
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Events API service
export class EventsApi extends ApiService {
    constructor() {
        super();
        this.eventsCache = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
        this.lastFetch = 0;
    }

    /**
     * Get all events with caching
     * @returns {Promise<Array>} Array of events
     */
    async getEvents() {
        const now = Date.now();
        
        // Return cached data if still valid
        if (this.eventsCache && (now - this.lastFetch) < this.cacheExpiry) {
            return this.eventsCache;
        }

        try {
            // Try to fetch from API first
            const events = await this.get('/api/events');
            this.eventsCache = events;
            this.lastFetch = now;
            return events;
        } catch (error) {
            console.warn('API fetch failed, trying local data:', error);
            
            // Fallback to local JSON file
            try {
                const response = await fetch('./api-data.json');
                const events = await response.json();
                this.eventsCache = events;
                this.lastFetch = now;
                return events;
            } catch (localError) {
                console.error('Failed to load events from local file:', localError);
                throw new Error('Unable to load events data');
            }
        }
    }

    /**
     * Get event by ID
     * @param {string} eventId - Event ID
     * @returns {Promise<Object>} Event data
     */
    async getEventById(eventId) {
        const events = await this.getEvents();
        return events.find(event => event.id === eventId);
    }

    /**
     * Search events
     * @param {Object} searchParams - Search parameters
     * @returns {Promise<Array>} Filtered events
     */
    async searchEvents(searchParams = {}) {
        const events = await this.getEvents();
        
        return events.filter(event => {
            // Text search
            if (searchParams.query) {
                const query = searchParams.query.toLowerCase();
                const matchesText = 
                    event.title.toLowerCase().includes(query) ||
                    event.description?.toLowerCase().includes(query) ||
                    event.location.toLowerCase().includes(query) ||
                    event.category.toLowerCase().includes(query);
                
                if (!matchesText) return false;
            }

            // Category filter
            if (searchParams.category && event.category !== searchParams.category) {
                return false;
            }

            // Location filter
            if (searchParams.location && event.location !== searchParams.location) {
                return false;
            }

            // Date range filter
            if (searchParams.startDate || searchParams.endDate) {
                const eventDate = new Date(event.date);
                
                if (searchParams.startDate && eventDate < new Date(searchParams.startDate)) {
                    return false;
                }
                
                if (searchParams.endDate && eventDate > new Date(searchParams.endDate)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Get unique categories
     * @returns {Promise<Array>} Array of categories
     */
    async getCategories() {
        const events = await this.getEvents();
        return [...new Set(events.map(event => event.category))].sort();
    }

    /**
     * Get unique locations
     * @returns {Promise<Array>} Array of locations
     */
    async getLocations() {
        const events = await this.getEvents();
        return [...new Set(events.map(event => event.location))].sort();
    }

    /**
     * Get featured events
     * @param {number} limit - Number of events to return
     * @returns {Promise<Array>} Array of featured events
     */
    async getFeaturedEvents(limit = 6) {
        const events = await this.getEvents();
        
        // Sort by date and return upcoming events
        const upcomingEvents = events
            .filter(event => new Date(event.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return upcomingEvents.slice(0, limit);
    }

    /**
     * Get events by category
     * @param {string} category - Category name
     * @returns {Promise<Array>} Array of events in category
     */
    async getEventsByCategory(category) {
        const events = await this.getEvents();
        return events.filter(event => event.category === category);
    }

    /**
     * Get events by location
     * @param {string} location - Location name
     * @returns {Promise<Array>} Array of events in location
     */
    async getEventsByLocation(location) {
        const events = await this.getEvents();
        return events.filter(event => event.location === location);
    }
}

// User preferences API (local storage based)
export class UserPreferencesApi {
    constructor() {
        this.storageKey = 'venuu-preferences';
    }

    /**
     * Get user preferences
     * @returns {Object} User preferences
     */
    getPreferences() {
        const defaultPrefs = {
            favorites: [],
            theme: 'light',
            language: 'en',
            notifications: true,
            searchHistory: []
        };

        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
        } catch (error) {
            console.error('Error loading preferences:', error);
            return defaultPrefs;
        }
    }

    /**
     * Save user preferences
     * @param {Object} preferences - Preferences to save
     */
    savePreferences(preferences) {
        try {
            const currentPrefs = this.getPreferences();
            const updatedPrefs = { ...currentPrefs, ...preferences };
            localStorage.setItem(this.storageKey, JSON.stringify(updatedPrefs));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    /**
     * Add event to favorites
     * @param {string} eventId - Event ID to favorite
     */
    addToFavorites(eventId) {
        const prefs = this.getPreferences();
        if (!prefs.favorites.includes(eventId)) {
            prefs.favorites.push(eventId);
            this.savePreferences(prefs);
        }
    }

    /**
     * Remove event from favorites
     * @param {string} eventId - Event ID to unfavorite
     */
    removeFromFavorites(eventId) {
        const prefs = this.getPreferences();
        prefs.favorites = prefs.favorites.filter(id => id !== eventId);
        this.savePreferences(prefs);
    }

    /**
     * Check if event is favorited
     * @param {string} eventId - Event ID to check
     * @returns {boolean} Whether event is favorited
     */
    isFavorited(eventId) {
        const prefs = this.getPreferences();
        return prefs.favorites.includes(eventId);
    }

    /**
     * Get favorite events
     * @returns {Array} Array of favorite event IDs
     */
    getFavorites() {
        const prefs = this.getPreferences();
        return prefs.favorites;
    }

    /**
     * Add search to history
     * @param {string} query - Search query
     */
    addSearchToHistory(query) {
        if (!query.trim()) return;
        
        const prefs = this.getPreferences();
        const history = prefs.searchHistory.filter(item => item !== query);
        history.unshift(query);
        prefs.searchHistory = history.slice(0, 10); // Keep only last 10 searches
        this.savePreferences(prefs);
    }

    /**
     * Get search history
     * @returns {Array} Array of search queries
     */
    getSearchHistory() {
        const prefs = this.getPreferences();
        return prefs.searchHistory;
    }

    /**
     * Clear search history
     */
    clearSearchHistory() {
        const prefs = this.getPreferences();
        prefs.searchHistory = [];
        this.savePreferences(prefs);
    }
}

// Make APIs available globally for non-module usage
if (typeof window !== 'undefined') {
    window.EventsApi = EventsApi;
    window.UserPreferencesApi = UserPreferencesApi;
}
