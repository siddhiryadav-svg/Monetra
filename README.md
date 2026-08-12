# Monetra 💜

A personal finance dashboard for tracking cash flow, savings, and investments — built as a final-year BSc Data Science and AI project.

## Features

- **Cash Flow** — Track spending and income, view a donut chart breakdown, set expense limits, and create custom categories
- **Savings** — Set and track savings goals, monitor SIPs/Stocks, view a 6-month progress bar chart
- **Investments** — Live Nifty 50 stock prices (via yfinance), personal watchlist, sector-wise breakdown
- **Authentication** — Secure multi-user signup/login with hashed passwords
- **Export** — Download your data as PDF or CSV
- **Dark Mode** — Full dark theme support
- **Responsive Design** — Works on mobile and desktop
- **Dreamy Pastel Theme** — Custom purple/pink/teal color palette with Poppins + IBM Plex Sans fonts

## Tech Stack

**Backend:** FastAPI, SQLite, bcrypt (password hashing), yfinance (live stock data)
**Frontend:** React, Vite

## Project Structure

```
finance-dashboard/
├── main.py            # FastAPI backend entry point
├── venv/              # Python virtual environment
├── finance.db         # SQLite database
└── frontend/           # React + Vite frontend
```

## Setup & Installation

### Prerequisites

- Python 3.9+
- Node.js 16+

### Backend Setup

From the project root:

```bash
python -m venv venv
venv\Scripts\activate        # On Windows
# source venv/bin/activate   # On macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload
```

The backend will run at `http://localhost:8000`.

### Frontend Setup

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

### Running the App

Keep both terminals running simultaneously — the frontend talks to the backend API. Open `http://localhost:5173` in your browser once both servers are up.

## Author

Siddhi Yadav — BSc Data Science and Artificial Intelligence

---

*Built as a final-year academic project.*
