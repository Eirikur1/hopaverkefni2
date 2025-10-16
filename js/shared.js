// Venuu - Shared TypeScript functionality
// Main application controller
import { Utils } from "./utils.js";
class VenuuApp {
    constructor() {
        this.events = [];
        this.filteredEvents = [];
        this.currentFilters = {
            category: "",
            location: "",
            sort: "date",
            dateOrder: "asc",
        };
        this.searchQuery = "";
        this.init();
    }
    async init() {
        console.log("VenuuApp init() called");
        try {
            console.log("Loading events...");
            await this.loadEvents();
            console.log("Setting up event listeners...");
            this.setupEventListeners();
            console.log("Initializing components...");
            this.initializeComponents();
            console.log("Rendering events...");
            this.renderEvents();
            console.log("App initialization complete");
        }
        catch (error) {
            console.error("Failed to initialize app:", error);
        }
    }
    async loadEvents() {
        try {
            const response = await fetch("./api-data.json");
            this.events = await response.json();
            this.filteredEvents = [...this.events];
            this.populateFilters();
        }
        catch (error) {
            console.error("Error loading events:", error);
            // Fallback to sample data if API fails
            this.events = this.getSampleEvents();
            this.filteredEvents = [...this.events];
        }
    }
    getSampleEvents() {
        return [
            {
                id: "event-1",
                title: "Northern Lights Photography Workshop",
                date: "2024-03-15",
                location: "Reykjavik",
                category: ["Photography"],
                image: "Images/posters/068e9d4bef717cd1000843dc38c603ec.jpg",
                description: "Learn to capture the magical Northern Lights with professional guidance.",
            },
            {
                id: "event-2",
                title: "Icelandic Music Festival",
                date: "2024-04-22",
                location: "Reykjavik",
                category: ["Music"],
                image: "Images/posters/1d595e6dc1b6a3d963b932eb94de79d1.jpg",
                description: "Experience the best of Icelandic music and culture.",
            },
            {
                id: "event-3",
                title: "Glacier Hiking Adventure",
                date: "2024-05-08",
                location: "Vatnajökull",
                category: ["Adventure"],
                image: "Images/posters/233986128f46951bf66a727cca1b3a18.jpg",
                description: "Explore Iceland's magnificent glaciers with expert guides.",
            },
            {
                id: "event-4",
                title: "Hot Spring Wellness Retreat",
                date: "2024-06-12",
                location: "Blue Lagoon",
                category: ["Wellness"],
                image: "Images/posters/24de6470d3365d85550c2c65ce8ddfca.jpg",
                description: "Relax and rejuvenate in Iceland's natural hot springs.",
            },
            {
                id: "event-5",
                title: "Viking Heritage Tour",
                date: "2024-07-03",
                location: "Reykjavik",
                category: ["Culture"],
                image: "Images/posters/3bd777f8c2760cbf585251808e738698.jpg",
                description: "Discover Iceland's rich Viking history and heritage.",
            },
            {
                id: "event-6",
                title: "Midnight Sun Photography",
                date: "2024-08-18",
                location: "Akureyri",
                category: ["Photography"],
                image: "Images/posters/3f117cff666f231104f270edda727dab.jpg",
                description: "Capture the beauty of Iceland's midnight sun.",
            },
        ];
    }
    populateFilters() {
        const categoriesSet = new Set();
        const locationsSet = new Set();
        this.events.forEach((event) => {
            // Handle category (can be array or string)
            if (Array.isArray(event.category)) {
                event.category.forEach((cat) => categoriesSet.add(cat));
            }
            else if (event.category) {
                categoriesSet.add(event.category);
            }
            // Handle location from various fields
            const location = event.location ||
                event.formatted_address ||
                event.city ||
                (event.language && event.language.en && event.language.en.place);
            if (location) {
                locationsSet.add(location);
            }
        });
        const categories = Array.from(categoriesSet);
        const locations = Array.from(locationsSet);
        this.populateSelect("category-filter", categories);
        this.populateSelect("location-filter", locations);
    }
    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        if (!select)
            return;
        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        options.sort().forEach((option) => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById("search-input");
        const searchBtn = document.getElementById("searchBtn");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }
        if (searchBtn) {
            searchBtn.addEventListener("click", () => {
                this.applyFilters();
            });
        }
        // Filter controls
        const categoryFilter = document.getElementById("category-filter");
        const locationFilter = document.getElementById("location-filter");
        const sortFilter = document.getElementById("sort-filter");
        const dateOrderToggle = document.getElementById("date-order-toggle");
        const clearFilters = document.getElementById("clear-filters");
        if (categoryFilter) {
            categoryFilter.addEventListener("change", (e) => {
                this.currentFilters.category = e.target.value;
                this.applyFilters();
            });
        }
        if (locationFilter) {
            locationFilter.addEventListener("change", (e) => {
                this.currentFilters.location = e.target.value;
                this.applyFilters();
            });
        }
        if (sortFilter) {
            sortFilter.addEventListener("change", (e) => {
                this.currentFilters.sort = e.target.value;
                this.applyFilters();
            });
        }
        if (dateOrderToggle) {
            dateOrderToggle.addEventListener("click", () => {
                this.currentFilters.dateOrder =
                    this.currentFilters.dateOrder === "asc" ? "desc" : "asc";
                const textElement = document.getElementById("date-order-text");
                if (textElement) {
                    textElement.textContent =
                        this.currentFilters.dateOrder === "asc"
                            ? "Earliest First"
                            : "Latest First";
                }
                this.applyFilters();
            });
        }
        if (clearFilters) {
            clearFilters.addEventListener("click", () => {
                this.clearAllFilters();
            });
        }
        // Load more functionality
        const loadMoreBtn = document.getElementById("load-more-btn");
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener("click", () => {
                this.loadMoreEvents();
            });
        }
        // Mobile menu
        const mobileMenuBtn = document.getElementById("mobile-menu-btn");
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener("click", () => {
                this.toggleMobileMenu();
            });
        }
        // Heart/favorite functionality
        document.addEventListener("click", (e) => {
            const target = e.target;
            if (target.closest(".event-heart")) {
                e.preventDefault();
                const eventItem = target.closest(".event-item");
                const eventId = eventItem?.dataset.eventId;
                if (eventId) {
                    this.toggleFavorite(eventId);
                }
            }
        });
    }
    applyFilters() {
        let filtered = [...this.events];
        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter((event) => {
                const title = event.title ||
                    event.title_en ||
                    (event.language && event.language.en && event.language.en.title) ||
                    "";
                const location = event.location ||
                    event.formatted_address ||
                    event.city ||
                    (event.language && event.language.en && event.language.en.place) ||
                    "";
                const categories = Array.isArray(event.category)
                    ? event.category.join(" ")
                    : event.category || "";
                const description = event.description || "";
                return (title.toLowerCase().includes(this.searchQuery) ||
                    location.toLowerCase().includes(this.searchQuery) ||
                    categories.toLowerCase().includes(this.searchQuery) ||
                    description.toLowerCase().includes(this.searchQuery));
            });
        }
        // Apply category filter
        if (this.currentFilters.category) {
            filtered = filtered.filter((event) => {
                if (Array.isArray(event.category)) {
                    return event.category.includes(this.currentFilters.category);
                }
                return event.category === this.currentFilters.category;
            });
        }
        // Apply location filter
        if (this.currentFilters.location) {
            filtered = filtered.filter((event) => {
                const location = event.location ||
                    event.formatted_address ||
                    event.city ||
                    (event.language && event.language.en && event.language.en.place);
                return location === this.currentFilters.location;
            });
        }
        // Apply sorting
        filtered.sort((a, b) => {
            switch (this.currentFilters.sort) {
                case "name": {
                    const titleA = a.title ||
                        a.title_en ||
                        (a.language && a.language.en && a.language.en.title) ||
                        "";
                    const titleB = b.title ||
                        b.title_en ||
                        (b.language && b.language.en && b.language.en.title) ||
                        "";
                    return titleA.localeCompare(titleB);
                }
                case "location": {
                    const locationA = a.location ||
                        a.formatted_address ||
                        a.city ||
                        (a.language && a.language.en && a.language.en.place) ||
                        "";
                    const locationB = b.location ||
                        b.formatted_address ||
                        b.city ||
                        (b.language && b.language.en && b.language.en.place) ||
                        "";
                    return locationA.localeCompare(locationB);
                }
                case "date":
                default: {
                    const dateA = new Date(a.start || a.date || "");
                    const dateB = new Date(b.start || b.date || "");
                    return this.currentFilters.dateOrder === "asc"
                        ? dateA.getTime() - dateB.getTime()
                        : dateB.getTime() - dateA.getTime();
                }
            }
        });
        this.filteredEvents = filtered;
        this.renderEvents();
    }
    clearAllFilters() {
        this.searchQuery = "";
        this.currentFilters = {
            category: "",
            location: "",
            sort: "date",
            dateOrder: "asc",
        };
        // Reset form elements
        const searchInput = document.getElementById("search-input");
        const categoryFilter = document.getElementById("category-filter");
        const locationFilter = document.getElementById("location-filter");
        const sortFilter = document.getElementById("sort-filter");
        const dateOrderText = document.getElementById("date-order-text");
        if (searchInput)
            searchInput.value = "";
        if (categoryFilter)
            categoryFilter.value = "";
        if (locationFilter)
            locationFilter.value = "";
        if (sortFilter)
            sortFilter.value = "date";
        if (dateOrderText)
            dateOrderText.textContent = "Earliest First";
        this.applyFilters();
    }
    renderEvents() {
        const eventsGrid = document.getElementById("events-grid");
        if (!eventsGrid)
            return;
        eventsGrid.innerHTML = "";
        this.filteredEvents.forEach((event) => {
            const eventElement = this.createEventElement(event);
            eventsGrid.appendChild(eventElement);
        });
        // Show/hide load more button
        const loadMoreContainer = document.getElementById("load-more-container");
        if (loadMoreContainer) {
            loadMoreContainer.style.display =
                this.filteredEvents.length > 6 ? "flex" : "none";
        }
        // Trigger entrance animations
        this.animateEventItems();
    }
    createEventElement(event) {
        const eventDiv = document.createElement("div");
        eventDiv.className = "event-item";
        eventDiv.dataset.eventId = event.id;
        const title = event.title ||
            event.title_en ||
            (event.language && event.language.en && event.language.en.title) ||
            "Untitled";
        const dateStr = event.start || event.date || "";
        const formattedDate = this.formatDate(dateStr);
        const isFavorite = this.isFavorite(event.id);
        const image = event.image || event.event_image || event.event_thumbnail || "";
        eventDiv.innerHTML = `
            <div class="event-img">
                <img src="${image}" alt="${title}" loading="lazy" />
            </div>
            <div class="event-caption">
                <h3 class="event-title">${title}</h3>
                <div class="event-date-row">
                    <span class="event-date">${formattedDate}</span>
                    <div class="event-heart">
                        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 15.5L7.085 14.085C2.715 9.715 0 7.205 0 4.25C0 1.9 1.9 0 4.25 0C5.635 0 6.96 0.635 7.75 1.75C8.54 0.635 9.865 0 11.25 0C13.6 0 15.5 1.9 15.5 4.25C15.5 7.205 12.785 9.715 8.415 14.085L8.5 15.5Z" fill="${isFavorite ? "#E55050" : "#ccc"}"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
        return eventDiv;
    }
    formatDate(dateString) {
        if (!dateString)
            return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }
    toggleFavorite(eventId) {
        const favorites = this.getFavorites();
        const index = favorites.indexOf(eventId);
        if (index > -1) {
            favorites.splice(index, 1);
        }
        else {
            favorites.push(eventId);
        }
        localStorage.setItem("venuu-favorites", JSON.stringify(favorites));
        this.renderEvents(); // Re-render to update heart colors
    }
    isFavorite(eventId) {
        const favorites = this.getFavorites();
        return favorites.includes(eventId);
    }
    getFavorites() {
        const stored = localStorage.getItem("venuu-favorites");
        return stored ? JSON.parse(stored) : [];
    }
    loadMoreEvents() {
        // This would typically load more events from an API
        // For now, we'll just show a loading state
        const spinner = document.getElementById("load-more-spinner");
        const button = document.getElementById("load-more-btn");
        if (spinner && button) {
            spinner.classList.remove("hidden");
            button.disabled = true;
            setTimeout(() => {
                spinner.classList.add("hidden");
                button.disabled = false;
            }, 1000);
        }
    }
    toggleMobileMenu() {
        // Mobile menu toggle functionality
        const navLinks = document.querySelector(".nav-links");
        if (navLinks) {
            navLinks.classList.toggle("hidden");
            navLinks.classList.toggle("flex");
            navLinks.classList.toggle("flex-col");
            navLinks.classList.toggle("absolute");
            navLinks.classList.toggle("top-full");
            navLinks.classList.toggle("left-0");
            navLinks.classList.toggle("right-0");
            navLinks.classList.toggle("bg-white");
            navLinks.classList.toggle("shadow-lg");
            navLinks.classList.toggle("p-4");
        }
    }
    initializeComponents() {
        console.log("initializeComponents called");
        // Initialize simple logo animation (replacing Lottie)
        this.initializeLogoAnimation();
        // Initialize entrance animations (replacing GSAP)
        this.initializeAnimations();
    }
    initializeLogoAnimation() {
        // Logo animation is handled by CSS (@keyframes logoFadeIn and logoGlow)
        // Each letter animates in sequence with staggered delays set inline
        const logoContainer = document.getElementById("lottie-logo");
        if (logoContainer) {
            console.log("Logo SVG animation initialized via CSS");
        }
    }
    initializeAnimations() {
        // Fade in animation for hero section
        const heroTitle = document.querySelector("h1");
        if (heroTitle) {
            Utils.animations.slideIn(heroTitle, 800);
        }
        const searchBar = document.querySelector(".search-bar");
        if (searchBar) {
            setTimeout(() => {
                Utils.animations.slideIn(searchBar, 600);
            }, 400);
        }
    }
    animateEventItems() {
        const eventItems = document.querySelectorAll(".event-item");
        if (eventItems.length > 0) {
            Utils.animations.staggerIn(Array.from(eventItems), 600, 100);
        }
    }
}
// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content Loaded - Initializing VenuuApp");
    window.venuuApp = new VenuuApp();
});
//# sourceMappingURL=shared.js.map