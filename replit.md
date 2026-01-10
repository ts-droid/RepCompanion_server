# RepCompanion

## Overview
RepCompanion is a Progressive Web App (PWA) designed to provide a mobile-first, customizable fitness experience. It offers AI-generated personalized workout programs, integration with Apple Health via Vital API for metrics, and detailed session tracking. Key features include comprehensive workout statistics with progress graphs, volume tracking, exercise performance metrics, and personalized training tips. The project aims for a professional aesthetic, supporting personal planning, multi-gym equipment management, an 8-theme customization system with dynamically colored logos, and a freemium monetization model. The vision is to be a leading fitness application through AI-driven personalization and an engaging, adaptable interface.

## User Preferences
- **Communication Style**: I prefer clear, concise, and direct explanations.
- **Coding Style**: I favor a structured approach with strong typing, clear separation of concerns, and robust validation.
- **Workflow Preferences**: I expect an iterative development process, with a focus on delivering secure, well-tested features. I appreciate comprehensive API documentation and examples.
- **Interaction Preferences**: Ask for confirmation before implementing significant architectural changes or altering core functionalities.
- **Working Preferences**:
    - Ensure all data mutations include ownership checks to prevent unauthorized access and modifications.
    - Implement Zod validation for all API inputs, providing meaningful error responses.
    - Prioritize security by validating resource ownership for all protected routes.
    - For development, ensure an easy way to test features without full authentication, such as a dev-user mode.
    - Maintain a dark/light theme system with customizable color schemes (8 theme options with gradient colors: main (cyan-green), forest (green), purple (purple-blue), ocean (light blue), sunset (amber-orange), slate (gray-blue), crimson (red-burgundy), pink (magenta-pink)), adhering to an iOS-inspired mobile-first UI.
    - All database operations should leverage Drizzle ORM.

## System Architecture
RepCompanion is a PWA with a mobile-first, gradient-based UI, featuring 8 customizable themes and dynamically colored logos for light/dark modes.

### Tech Stack
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Shadcn/UI, Recharts
- **Backend**: Express, Node.js
- **Database**: PostgreSQL (Neon serverless)
- **Authentication**: Replit Auth with OIDC
- **State Management**: TanStack Query v5
- **Routing**: Wouter
- **Validation**: Zod, Drizzle-Zod

### UI/UX Decisions
- **Design Principles**: Professional aesthetic, iOS-inspired mobile-first UI with 8 gradient-based themes (main, forest, purple, ocean, sunset, slate, crimson, pink) supporting light/dark mode and dynamic logo switching. Shadcn/UI for components, Lucide React for icons.
- **User Flow**: Multi-step onboarding, authenticated user redirection, multi-gym support.
- **AI Program Generation**: AI-generated personalized programs with a robust timeout system and `AbortController` integration. Includes a versioned AI prompt system (V1 stable, V2 experimental) with auto-1RM estimation and schema validation for safe rollbacks.
- **Workout Session Management**: Flexible in-session editing (sets/reps/weight with bulk updates and AI suggestions), seamless session resumption, and strict completion validation.
- **Progress & Statistics**: Comprehensive analytics with Recharts visualization for total stats, weekly trends, top exercises, and strength progress (1RM tracking with Epley formula).
- **Exercise Library**: Extensive exercise database with AI-optimization metadata (e.g., `requires1RM`, `goodForBeginners`, `genderSpecialization`) and a video library integrated with fuzzy matching for exercise names.
- **Program Progression**: Automatic pass progression (A→B→C→D cycle) tracked via user profile, updating after session completion.
- **Monetization & Promotion**: Foundations for freemium model, promotional content, and contextual advertising via personalized training tips.

### System Design Choices
- **Security**: `userId` validation for protected routes, Zod schema input validation.
- **Database Schema**: Optimized for `user_profiles`, `gyms`, `user_equipment`, `workout_sessions`, `exercise_logs`.
- **Development**: `/dev-onboarding` route for testing features.
- **Rate Limiting**: Weekly program generation limited to 5 per user.
- **Dynamic Filtering**: Equipment filtering based on selected gym for warm-up.
- **Robust Error Handling**: Centralized error handling (`errorHandler.ts`), stability fixes for race conditions, and error handling for platform-specific interactions (e.g., image compression, local storage).

## External Dependencies
- **Replit Auth**: OAuth authentication.
- **Neon**: PostgreSQL database.
- **Roboflow AI**: Equipment recognition.
- **DeepSeek API**: AI workout generation and exercise suggestions.
- **Vital API (Junction)**: Multi-platform health data aggregation (Apple Health, Google Fit, Fitbit, Oura, WHOOP, Garmin, Samsung Health).
- **html5-qrcode**: QR code scanning.
- **Recharts**: Data visualization.