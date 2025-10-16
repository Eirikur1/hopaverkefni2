// Venuu - Shared JavaScript functionality
// Main application controller

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
    this.isLoading = false;

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
    } catch (error) {
      console.error("Failed to initialize app:", error);
    }
  }

  async loadEvents() {
    try {
      const response = await fetch("./api-data.json");
      this.events = await response.json();
      this.filteredEvents = [...this.events];
      this.populateFilters();
    } catch (error) {
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
        category: "Photography",
        image: "Images/event-posters/068e9d4bef717cd1000843dc38c603ec.jpg",
        description:
          "Learn to capture the magical Northern Lights with professional guidance.",
      },
      {
        id: "event-2",
        title: "Icelandic Music Festival",
        date: "2024-04-22",
        location: "Reykjavik",
        category: "Music",
        image: "Images/event-posters/1d595e6dc1b6a3d963b932eb94de79d1.jpg",
        description: "Experience the best of Icelandic music and culture.",
      },
      {
        id: "event-3",
        title: "Glacier Hiking Adventure",
        date: "2024-05-08",
        location: "Vatnajökull",
        category: "Adventure",
        image: "Images/event-posters/233986128f46951bf66a727cca1b3a18.jpg",
        description:
          "Explore Iceland's magnificent glaciers with expert guides.",
      },
      {
        id: "event-4",
        title: "Hot Spring Wellness Retreat",
        date: "2024-06-12",
        location: "Blue Lagoon",
        category: "Wellness",
        image: "Images/event-posters/24de6470d3365d85550c2c65ce8ddfca.jpg",
        description: "Relax and rejuvenate in Iceland's natural hot springs.",
      },
      {
        id: "event-5",
        title: "Viking Heritage Tour",
        date: "2024-07-03",
        location: "Reykjavik",
        category: "Culture",
        image: "Images/event-posters/3bd777f8c2760cbf585251808e738698.jpg",
        description: "Discover Iceland's rich Viking history and heritage.",
      },
      {
        id: "event-6",
        title: "Midnight Sun Photography",
        date: "2024-08-18",
        location: "Akureyri",
        category: "Photography",
        image: "Images/event-posters/3f117cff666f231104f270edda727dab.jpg",
        description: "Capture the beauty of Iceland's midnight sun.",
      },
    ];
  }

  populateFilters() {
    const categories = [...new Set(this.events.map((event) => event.category))];
    const locations = [...new Set(this.events.map((event) => event.location))];

    this.populateSelect("category-filter", categories);
    this.populateSelect("location-filter", locations);
  }

  populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;

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
      if (e.target.closest(".event-heart")) {
        e.preventDefault();
        const eventItem = e.target.closest(".event-item");
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
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(this.searchQuery) ||
          event.location.toLowerCase().includes(this.searchQuery) ||
          event.category.toLowerCase().includes(this.searchQuery) ||
          (event.description &&
            event.description.toLowerCase().includes(this.searchQuery))
      );
    }

    // Apply category filter
    if (this.currentFilters.category) {
      filtered = filtered.filter(
        (event) => event.category === this.currentFilters.category
      );
    }

    // Apply location filter
    if (this.currentFilters.location) {
      filtered = filtered.filter(
        (event) => event.location === this.currentFilters.location
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentFilters.sort) {
        case "name":
          return a.title.localeCompare(b.title);
        case "location":
          return a.location.localeCompare(b.location);
        case "date":
        default:
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return this.currentFilters.dateOrder === "asc"
            ? dateA - dateB
            : dateB - dateA;
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

    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "";
    if (locationFilter) locationFilter.value = "";
    if (sortFilter) sortFilter.value = "date";
    if (dateOrderText) dateOrderText.textContent = "Earliest First";

    this.applyFilters();
  }

  renderEvents() {
    const eventsGrid = document.getElementById("events-grid");
    if (!eventsGrid) return;

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
  }

  createEventElement(event) {
    const eventDiv = document.createElement("div");
    eventDiv.className = "event-item";
    eventDiv.dataset.eventId = event.id;

    const formattedDate = this.formatDate(event.date);
    const isFavorite = this.isFavorite(event.id);

    eventDiv.innerHTML = `
            <div class="event-img">
                <img src="${event.image}" alt="${event.title}" loading="lazy" />
            </div>
            <div class="event-caption">
                <h3 class="event-title">${event.title}</h3>
                <div class="event-date-row">
                    <span class="event-date">${formattedDate}</span>
                    <div class="event-heart">
                        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 15.5L7.085 14.085C2.715 9.715 0 7.205 0 4.25C0 1.9 1.9 0 4.25 0C5.635 0 6.96 0.635 7.75 1.75C8.54 0.635 9.865 0 11.25 0C13.6 0 15.5 1.9 15.5 4.25C15.5 7.205 12.785 9.715 8.415 14.085L8.5 15.5Z" fill="${
                              isFavorite ? "#E55050" : "#ccc"
                            }"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;

    return eventDiv;
  }

  formatDate(dateString) {
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
    } else {
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
    // Initialize Lottie animation for logo
    if (typeof lottie !== "undefined") {
      console.log("Lottie library loaded");
      const logoContainer = document.getElementById("lottie-logo");
      if (logoContainer) {
        console.log("Logo container found, loading animation");
        // Load the NEWNEw.json Lottie animation
        lottie.loadAnimation({
          container: logoContainer,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: "./Images/Images_and_lottie/NEWNEw.json",
        });
        console.log("Lottie animation loaded");
      } else {
        console.error("Logo container not found");
      }
    } else {
      console.error("Lottie library not loaded");
    }

    // Initialize GSAP animations
    if (typeof gsap !== "undefined") {
      this.initializeAnimations();
    }
  }

  initializeAnimations() {
    // Fade in animation for event items
    gsap.fromTo(
      ".event-item",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
    );

    // Hero section animation
    gsap.fromTo(
      "h1",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power2.out" }
    );

    gsap.fromTo(
      ".search-bar",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power2.out" }
    );
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Initializing VenuuApp");
  window.venuuApp = new VenuuApp();
});

// Export for potential module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = VenuuApp;
}
