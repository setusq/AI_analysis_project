# AI Research Tracking Platform

A comprehensive web application for tracking and analyzing IT and AI research developments worldwide.

## Features

- Track research and development projects in IT and AI
- Store detailed information about projects, organizations, and people
- Visualize data through interactive charts and maps
- Filter and search through project database
- Manage reference lists for technologies, stages, and regions

## Tech Stack

- Backend: FastAPI (Python)
- Frontend: React with TypeScript
- Database: PostgreSQL
- ORM: SQLAlchemy
- Migrations: Alembic
- Visualization: D3.js, Chart.js

## Setup Instructions

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```
5. Initialize the database:
   ```bash
   alembic upgrade head
   ```
6. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Project Structure

```
.
├── app/                    # Backend application
│   ├── api/               # API endpoints
│   ├── core/              # Core functionality
│   ├── db/                # Database models and migrations
│   ├── schemas/           # Pydantic models
│   └── services/          # Business logic
├── frontend/              # React frontend
├── alembic/               # Database migrations
└── docker/                # Docker configuration
```

## License

MIT 