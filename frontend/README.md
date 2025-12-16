# TeamSync Frontend

React frontend for the TeamSync remote team collaboration platform.

> 📖 **For complete project documentation, see the [main README](../README.md)**

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- React 18 + Vite
- Tailwind CSS with Glass Morphism design
- Redux Toolkit + RTK Query
- React Router DOM
- @dnd-kit for drag & drop
- Framer Motion for animations

## Project Structure

```
src/
├── api/                 # RTK Query API services
├── app/                 # Redux store configuration
├── components/          # Reusable UI components
├── features/            # Redux slices
├── layouts/             # Role-based layouts
├── pages/               # Page components
├── routes/              # Route protection logic
└── utils/               # Utility functions
```

## Demo Credentials

- **Admin**: admin@example.com / password
- **Team Lead**: lead@example.com / password  
- **Member**: member@example.com / password

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build
- `npm run lint` - Run ESLint

## Backend Connection

Connects to TeamSync API at `http://localhost:5000/api`. Ensure the backend server is running.