# 🌍 GlobeTrotter - Intelligent Multi-City Trip Planner & AI Assistant

> **A personalized, intelligent, and collaborative platform that transforms the way individuals plan and experience travel. Built with Node.js, Express, PostgreSQL, React 19, Vite, Tailwind CSS, and Groq LLaMA AI.**

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [System Architecture & Flowchart Diagrams](#-system-architecture--flowchart-diagrams)
- [Key Features Matrix](#-key-features-matrix)
- [Complete Visual Application Walkthrough](#-complete-visual-application-walkthrough)
- [Technology Stack](#-technology-stack)
- [Project Folder Structure](#-project-folder-structure)
- [Installation & Setup Guide](#-installation--setup-guide)
- [Environment Variables Reference](#-environment-variables-reference)
- [API Documentation Overview](#-api-documentation-overview)
- [My AI Usage (MANDATORY)](#-my-ai-usage)

---

## 🌐 Project Overview

**GlobeTrotter** is a user-centric, responsive web application designed to simplify the complexity of planning multi-city travel. Traditional trip planning involves juggling spreadsheets, numerous browser tabs, and disconnected tools. GlobeTrotter unifies this experience into an interactive, visual builder enriched with AI intelligence.

### What Problem It Solves

1. **Scattered Planning Data:** Provides an all-in-one itinerary builder where users can manage stops, durations, and day-wise activities in a structured timeline.
2. **Budget Uncertainty:** Automatically calculates estimated trip budgets and provides breakdowns by category (stay, transport, sightseeing).
3. **AI-Powered Recommendations:** The integrated **AI Trip Planning Assistant** takes natural language prompts and instantly generates structured, addable itinerary suggestions using Groq LLaMA.
4. **Fragmented Schedules & Offline Accessibility:** When traveling, travelers frequently face spotty internet and roaming issues. The **Trip Departure Pack** solves this by sending a complete, self-contained travel bundle directly to the traveler's email for offline use.

### Target Audience

- **Travel Enthusiasts:** Planners looking for an efficient way to organize multi-city global journeys.
- **Group Travelers:** Friends and families who need to share plans via public read-only URLs.
- **Platform Administrators:** Managers utilizing the administrative control panel to monitor platform usage, engagement, and trending destinations.

---

## 📐 System Architecture & Flowchart Diagrams

### 1. High-Level System Data Flow

```mermaid
graph TD
    User([Traveler / Admin]) -->|HTTPS Requests| Frontend[React 19 + Vite Frontend]
    Frontend -->|REST API / Bearer Token| Backend[Express + Node.js Backend]
    Backend -->|pg Client| DB[(PostgreSQL Database)]
    Backend -->|LLM Prompts| AI[Groq API / LLaMA Models]
```

### 2. AI Trip Assistant Flow

```mermaid
flowchart TD
    UserPrompt([User Enters Trip Prompt]) -->|POST /api/ai/plan| Backend
    Backend -->|Construct JSON Prompt| GroqAPI[Groq API LLaMA]
    GroqAPI -->|Structured JSON Response| Parser[Parse & Validate with Zod]
    Parser --> FrontendUI[Render Addable AI Suggestion Cards]
    FrontendUI -->|User Clicks 'Add to Trip'| DBUpdate[POST to Itinerary Endpoints]
```

---

## ✨ Key Features Matrix

| Module                         | Features Included                                                                                                                                                                             |
| :----------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🔐 Auth & Discovery**        | JWT Authentication, Bcrypt password hashing, Google OAuth integration. Search interface to discover cities and categorised activities (sightseeing, food, adventure).                         |
| **🗺️ Itinerary Builder**       | Interactive day-wise timeline layout. Add/remove stops, assign activities to specific dates, and dynamically reorder plans.                                                                   |
| **💰 Budget & Cost Breakdown** | Financial view summarizing estimated total costs with breakdowns by activity category and timeline averages.                                                                                  |
| **🔗 Public Sharing**          | Generate shareable, read-only public URLs to send itinerary plans to friends or social media.                                                                                                 |
| **🤖 AI Planning Assistant**   | _(Completed)_ Chat panel that processes natural language requests (e.g., "3 days in Goa under $500") and returns fully structured, modular itinerary blocks ready to be appended to the trip. |
| **👑 Admin Control Panel**     | _(Completed)_ Administrative dashboard for platform analytics, user tracking, trending cities/activities metrics, and database curation.                                                      |
| **📦 Trip Departure Pack**     | Email-delivered travel bundle containing 1-Click Calendar Sync (.ics), Offline-Ready Visual Itinerary, Budget Summary, and Essential Travel Info (emergency numbers, timezones, etc).           |

---

## 🖼️ Complete Visual Application Walkthrough

### 1. Login & Authentication

> Secure entry point featuring email/password and Google OAuth options.

### 2. Central Dashboard & Discovery

> Explore popular global cities, trending activities, and manage your upcoming multi-city trips.

### 3. Interactive Itinerary Builder

> Construct detailed day-wise plans, manage stops, and append activities dynamically.

### 4. Trip Budget & Analytics

> Visualize your estimated expenses per category to stay on track.

### 5. AI Planning Assistant

> Chat with the GlobeTrotter AI to instantly draft and inject daily plans into your itinerary.

### 6. Admin Control Panel

> Comprehensive usage statistics, database oversight, and user metrics for platform administrators.

### 7. Trip Departure Pack

> Complete, self-contained travel bundle sent via email for offline accessibility, including:
> - **📅 1-Click Calendar Sync (.ics attachment):** Syncs all stops and activities into Google Calendar, Apple Calendar, or Outlook with reminder alarms.
> - **📱 Offline-Ready Visual Itinerary:** Day-by-day timetable with activity timings, addresses/cities, durations, and costs.
> - **💰 Budget & Expense Summary:** Total trip cost and category breakdown (stay, activities, food, transit).
> - **🆘 Essential Travel Info:** Destination-specific emergency numbers (e.g. 112, 911, 110), timezone info, and trip notes.

---

## 🛠️ Technology Stack

| Category             | Technology / Library            | Purpose & Implementation                             |
| :------------------- | :------------------------------ | :--------------------------------------------------- |
| **Frontend UI**      | React 19, Vite, TypeScript      | Ultra-fast SPA framework with strict type safety     |
| **Styling & Icons**  | Tailwind CSS 4, Lucide React    | Modern utility-first styling and SVG icons           |
| **State & Fetching** | React Context, Axios            | Global state management and robust API client        |
| **Backend Runtime**  | Node.js, Express.js, TypeScript | Highly scalable REST API server                      |
| **Database**         | PostgreSQL (pg driver)          | Relational database handling complex trip topologies |
| **Validation**       | Zod                             | End-to-end schema validation                         |
| **AI Services**      | Groq API                        | Lightning-fast AI itinerary generation               |
| **Security**         | JSON Web Tokens, bcryptjs       | Stateless session management and password hashing    |

---

## 📁 Project Folder Structure

```
Odoo2026-Nova/
├── .gitignore
├── README.md
├── ai-module/
│   ├── .env.example
│   ├── .gitignore
│   ├── app.py
│   ├── requirements.txt
│   ├── routes/
│   │   └── ai_routes.py
│   ├── schemas/
│   │   └── itinerary.py
│   └── services/
│       ├── fallback_service.py
│       ├── llm_service.py
│       └── planner_service.py
├── backend/
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   ├── server.ts
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── full_module_c.test.ts
│   │   │   └── itinerary.test.ts
│   │   ├── api/
│   │   │   └── trips.api.ts
│   │   ├── app.ts
│   │   ├── db/
│   │   │   ├── config.ts
│   │   │   ├── index.ts
│   │   │   ├── schema.sql
│   │   │   ├── seed-dev.sql
│   │   │   ├── seed-fast.ts
│   │   │   ├── seed-master.ts
│   │   │   ├── seed-temp.ts
│   │   │   └── seed.ts
│   │   ├── middleware/
│   │   │   ├── admin.middleware.ts
│   │   │   ├── auth.middleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── rateLimit.middleware.ts
│   │   ├── modules/
│   │   │   ├── admin/
│   │   │   │   └── admin.controller.ts
│   │   │   ├── ai/
│   │   │   │   └── ai.controller.ts
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.validation.ts
│   │   │   ├── discovery/
│   │   │   │   ├── activities.routes.ts
│   │   │   │   ├── cities.routes.ts
│   │   │   │   └── discovery.controller.ts
│   │   │   ├── itinerary.controller.ts
│   │   │   ├── trips/
│   │   │   │   └── trips.controller.ts
│   │   │   └── users/
│   │   │       ├── users.controller.ts
│   │   │       └── users.routes.ts
│   │   ├── routes/
│   │   │   ├── admin.routes.ts
│   │   │   ├── ai.routes.ts
│   │   │   ├── index.ts
│   │   │   ├── stops.routes.ts
│   │   │   └── trips.routes.ts
│   │   ├── scripts/
│   │   │   ├── migrateAndSeed.ts
│   │   │   └── testEndpoints.ts
│   │   └── types/
│   │       └── trip.ts
│   └── tsconfig.json
└── frontend/
    ├── .env.example
    ├── .gitignore
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    ├── src/
    │   ├── App.css
    │   ├── App.tsx
    │   ├── api/
    │   │   ├── admin.api.ts
    │   │   ├── ai.api.ts
    │   │   ├── auth.api.ts
    │   │   ├── client.ts
    │   │   ├── discovery.api.ts
    │   │   ├── itinerary.api.ts
    │   │   └── trips.api.ts
    │   ├── assets/
    │   │   ├── hero.png
    │   │   ├── react.svg
    │   │   └── vite.svg
    │   ├── components/
    │   │   ├── Badge.tsx
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── GoogleLoginButton.tsx
    │   │   ├── Input.tsx
    │   │   ├── ItineraryNav.tsx
    │   │   ├── LoadingSpinner.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── SearchListLayout.tsx
    │   │   └── index.ts
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── index.css
    │   ├── main.tsx
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   └── AdminDashboard.tsx
    │   │   ├── ai-chat/
    │   │   │   └── AIChatPage.tsx
    │   │   ├── auth/
    │   │   │   ├── LoginPage.tsx
    │   │   │   └── RegisterPage.tsx
    │   │   ├── dashboard/
    │   │   │   └── DashboardPage.tsx
    │   │   ├── discovery/
    │   │   │   └── SearchPage.tsx
    │   │   ├── itinerary/
    │   │   │   ├── CalendarTimeline.tsx
    │   │   │   ├── GlobalCalendarPage.tsx
    │   │   │   ├── ItineraryBuilder.tsx
    │   │   │   ├── ItineraryRoutes.tsx
    │   │   │   ├── ItineraryView.tsx
    │   │   │   ├── PublicItinerary.tsx
    │   │   │   └── StopActivities.tsx
    │   │   ├── profile/
    │   │   │   └── ProfilePage.tsx
    │   │   └── trips/
    │   │       ├── CreateTrip.tsx
    │   │       ├── Dashboard.tsx
    │   │       ├── ExploreDestinations.tsx
    │   │       ├── ItineraryBuilder.tsx
    │   │       ├── ItineraryView.tsx
    │   │       ├── PublicTripView.tsx
    │   │       └── TripList.tsx
    │   ├── types/
    │   │   └── trip.ts
    │   ├── utils/
    │   │   └── safeUrl.ts
    │   └── vite-env.d.ts
    ├── tsconfig.json
    └── vite.config.ts

```

---

## 💻 Installation & Setup Guide

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **PostgreSQL**: Local or Cloud Instance

### 1. Database Setup

Ensure PostgreSQL is running and create a database (e.g., `globetrotter_db`).

### 2. Backend Initialization

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/globetrotter_db
PORT=5000
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Initialize the database schema and seed data:

```bash
npm run db:seed
```

Start the backend development server:

```bash
npm run dev
```

### 3. Frontend Initialization

```bash
cd frontend
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The application will launch on `http://localhost:5173`.

---

## 🔑 Environment Variables Reference

### Backend (`backend/.env`)

| Variable           | Description                  | Example            |
| :----------------- | :--------------------------- | :----------------- |
| `DATABASE_URL`     | PostgreSQL connection string | `postgresql://...` |
| `PORT`             | Backend API Port             | `5000`             |
| `JWT_SECRET`       | Secret key for JWT signing   | `super-secret-key` |
| `GROQ_API_KEY`     | Groq LLM API Key             | `gsk_...`          |
| `GOOGLE_CLIENT_ID` | OAuth2 Client ID             | `...`              |

---

## 📑 API Documentation Overview

The GlobeTrotter Express backend provides RESTful endpoints segregated into domain modules:

- `/api/auth/*` - Registration, login, and profile fetching
- `/api/cities/*` - City discovery and search
- `/api/activities/*` - Activity filtering by category/budget
- `/api/trips/*` - CRUD operations for trips and nested itinerary stops
- `/api/public/trips/*` - Read-only public sharing retrieval
- `/api/ai/*` - LLM prompt processing for the AI Planning Assistant

---

## 🤖 My AI Usage

I utilized AI tools effectively during the development of this platform:

- **Groq API**: Integrated directly into the platform to power the intelligent trip assistant for dynamic itinerary generation.
- **LLMs (ChatGPT / Claude)**: Used as pair-programming assistants to refine UI designs, structure the PostgreSQL database schema, debug complex state management issues in React, and rapidly boilerplate standard Express middleware components. All AI-generated logic was rigorously reviewed and tested before integration.
