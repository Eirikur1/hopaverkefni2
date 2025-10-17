# Venuu - Event Discovery Platform

A modern, responsive web application for discovering and exploring events in Iceland. Built with HTML5, CSS3, JavaScript, TypeScript, and Tailwind CSS.

## Features

- **Event Discovery**: Browse events by categories (Recommended, Popular, Music, Family)
- **Advanced Search**: Real-time search with autocomplete functionality
- **Event Filtering**: Filter by category, location, and date
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive UI**: Smooth animations and transitions using GSAP
- **Event Modals**: Detailed event information with image galleries
- **Favorites System**: Save and manage favorite events
- **Create Events**: Form to submit new events

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), TypeScript
- **Styling**: Tailwind CSS with custom components
- **Animations**: GSAP (GreenSock Animation Platform)
- **Icons**: Font Awesome, Custom SVG icons
- **Build Tools**: TypeScript compiler, Tailwind CSS CLI
- **Package Manager**: npm

## Project Structure

```
├── index.html          # Main homepage
├── events.html         # Events listing page
├── favorites.html      # User favorites page
├── login.html          # User authentication
├── css/
│   └── output.css      # Compiled Tailwind CSS
├── js/                 # Compiled JavaScript files
├── src/
│   ├── input.css       # Tailwind CSS source
│   └── ts/             # TypeScript source files
├── Images/             # Static assets and images
└── api-data.json       # Event data

```

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Development Mode**

   ```bash
   npm run dev:watch
   ```

3. **Build for Production**

   ```bash
   npm run build
   ```

4. **Open in Browser**
   - Open `index.html` in your web browser
   - Or serve using a local server for full functionality

## Key Components

### Event Cards

- Responsive grid layout
- Image lazy loading
- Hover effects and animations
- Click-to-view modal functionality

### Search & Filtering

- Real-time search with debouncing
- Category and location filters
- Sort by date, title, popularity
- Search suggestions and history

### Modal System

- Event detail modals
- Create event form
- Responsive design
- Keyboard navigation support

### Navigation

- Fixed header with logo animation
- Mobile-responsive menu
- Active state indicators
- Smooth transitions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Features

- Lazy loading for images
- Debounced search input
- Optimized CSS with Tailwind
- Minified production builds
- Efficient event handling

## Development Notes

- TypeScript for type safety
- Modular JavaScript architecture
- CSS custom properties for theming
- Responsive design principles
- Accessibility considerations (ARIA labels, keyboard navigation)




