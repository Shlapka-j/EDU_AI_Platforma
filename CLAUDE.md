# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` - Run development server (opens at http://localhost:3000)
- `npm run build` - Build for production to `build/` folder
- `npm test` - Run test runner in interactive watch mode
- `npm run deploy` - Deploy to GitHub Pages (runs predeploy build automatically)

### Project Structure
This is a React TypeScript educational platform with a gamified learning system built with Create React App.

## Architecture Overview

### Core Application Structure
- **Role-based Authentication**: 5 user roles (Student, Teacher, Parent, Psychologist, Admin) with dedicated dashboards
- **Gamified Learning Engine**: Central game engine with multiple activity modes (Story, Quiz, Exploration, Discussion, Mini-games)
- **Multi-language Support**: i18n with 7 languages (Czech default, English, German, Polish, Ukrainian, Slovak, Vietnamese)
- **AI-Powered Analytics**: Learning style detection, performance prediction, and risk analysis

### Key Directories
- `src/components/` - Organized by feature areas:
  - `Auth/` - Authentication components
  - `Dashboards/` - Role-specific dashboard views
  - `GameEngine/` - Core learning game engine with activity modes
  - `Gamification/` - XP, badges, quests, leaderboards, virtual shop
  - `Communication/` - Chat, messaging, notifications
  - `ContentManagement/` - Learning block editor, material uploader
  - `Mobile/` - Mobile-specific layouts and views
- `src/contexts/` - React contexts for auth and theme management
- `src/services/` - API service layer with structured endpoints
- `src/types/` - Comprehensive TypeScript type definitions
- `src/i18n/` - Internationalization setup and locale files

### Authentication System
Demo credentials system with localStorage persistence:
- Teacher: `ucitel@demo.cz` / `heslo123`
- Student: `student@demo.cz` / `heslo123`  
- Parent: `rodic@demo.cz` / `heslo123`
- Psychologist: `psycholog@demo.cz` / `heslo123`
- Admin: `admin@demo.cz` / `heslo123`

### API Architecture
Centralized API service (`src/services/api.ts`) with:
- JWT token handling and automatic refresh
- Structured endpoints for auth, subjects, learning blocks, game state, analytics, tests
- File upload capabilities with progress tracking
- Automatic 401 redirect handling

### Game Engine System
The core learning system operates through:
- **Activity Types**: Quiz, Discussion, Story, Exploration, Mini-game
- **Adaptive Difficulty**: Auto-adjusting based on student performance
- **Learning Preferences**: Visual, auditory, kinesthetic, reading/writing learning styles
- **Progress Tracking**: XP, levels, streaks, achievements
- **Risk Detection**: Learning difficulty, engagement drop, behavioral concerns

### Styling & UI
- **Tailwind CSS** with custom theme extensions
- **Glass morphism design** with custom CSS classes (glass-card, glass-header, glass-button)
- **Responsive design** with mobile-specific components
- **Dark/light theme** support via ThemeContext

### Type System
Comprehensive TypeScript definitions in `src/types/index.ts` covering:
- User roles and authentication
- Learning blocks and activities
- Game state and inventory
- AI analysis and risk assessment
- Test results and performance tracking

### Internationalization
- Default language: Czech (`cs`)
- Fallback: Czech for missing translations
- Language detection from browser/localStorage
- RTL language support prepared
- Helper functions for pluralization and formatting

## Development Guidelines

### Component Patterns
- Functional components with TypeScript
- Custom hooks for shared logic (e.g., `useTranslation`)
- Context providers for global state management
- Role-based rendering using UserRole enum

### API Integration
- Use the centralized `apiService` instance
- Structured API modules (authApi, subjectsApi, gameApi, etc.)
- Error handling with automatic token refresh
- Progress tracking for file uploads

### State Management
- React Context for auth and theme
- localStorage for session persistence
- Game state managed through GameEngine component
- Analytics and performance data fetched via dedicated API endpoints

### Mobile Support
Dedicated mobile components in `src/components/Mobile/` with responsive layouts for:
- Game view, learning view, navigation
- Touch-optimized interactions
- Smaller screen adaptations

When working with this codebase, focus on maintaining the educational gamification structure, respecting the role-based access system, and ensuring mobile compatibility for all new features.

## Important Warnings and Restrictions

- **Code Modification Restriction**: ZAKAZANO MENIT CI JAKKOLI UPRAVOVAT JINE NEZ GAME ENGINE A GAME CASTI PROGRAMU! (It is FORBIDDEN to change or modify anything other than the Game Engine and Game parts of the program!)