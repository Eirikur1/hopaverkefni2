// API service for Venuu app
import { VenuuEvent } from "./types.js";

interface RequestOptions extends RequestInit {
  headers?: HeadersInit;
}

export class ApiService {
  protected baseUrl: string;
  protected defaultHeaders: HeadersInit;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return (await response.text()) as any;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<T> {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request<T>(url, {
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data: any = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data: any = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }
}

interface SearchParams {
  query?: string;
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
}

// Events API service
export class EventsApi extends ApiService {
  private eventsCache: VenuuEvent[] | null = null;
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastFetch: number = 0;

  constructor() {
    super();
  }

  /**
   * Get all events with caching
   */
  async getEvents(): Promise<VenuuEvent[]> {
    const now = Date.now();

    // Return cached data if still valid
    if (this.eventsCache && now - this.lastFetch < this.cacheExpiry) {
      return this.eventsCache;
    }

    try {
      // Try to fetch from API first
      const events = await this.get<VenuuEvent[]>("/api/events");
      this.eventsCache = events;
      this.lastFetch = now;
      return events;
    } catch (error) {
      console.warn("API fetch failed, trying local data:", error);

      // Fallback to local JSON file
      try {
        const response = await fetch("./api-data.json");
        const events: VenuuEvent[] = await response.json();
        this.eventsCache = events;
        this.lastFetch = now;
        return events;
      } catch (localError) {
        console.error("Failed to load events from local file:", localError);
        throw new Error("Unable to load events data");
      }
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<VenuuEvent | undefined> {
    const events = await this.getEvents();
    return events.find((event) => event.id === eventId);
  }

  /**
   * Search events
   */
  async searchEvents(searchParams: SearchParams = {}): Promise<VenuuEvent[]> {
    const events = await this.getEvents();

    return events.filter((event) => {
      // Get title from various possible locations
      const title =
        event.title ||
        event.title_en ||
        (event.language && event.language.en && event.language.en.title) ||
        "";

      // Get location from various possible locations
      const location =
        event.location ||
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
        const matchesText =
          title.toLowerCase().includes(query) ||
          (event.description &&
            event.description.toLowerCase().includes(query)) ||
          location.toLowerCase().includes(query) ||
          categories.some((cat) => cat.toLowerCase().includes(query));

        if (!matchesText) return false;
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

        if (
          searchParams.startDate &&
          eventDate < new Date(searchParams.startDate)
        ) {
          return false;
        }

        if (
          searchParams.endDate &&
          eventDate > new Date(searchParams.endDate)
        ) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get unique categories
   */
  async getCategories(): Promise<string[]> {
    const events = await this.getEvents();
    const categoriesSet = new Set<string>();

    events.forEach((event) => {
      if (Array.isArray(event.category)) {
        event.category.forEach((cat) => categoriesSet.add(cat));
      } else if (event.category) {
        categoriesSet.add(event.category);
      } else if (event.event_category) {
        categoriesSet.add(event.event_category);
      }
    });

    return Array.from(categoriesSet).sort();
  }

  /**
   * Get unique locations
   */
  async getLocations(): Promise<string[]> {
    const events = await this.getEvents();
    const locationsSet = new Set<string>();

    events.forEach((event) => {
      const location =
        event.location ||
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
  async getFeaturedEvents(limit: number = 6): Promise<VenuuEvent[]> {
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
  async getEventsByCategory(category: string): Promise<VenuuEvent[]> {
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
  async getEventsByLocation(location: string): Promise<VenuuEvent[]> {
    const events = await this.getEvents();
    return events.filter((event) => {
      const eventLocation =
        event.location ||
        event.formatted_address ||
        event.city ||
        (event.language && event.language.en && event.language.en.place);

      return eventLocation === location;
    });
  }
}

interface UserPreferences {
  favorites: string[];
  theme: string;
  language: string;
  notifications: boolean;
  searchHistory: string[];
}

// User preferences API (local storage based)
export class UserPreferencesApi {
  private storageKey: string = "venuu-preferences";

  /**
   * Get user preferences
   */
  getPreferences(): UserPreferences {
    const defaultPrefs: UserPreferences = {
      favorites: [],
      theme: "light",
      language: "en",
      notifications: true,
      searchHistory: [],
    };

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
    } catch (error) {
      console.error("Error loading preferences:", error);
      return defaultPrefs;
    }
  }

  /**
   * Save user preferences
   */
  savePreferences(preferences: Partial<UserPreferences>): void {
    try {
      const currentPrefs = this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      localStorage.setItem(this.storageKey, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  }

  /**
   * Add event to favorites
   */
  addToFavorites(eventId: string): void {
    const prefs = this.getPreferences();
    if (!prefs.favorites.includes(eventId)) {
      prefs.favorites.push(eventId);
      this.savePreferences(prefs);
    }
  }

  /**
   * Remove event from favorites
   */
  removeFromFavorites(eventId: string): void {
    const prefs = this.getPreferences();
    prefs.favorites = prefs.favorites.filter((id) => id !== eventId);
    this.savePreferences(prefs);
  }

  /**
   * Check if event is favorited
   */
  isFavorited(eventId: string): boolean {
    const prefs = this.getPreferences();
    return prefs.favorites.includes(eventId);
  }

  /**
   * Get favorite events
   */
  getFavorites(): string[] {
    const prefs = this.getPreferences();
    return prefs.favorites;
  }

  /**
   * Add search to history
   */
  addSearchToHistory(query: string): void {
    if (!query.trim()) return;

    const prefs = this.getPreferences();
    const history = prefs.searchHistory.filter((item) => item !== query);
    history.unshift(query);
    prefs.searchHistory = history.slice(0, 10); // Keep only last 10 searches
    this.savePreferences(prefs);
  }

  /**
   * Get search history
   */
  getSearchHistory(): string[] {
    const prefs = this.getPreferences();
    return prefs.searchHistory;
  }

  /**
   * Clear search history
   */
  clearSearchHistory(): void {
    const prefs = this.getPreferences();
    prefs.searchHistory = [];
    this.savePreferences(prefs);
  }
}

// Make APIs available globally for non-module usage
declare global {
  interface Window {
    EventsApi: typeof EventsApi;
    UserPreferencesApi: typeof UserPreferencesApi;
  }
}

if (typeof window !== "undefined") {
  window.EventsApi = EventsApi;
  window.UserPreferencesApi = UserPreferencesApi;
}
