# Venuu - Events Discovery Platform

Venuu connects people through Iceland's vibrant cultural events. This is a modern, responsive web application for discovering and exploring events in Iceland.

## 🛠 Technologies Used

This project strictly adheres to the following technology requirements:

### Core Technologies

- **HTML5** - Semantic markup for all pages
- **CSS3/Tailwind CSS** - Styling with utility-first CSS framework
- **TypeScript** - Pure vanilla TypeScript (compiled to ES2020 JavaScript)

### External Libraries

**Single Exception:**

- ✅ **Lottie Web** - Professional animation library for the logo animation (Logo.json)

This project does **NOT** use any other libraries:

- ❌ jQuery
- ❌ GSAP
- ❌ React, Vue, Angular or any JavaScript frameworks
- ❌ Any other third-party JavaScript libraries

### Pure Vanilla TypeScript Features

The project demonstrates proficiency with:

- ✅ **Functions** - Arrow functions, methods, async/await
- ✅ **Arrays** - map, filter, forEach, reduce, sort
- ✅ **Objects** - Object literals, classes, interfaces
- ✅ **Loops** - for, forEach, for...of
- ✅ **Classes** - ES6 classes with proper TypeScript typing
- ✅ **Modules** - ES6 import/export modules
- ✅ **TypeScript** - Interfaces, types, generics, strict typing

## 📁 Project Structure

```
HopeverkefniJSTwailwind/
├── index.html              # Main homepage
├── events.html             # Events listing page
├── css/
│   └── output.css         # Compiled Tailwind CSS
├── src/
│   ├── input.css          # Tailwind source CSS
│   └── ts/                # TypeScript source files
│       ├── types.ts       # Type definitions and interfaces
│       ├── utils.ts       # Utility functions
│       ├── api.ts         # API service layer
│       └── shared.ts      # Main application logic
├── js/                    # Compiled JavaScript (from TypeScript)
│   ├── types.js
│   ├── utils.js
│   ├── api.js
│   └── shared.js
├── Images/                # Image assets and SVG icons
├── api-data.json         # Events data
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Project dependencies

```

## 🚀 Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build-ts

# Build CSS
npm run build-css-prod

# Or build everything at once
npm run build
```

### Development Mode

```bash
# Watch mode for both TypeScript and CSS
npm run dev:watch
```

## 📝 TypeScript Implementation

### Type Safety

All code is written in TypeScript with strict type checking enabled:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

### Custom Types

```typescript
interface VenuuEvent {
  id: string;
  title?: string;
  start?: string;
  location?: string;
  category?: string[];
  // ... more properties
}

interface Filters {
  category: string;
  location: string;
  sort: string;
  dateOrder: "asc" | "desc";
}
```

## 🎨 Features

### Core Functionality

- **Event Discovery** - Browse and search through events
- **Dynamic Filtering** - Filter by category, location, and date
- **Sorting** - Sort events by name, location, or date
- **Search** - Real-time search across event titles and descriptions
- **Favorites** - Mark events as favorites (stored in localStorage)
- **Pagination** - Load more events functionality
- **Responsive Design** - Mobile-first design that works on all devices

### Vanilla JavaScript/TypeScript Features Used

#### Arrays

```typescript
// Filter events
filtered = events.filter((event) => event.category === "Music");

// Map to extract data
categories = events.map((event) => event.category);

// Sort events
events.sort((a, b) => a.title.localeCompare(b.title));

// Remove duplicates
uniqueCategories = [...new Set(categories)];
```

#### Objects & Classes

```typescript
class VenuuApp {
  private events: VenuuEvent[] = [];
  private currentFilters: Filters = {};

  async loadEvents(): Promise<void> {}
  applyFilters(): void {}
  renderEvents(): void {}
}
```

#### Loops

```typescript
// forEach
events.forEach((event) => {
  categoriesSet.add(event.category);
});

// for...of
for (const [key, value] of params) {
  result[key] = value;
}

// while
while (select.children.length > 1) {
  select.removeChild(select.lastChild);
}
```

#### Functions

```typescript
// Arrow functions
const formatDate = (date: string): string => { }

// Async/await
async function loadEvents(): Promise<VenuuEvent[]> {
  const response = await fetch('./api-data.json');
  return await response.json();
}

// Higher-order functions
static debounce<T>(func: T, wait: number): T { }
```

### Vanilla Animations (No GSAP)

All animations use vanilla JavaScript with `requestAnimationFrame`:

```typescript
static animations = {
  fadeIn(element: HTMLElement, duration: number): void {
    const start = performance.now();
    function animate(timestamp: number): void {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      element.style.opacity = progress.toString();
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
}
```

## 🎯 Code Quality

### TypeScript Compilation

- All code compiles without errors
- Strict mode enabled
- No implicit any types
- Source maps generated for debugging

### Best Practices

- Separation of concerns (types, utils, api, main logic)
- Reusable utility functions
- Type-safe API calls
- Error handling
- Local storage management
- DOM manipulation best practices

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - Small screens: `max-width: 390px`
  - Tablets: `max-width: 768px`
  - Desktop: larger screens
- Touch-friendly interfaces
- Optimized images with lazy loading

## 🔍 Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020 JavaScript features
- CSS Grid and Flexbox
- Native fetch API
- LocalStorage API

## 📦 Build Process

### TypeScript Compilation

```bash
npm run build-ts
```

Compiles TypeScript files from `src/ts/` to `js/` directory.

### CSS Build

```bash
npm run build-css-prod
```

Compiles and minifies Tailwind CSS.

### Production Build

```bash
npm run build
```

Builds both TypeScript and CSS for production.

## 🎓 Learning Outcomes

This project demonstrates:

1. ✅ Pure vanilla TypeScript without frameworks
2. ✅ Working with functions, arrays, objects, and loops
3. ✅ Type-safe development with TypeScript interfaces
4. ✅ DOM manipulation and event handling
5. ✅ Asynchronous programming (async/await, Promises)
6. ✅ Local storage management
7. ✅ Responsive design with Tailwind CSS
8. ✅ Code organization and modularity
9. ✅ Building reusable utilities
10. ✅ Animation with vanilla JavaScript

## 📄 License

MIT License - Venuu 2025

## 👥 Authors

Venuu Team

---

**Note**: This project uses lottie-web for the logo animation only. All other functionality is implemented using pure vanilla TypeScript, demonstrating proficiency with core JavaScript/TypeScript concepts including functions, arrays, objects, loops, and classes.
