
# PromptHub

PromptHub is a full-stack AI prompt library and optimization system where users can create, share, discover, rate, and discuss prompts. The project combines a React interface, an Express REST API, and a MySQL database that tracks prompt versions, tags, bookmarks, ratings, comments, and AI output quality data.

## Overview

PromptHub is designed as a collaborative hub for prompt engineering workflows. It lets users browse prompts by category, inspect prompt details, copy prompt text, review AI outputs, and contribute feedback through ratings and threaded comments.

The project also demonstrates core DBMS concepts through a relational MySQL schema, foreign-key constraints, triggers, views, stored procedures, transaction scripts, and sample data.

## Features

- Create and share prompts with titles, descriptions, categories, tags, and visibility settings
- Browse public prompts and filter them by category
- Search prompts by keywords
- View prompt details, tags, ratings, comments, and recorded AI outputs
- Rate prompts with a 1 to 5 star rating system
- Add comments and replies for community discussion
- Track prompt versions and AI output performance data
- View user profiles, reputation scores, created prompts, and bookmarks
- Use sample SQL data for quick database setup and testing

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Axios |
| Backend | Node.js, Express, CORS, dotenv |
| Database | MySQL, mysql2 |

## DBMS Concepts Demonstrated

- Relational schema with primary keys, foreign keys, indexes, and cascading rules
- Many-to-many prompt tagging through the `prompt_tag` junction table
- Nested comments through self-referencing comment relationships
- Triggers for rating validation, average rating updates, and user reputation updates
- Views for prompt-author data, high-rated prompts, and rating details
- Stored procedures using cursors
- Transaction examples with `START TRANSACTION`, `SAVEPOINT`, `COMMIT`, and `ROLLBACK`

## Project Structure

```text
.
|-- backend/                          # Express API and MySQL connection
|   |-- config/
|   |-- controllers/
|   |-- routes/
|   `-- scripts/setupDatabase.js
|-- frontend/                         # React application
|   `-- src/
|       |-- api/
|       |-- components/
|       `-- pages/
|-- ai_prompt_optimization_system.sql # Database schema
|-- sample_data.sql                   # Seed data
|-- triggers_and_views.sql            # MySQL triggers and views
|-- stored_procedures.sql             # Stored procedures
|-- transactions.sql                  # Transaction examples
`-- database_screenshot.png
```

## Database Model

The schema includes these main tables:

- `users`
- `category`
- `prompts`
- `prompt_version`
- `ratings`
- `comments`
- `tags`
- `prompt_tag`
- `bookmarks`
- `ai_outputs`

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js and npm
- MySQL Server
- MySQL command-line client or another MySQL client

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <your-project-folder>
```

### 2. Configure the Backend

Open the backend folder and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=ai_prompt_optimization_system
PORT=5000
```

### 3. Set Up the Database

From the `backend/` folder, run:

```bash
npm run db:setup
```

The setup script runs:

1. `ai_prompt_optimization_system.sql`
2. `sample_data.sql`
3. `triggers_and_views.sql`
4. `stored_procedures.sql`

You can also import these SQL files manually in MySQL if needed.

The `transactions.sql` file contains separate transaction demonstrations and is not run by the setup script.

### 4. Start the Backend

```bash
npm start
```

The backend API runs on:

```text
http://localhost:5000
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm start
```

The Vite development server will print the frontend URL in the terminal.

## Frontend Configuration

The frontend uses this API base URL by default:

```text
http://localhost:5000/api
```

To override it, create a frontend environment variable:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## API Endpoints

| Resource | Base Endpoint |
| --- | --- |
| Health Check | `/api/health` |
| Users | `/api/users` |
| Prompts | `/api/prompts` |
| Prompt Versions | `/api/prompt-versions` |
| Categories | `/api/categories` |
| Tags | `/api/tags` |
| Ratings | `/api/ratings` |
| Comments | `/api/comments` |
| Bookmarks | `/api/bookmarks` |
| AI Outputs | `/api/ai-outputs` |

## Current Limitations

- Authentication is not implemented yet; demo actions currently use a hardcoded `user_id`.
- Prompt lists do not currently use pagination.
- The UI is focused on the core project workflow and can be extended with more production-ready features.

## Future Improvements

- Add authentication and authorization
- Add pagination, sorting, and richer search filters
- Add prompt editing with visible version history controls
- Add tests for API routes and frontend flows
- Add deployment configuration for frontend, backend, and database hosting

## License

This project is intended for learning and academic use.
