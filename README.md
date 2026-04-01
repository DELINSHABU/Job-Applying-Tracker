# Job Tracker - React App

A modern job application tracker built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🌙 **Dark Mode UI** - Modern mobile-first dark theme
- 🔐 **Firebase Auth** - Email/password and Google sign-in
- ☁️ **Cloud Sync** - Firestore for data persistence
- 🔍 **Smart Search** - Filter by company, position, platform, status
- 📊 **Dashboard Stats** - Track your application progress
- 🎯 **Fit Scoring** - Score jobs based on your preferences
- 🔄 **Duplicate Detection** - Automatically detect duplicate applications
- ✅ **Type Safe** - Full TypeScript support

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase** - Auth & Firestore
- **Jest** - Testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
├── src/
│   ├── __tests__/           # Jest tests
│   │   ├── fitScoring.test.ts
│   │   └── duplicateDetection.test.ts
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── StatsCards.tsx
│   │   ├── BottomNav.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FloatingActionButton.tsx
│   │   ├── JobCard.tsx
│   │   ├── JobList.tsx
│   │   ├── JobModal.tsx
│   │   └── AuthModal.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useJobs.ts
│   │   └── useSearch.ts
│   ├── services/            # Business logic
│   │   ├── firebase.ts
│   │   ├── fitScoring.ts
│   │   └── duplicateDetection.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── jest.config.js
```

## Key Algorithms

### Fit Scoring Engine

The fit scoring engine calculates how well a job matches your preferences:

- **Location Match** (0-25 points) - Remote preference, city matching
- **Role Match** (0-25 points) - Position title similarity
- **Salary Match** (0-25 points) - Salary range comparison
- **Platform Match** (0-15 points) - Preferred job platforms
- **Keyword Match** (0-10 points) - Important skills/keywords

### Duplicate Detection

The duplicate detection algorithm identifies potential duplicate applications:

- **URL Matching** - Same job listing URL (100% confidence)
- **Company + Position** - Same company and role (85-95% confidence)
- **Fuzzy Matching** - Handles typos and variations in company names
- **Abbreviation Expansion** - Sr. → Senior, Dev → Developer

## Firebase Configuration

The app uses Firebase for authentication and data storage. The configuration is in `src/services/firebase.ts`.

To use your own Firebase project:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Email/Password and Google authentication
3. Create a Firestore database
4. Update the config in `firebase.ts`

## License

MIT
