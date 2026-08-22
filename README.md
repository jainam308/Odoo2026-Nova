# GlobeTrotter
A personalized, intelligent, and collaborative multi-city trip planning platform built during an 8-hour hackathon. No monolithic shortcuts—just a modular PERN stack, real-time AI planning, and structured relational data.

✨ Features
- Multi-city itinerary building
- AI trip planning assistant powered by Groq LLM
- Automated trip budget estimation and breakdown
- Interactive calendar and timeline views
- Public trip sharing via read-only links
- Destination and activity discovery
- Admin & Analytics Dashboard
- Secure JWT-based authentication

🎯 Why We Built This
Planning multi-city travel is typically a fragmented experience involving spreadsheets, scattered bookmarks, and manual budgeting. 

We built GlobeTrotter to consolidate the complexity of trip planning into a single, intuitive interface. 

The goal was to demonstrate how a well-designed relational database paired with a microservices-inspired frontend and an AI module can seamlessly transform plain-language ideas into actionable, structured itineraries.

🏗️ Architecture
The system is divided into three distinct modules developed in parallel, plus an AI microservice.

                 Browser
                    │
                    ▼
           React Frontend (Vite)
                    │
      Routes Requests to Appropriate API
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
 Module A      Module B      Module C
 (Auth &      (Trips &      (Itinerary &
 Discovery)     Account)       Sharing)
       │            │            │
       └────────────┼────────────┘
                    ▼
          Express.js Backend API
                    │
             Database Router
                    │
                    ▼
            PostgreSQL Database

**AI Flow:**
User Prompt ➝ React Widget ➝ Python AI Service (Groq API) ➝ JSON Suggestion ➝ Module C API ➝ Database

Components

**Module A (Auth & Discovery)**
- Manages user authentication and JWT middleware
- Serves read-only destination (cities) and activity data

**Module B (Trip & Account)**
- Manages top-level trip creation and user accounts
- Calculates and visualizes budget data

**Module C (Itinerary & Sharing)**
- Handles the core itinerary builder (trip stops, scheduled activities)
- Renders the calendar/timeline and public share views

**AI Module**
- Standalone Python service that translates natural language into structured JSON
- Provides fallback responses for high availability during network hiccups

🔥 Engineering Challenges
Building a simple CRUD app is easy. 

Building a complex, multi-module relational app in 8 hours without stepping on each other's toes is much harder.

1. Parallel Development & Database Dependencies
**Problem**
Module C (Itinerary) depended on the existence of Trips (Module B) and Cities/Activities (Module A). Module B depended on Users (Module A).

**Solution**
Strict API contracts and mock data. We agreed on a shared JSON contract in hour 1. Developers built their UI against hardcoded mock JSON, swapping in the real API endpoints once the underlying modules were merged.

2. AI Hallucinations vs. Structured UI
**Problem**
The frontend needed exact, structured data to render the "Add to Trip" buttons, but LLMs often return prose, markdown fences, or unpredictable JSON schemas.

**Solution**
We implemented a strict system prompt instructing the Groq model to return ONLY valid JSON in a predefined shape, matching Module C's `stop_activities` API exactly. We also added a hardcoded fallback response that fires if the LLM errors or times out, ensuring the demo never freezes.

3. Shared Design System Integrity
**Problem**
With three developers building screens simultaneously, preventing visual drift and CSS conflicts was a massive risk.

**Solution**
We established a shared design system of CSS variables (theme tokens) and core React components (Buttons, Cards, Inputs) during the kickoff sync. No one was allowed to introduce new colors, fonts, or border radii outside these tokens.

🚀 Getting Started
Requirements
- Java 17+ (If modifying legacy bits, though currently using Node/Python)
- Node.js 18+
- Python 3.9+
- PostgreSQL
- Groq API Key

1. Database Setup
```bash
cd backend
npm install
node src/db-setup.js
```
*(Executes `schema.sql` and `seed.sql` to populate the DB)*

2. Start the Backend (Node.js)
```bash
npm run dev
```
*(Runs on port 5000. Requires `DATABASE_URL` and `JWT_SECRET` in `.env`)*

3. Start the AI Module (Python)
```bash
cd ai-module
python -m venv venv
# Activate venv (e.g., source venv/bin/activate on Mac/Linux or .\venv\Scripts\activate on Windows)
pip install -r requirements.txt
python app.py
```
*(Requires `GROQ_API_KEY` in `.env`)*

4. Start the Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
*(Runs on port 5173)*

Open your browser:
http://localhost:5173

⚙️ Technologies Used
Core
- React (Vite)
- Node.js & Express
- PostgreSQL
- Python (FastAPI/Flask)

Concepts
- Relational Database Design
- Micro-frontend architecture concepts
- JWT Authentication
- Prompt Engineering & LLM Integration
- RESTful API Design

🚧 Future Improvements
- Interactive drag-and-drop itinerary reordering
- Real social-media share integrations
- Google Maps API integration for routing
- WebSocket support for real-time collaborative planning
- User photo uploads via AWS S3

📚 What We Learned
Building this project helped us gain hands-on experience with:
- Contract-driven parallel development
- Managing relational database complexities
- Integrating AI safely into structured applications
- Enforcing design system constraints in a team
- Rapid prototyping and time management

📜 License
This project is open source and intended for educational purposes.
