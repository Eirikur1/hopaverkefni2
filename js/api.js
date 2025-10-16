export class ApiService {
    constructor(baseUrl = "") {
        this.baseUrl = baseUrl;
        this.defaultHeaders = {
            "Content-Type": "application/json",
        };
    }
    /**
     * Make HTTP request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = Object.assign({ headers: Object.assign(Object.assign({}, this.defaultHeaders), options.headers) }, options);
        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            }
            return (await response.text());
        }
        catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }
    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, {
            method: "GET",
        });
    }
    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: "DELETE",
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
     */
    async getEvents() {
        const now = Date.now();
        // Return cached data if still valid
        if (this.eventsCache && now - this.lastFetch < this.cacheExpiry) {
            return this.eventsCache;
        }
        try {
            // Try to fetch from API first
            const events = await this.get("/api/events");
            this.eventsCache = events;
            this.lastFetch = now;
            return events;
        }
        catch (error) {
            console.warn("API fetch failed, trying local data:", error);
            // Fallback to local JSON file
            try {
                const response = await fetch("./api-data.json");
                const events = await response.json();
                this.eventsCache = events;
                this.lastFetch = now;
                return events;
            }
            catch (localError) {
                console.error("Failed to load events from local file:", localError);
                throw new Error("Unable to load events data");
            }
        }
    }
    /**
     * Get event by ID
     */
    async getEventById(eventId) {
        const events = await this.getEvents();
        return events.find((event) => event.id === eventId);
    }
    /**
     * Search events
     */
    async searchEvents(searchParams = {}) {
        const events = await this.getEvents();
        return events.filter((event) => {
            // Get title from various possible locations
            const title = event.title ||
                event.title_en ||
                (event.language && event.language.en && event.language.en.title) ||
                "";
            // Get location from various possible locations
            const location = event.location ||
                event.formatted_address ||
                event.city ||
                (event.language && event.language.en && event.language.en.place) ||
                "";
            // Get category - handle both array and string
            const categories = Array.isArray(event.category)
                ? event.category
                : [event.category || event.event_category || ""];
            // Text search
            if (searchParams.query) {
                const query = searchParams.query.toLowerCase();
                const matchesText = title.toLowerCase().includes(query) ||
                    (event.description &&
                        event.description.toLowerCase().includes(query)) ||
                    location.toLowerCase().includes(query) ||
                    categories.some((cat) => cat.toLowerCase().includes(query));
                if (!matchesText)
                    return false;
            }
            // Category filter
            if (searchParams.category) {
                if (!categories.includes(searchParams.category)) {
                    return false;
                }
            }
            // Location filter
            if (searchParams.location && location !== searchParams.location) {
                return false;
            }
            // Date range filter
            if (searchParams.startDate || searchParams.endDate) {
                const eventDate = new Date(event.start || event.date || "");
                if (searchParams.startDate &&
                    eventDate < new Date(searchParams.startDate)) {
                    return false;
                }
                if (searchParams.endDate &&
                    eventDate > new Date(searchParams.endDate)) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * Get unique categories
     */
    async getCategories() {
        const events = await this.getEvents();
        const categoriesSet = new Set();
        events.forEach((event) => {
            if (Array.isArray(event.category)) {
                event.category.forEach((cat) => categoriesSet.add(cat));
            }
            else if (event.category) {
                categoriesSet.add(event.category);
            }
            else if (event.event_category) {
                categoriesSet.add(event.event_category);
            }
        });
        return Array.from(categoriesSet).sort();
    }
    /**
     * Get unique locations
     */
    async getLocations() {
        const events = await this.getEvents();
        const locationsSet = new Set();
        events.forEach((event) => {
            const location = event.location ||
                event.formatted_address ||
                event.city ||
                (event.language && event.language.en && event.language.en.place);
            if (location) {
                locationsSet.add(location);
            }
        });
        return Array.from(locationsSet).sort();
    }
    /**
     * Get featured events
     */
    async getFeaturedEvents(limit = 6) {
        const events = await this.getEvents();
        // Sort by date and return upcoming events
        const upcomingEvents = events
            .filter((event) => {
            const eventDate = new Date(event.start || event.date || "");
            return eventDate >= new Date();
        })
            .sort((a, b) => {
            const dateA = new Date(a.start || a.date || "");
            const dateB = new Date(b.start || b.date || "");
            return dateA.getTime() - dateB.getTime();
        });
        return upcomingEvents.slice(0, limit);
    }
    /**
     * Get events by category
     */
    async getEventsByCategory(category) {
        const events = await this.getEvents();
        return events.filter((event) => {
            if (Array.isArray(event.category)) {
                return event.category.includes(category);
            }
            return event.category === category || event.event_category === category;
        });
    }
    /**
     * Get events by location
     */
    async getEventsByLocation(location) {
        const events = await this.getEvents();
        return events.filter((event) => {
            const eventLocation = event.location ||
                event.formatted_address ||
                event.city ||
                (event.language && event.language.en && event.language.en.place);
            return eventLocation === location;
        });
    }
}
// User preferences API (local storage based)
export class UserPreferencesApi {
    constructor() {
        this.storageKey = "venuu-preferences";
    }
    /**
     * Get user preferences
     */
    getPreferences() {
        const defaultPrefs = {
            favorites: [],
            theme: "light",
            language: "en",
            notifications: true,
            searchHistory: [],
        };
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? Object.assign(Object.assign({}, defaultPrefs), JSON.parse(stored)) : defaultPrefs;
        }
        catch (error) {
            console.error("Error loading preferences:", error);
            return defaultPrefs;
        }
    }
    /**
     * Save user preferences
     */
    savePreferences(preferences) {
        try {
            const currentPrefs = this.getPreferences();
            const updatedPrefs = Object.assign(Object.assign({}, currentPrefs), preferences);
            localStorage.setItem(this.storageKey, JSON.stringify(updatedPrefs));
        }
        catch (error) {
            console.error("Error saving preferences:", error);
        }
    }
    /**
     * Add event to favorites
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
     */
    removeFromFavorites(eventId) {
        const prefs = this.getPreferences();
        prefs.favorites = prefs.favorites.filter((id) => id !== eventId);
        this.savePreferences(prefs);
    }
    /**
     * Check if event is favorited
     */
    isFavorited(eventId) {
        const prefs = this.getPreferences();
        return prefs.favorites.includes(eventId);
    }
    /**
     * Get favorite events
     */
    getFavorites() {
        const prefs = this.getPreferences();
        return prefs.favorites;
    }
    /**
     * Add search to history
     */
    addSearchToHistory(query) {
        if (!query.trim())
            return;
        const prefs = this.getPreferences();
        const history = prefs.searchHistory.filter((item) => item !== query);
        history.unshift(query);
        prefs.searchHistory = history.slice(0, 10); // Keep only last 10 searches
        this.savePreferences(prefs);
    }
    /**
     * Get search history
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
if (typeof window !== "undefined") {
    window.EventsApi = EventsApi;
    window.UserPreferencesApi = UserPreferencesApi;
}
//# sourceMappingURL=api.js.map