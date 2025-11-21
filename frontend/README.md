# ShelfSense Frontend

> AI-powered book recommendation platform for collectors and avid readers

## Overview

ShelfSense is a modern web application that helps book collectors and avid readers discover their next favorite book through intelligent AI-powered recommendations. Users can scan their bookshelves, manage their library, and receive personalized book suggestions tailored to their unique taste.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and development server
- **TailwindCSS 3.4** - Utility-first CSS framework
- **React Router 6** - Client-side routing
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Zustand** - State management
- **Axios** - HTTP client

## Design System

### Color Palette

```css
Primary (Coral/Terracotta): #E07A5F
Background Light (Cream): #F5F5DC
Text Charcoal: #36454F
Text Forest: #3D403D
Accent Sage: #B2AC88
```

### Typography

- **Display Font**: Crimson Pro (serif)
- **Body Font**: Inter (sans-serif)

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── layout/          # Layout components (Header, Footer, MainLayout)
│   ├── landing/         # Landing page specific components
│   ├── library/         # Library page components
│   ├── scanner/         # Scanner page components
│   └── recommendations/ # Recommendations page components
├── pages/              # Page components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── LibraryPage.jsx
│   ├── ScannerPage.jsx
│   ├── RecommendationsPage.jsx
│   └── BookDetailPage.jsx
├── hooks/              # Custom React hooks
├── services/           # API services and integrations
│   └── api.js          # Axios instance with interceptors
├── store/              # Zustand state management
│   └── authStore.js    # Authentication state
├── utils/              # Utility functions and constants
│   └── constants.js    # App-wide constants
├── App.jsx             # Main app component with routing
├── main.jsx            # App entry point
└── index.css           # Global styles and Tailwind directives
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=ShelfSense
VITE_APP_ENV=development
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Routes

- `/` - Landing page
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - User dashboard
- `/library` - Book library management
- `/scan` - Bookshelf scanner
- `/recommendations` - AI recommendations
- `/book/:id` - Book detail page

## Features (Planned)

### Core Features
- 📚 **Deep Genre Analysis** - Beyond simple genres, analyzing sub-genres, tropes, and narrative structures
- 🔔 **First Edition Alerts** - Notifications for rare and first editions
- 😊 **Mood-Based Recommendations** - Find books matching your current mood
- 🧭 **Author Discovery Engine** - Discover similar authors and writing styles

### User Experience
- 📱 Mobile-first responsive design
- 🌓 Light and dark mode support
- ⚡ Fast, optimized performance
- 🎨 Beautiful, accessible UI

## State Management

The app uses Zustand for state management:

- **Auth Store** (`authStore.js`) - User authentication and session management

## API Integration

API calls are centralized in `src/services/api.js` with:
- Automatic token injection
- Response/error interceptors
- 401 redirect handling

## Contributing

This is a private project. For development:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

All rights reserved © 2024 ShelfSense

## Timeline

**Target MVP:** 4-6 weeks

## Contact

For questions or support, please contact the development team.
