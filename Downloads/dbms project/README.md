# PromptHub – AI Prompt Performance & Optimization System

PromptHub is a robust full-stack application designed to create, rate, share, and optimize AI prompts across multiple models. It serves as a collaborative hub for tracking version history, community feedback, and AI output quality metrics.

## Tech Stack
* **React** (Frontend UI)
* **Node.js** (Backend Runtime)
* **Express** (REST API framework)
* **MySQL** (Relational Database)
* **Axios** (HTTP Client)

## Setup Instructions

### Backend
1. Navigate to the backend directory:
   `cd backend`
2. Install dependencies:
   `npm install`
3. Create a `.env` file in the root of the backend directory with the following variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=ai_prompt_optimization_system
   PORT=5000
   ```
4. Start the server:
   `npm start`

### Frontend
1. Navigate to the frontend directory:
   `cd frontend`
2. Install dependencies:
   `npm install`
3. Start the development server:
   `npm start`

### Database
1. Import the SQL schema using your preferred MySQL client.
2. Run the provided sample data script to populate the database with initial categories, users, and tags.
3. **Note:** The database relies on 3 specific triggers, 3 optimized views, and 5 stored transaction procedures which are critical for relational integrity.

## API Endpoints

* **Users**: `/api/users`
* **Prompts**: `/api/prompts`
* **Ratings**: `/api/ratings`
* **Comments**: `/api/comments`
* **Tags**: `/api/tags`
* **Bookmarks**: `/api/bookmarks`
* **AI Outputs**: `/api/ai-outputs`
* **Categories**: `/api/categories`
* **Prompt Versions**: `/api/prompt-versions`
* **Health Check**: `/api/health`

## Features
* **Create Prompts**: Share detailed AI workflows with categories and tags.
* **Version Tracking**: Track structural changes to prompts over time.
* **Ratings & Comments**: Community-driven nested discussions and 5-star quality ratings.
* **Tagging System**: Dynamically link and filter prompts by relevant topics.
* **Search**: Keyword-based full-text querying of prompts.
* **User Profiles**: Track individual contributions, reputation scores, and bookmarked items.

## Known Limitations
* **No Authentication**: The `user_id` is currently hardcoded (e.g., `user_id = 1`) for demonstration purposes.
* **No Pagination**: Lists and grids load fully in a single batch.
* **Basic UI Styling**: Minimalistic CSS without external UI frameworks.
